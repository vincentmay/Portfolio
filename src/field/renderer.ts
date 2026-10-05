/**
 * The field renderer.
 *
 * One pass draws the grains as soft points, a second draws the fast ones as
 * short segments of their own recent motion, and a small post chain adds the
 * halation, grain and vignette that make it look photographed rather than
 * computed. No dependencies, no scene graph — it is one buffer of dust.
 */

import {
  BLUR_FRAG,
  BRIGHT_FRAG,
  COMPOSITE_FRAG,
  PARTICLE_FRAG,
  PARTICLE_VERT,
  QUAD_VERT,
  STREAK_FRAG,
} from "./shaders.ts";
import { SHAPE_COUNT, buildField } from "./shapes.ts";

export type FieldFrame = {
  /** Blend weight per shape, in SHAPE_NAMES order. Should sum to 1. */
  weights: Float32Array;
  /** 0 at rest, 1 at the middle of a transition. */
  morph: number;
  /** Seconds of motion each streak covers. 0 disables the pass. */
  streak: number;
  yaw: number;
  pitch: number;
  offsetX: number;
  offsetY: number;
  /** Global presence of the field, 0..1. */
  fade: number;
  exposure: number;
  bloom: number;
};

export type FieldRenderer = {
  resize(cssWidth: number, cssHeight: number): void;
  draw(time: number, frame: FieldFrame): void;
  dispose(): void;
  readonly count: number;
};

const INK: [number, number, number] = [1.0, 0.985, 0.93];
const WARM: [number, number, number] = [1.0, 0.988, 0.945];
const FOV = 42;
const CAM_Z = 3.05;
const SPIN = 0.055;

/**
 * The dials worth reaching for first.
 *
 * `pointGain` is the one that decides whether the field reads as glowing dust
 * or as a grey smear: it is the additive brightness of a single grain, and the
 * tone curve in the composite pass turns anything above roughly 1.0 accumulated
 * into blown-out white. Raise it if the object looks washed out, lower it if
 * detail is disappearing into a solid shape.
 */
const TUNING = {
  /** World-space radius of one grain, at a scene roughly one unit across. */
  grain: 0.0045,
  /** Extra radius while a transition is in flight. */
  grainMorph: 0.0026,
  pointGain: 0.75,
  streakGain: 0.22,
  /** Share of the cloud that also gets drawn as a motion streak. */
  streakShare: 0.4,
  bloomThreshold: 0.3,
  filmGrain: 0.055,
};

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string) {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`program: ${log}`);
  }
  return program;
}

function uniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const map = new Map<string, WebGLUniformLocation | null>();
  const total = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < total; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    const name = info.name.replace(/\[0\]$/, "");
    map.set(name, gl.getUniformLocation(program, info.name));
  }
  return (name: string) => map.get(name) ?? null;
}

function perspective(aspect: number) {
  const f = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);
  const near = 0.1;
  const far = 24;
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ]);
}

type Target = { fbo: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

export type RendererOptions = { count: number; dpr: number };

export function createFieldRenderer(
  canvas: HTMLCanvasElement,
  options: RendererOptions,
): FieldRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  return gl ? build(gl, canvas, options) : null;
}

function build(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  options: RendererOptions,
): FieldRenderer {
  const float = gl.getExtension("EXT_color_buffer_float");
  const internal = float ? gl.RGBA16F : gl.RGBA8;
  const type = float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

  const count = options.count;
  const field = buildField(count);

  /* ---------------------------------------------------------- programs */

  const pointProgram = link(gl, PARTICLE_VERT, PARTICLE_FRAG);
  const streakProgram = link(gl, PARTICLE_VERT, STREAK_FRAG);
  const brightProgram = link(gl, QUAD_VERT, BRIGHT_FRAG);
  const blurProgram = link(gl, QUAD_VERT, BLUR_FRAG);
  const compositeProgram = link(gl, QUAD_VERT, COMPOSITE_FRAG);

  const uPoint = uniforms(gl, pointProgram);
  const uStreakU = uniforms(gl, streakProgram);
  const uBright = uniforms(gl, brightProgram);
  const uBlur = uniforms(gl, blurProgram);
  const uComp = uniforms(gl, compositeProgram);

  /* ----------------------------------------------------------- buffers */

  const ATTRIBS = ["aMark", "aDisc", "aSpiral", "aOrrery", "aBurst"] as const;
  const shapeBuffers = field.positions.map((data) => {
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  });

  // Four of the eight seeds are enough for the shader; the rest only shaped the
  // geometry on the CPU.
  const seedData = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seedData[i * 4] = field.seeds[i * 8 + 1];
    seedData[i * 4 + 1] = field.seeds[i * 8 + 3];
    seedData[i * 4 + 2] = field.seeds[i * 8 + 5];
    seedData[i * 4 + 3] = field.seeds[i * 8 + 6];
  }
  const seedBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, seedData, gl.STATIC_DRAW);

  const endBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, endBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1]), gl.STATIC_DRAW);

  const locOf = (program: WebGLProgram, name: string) => gl.getAttribLocation(program, name);

  function makeVao(program: WebGLProgram, instanced: boolean) {
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    ATTRIBS.forEach((name, i) => {
      const loc = locOf(program, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffers[i]);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(loc, instanced ? 1 : 0);
    });
    const seedLoc = locOf(program, "aSeed");
    if (seedLoc >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
      gl.enableVertexAttribArray(seedLoc);
      gl.vertexAttribPointer(seedLoc, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(seedLoc, instanced ? 1 : 0);
    }
    const endLoc = locOf(program, "aEnd");
    if (endLoc >= 0) {
      if (instanced) {
        gl.bindBuffer(gl.ARRAY_BUFFER, endBuffer);
        gl.enableVertexAttribArray(endLoc);
        gl.vertexAttribPointer(endLoc, 1, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(endLoc, 0);
      } else {
        gl.disableVertexAttribArray(endLoc);
      }
    }
    gl.bindVertexArray(null);
    return { vao, endLoc };
  }

  const points = makeVao(pointProgram, false);
  const streaks = makeVao(streakProgram, true);
  const emptyVao = gl.createVertexArray()!;

  /* ------------------------------------------------------------ targets */

  function makeTarget(w: number, h: number): Target {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fbo, tex, w, h };
  }

  function dropTarget(t: Target | null) {
    if (!t) return;
    gl.deleteTexture(t.tex);
    gl.deleteFramebuffer(t.fbo);
  }

  let scene: Target | null = null;
  let blurA: Target | null = null;
  let blurB: Target | null = null;
  let width = 1;
  let height = 1;
  let proj = perspective(1);
  /** Framebuffer pixels per world unit at unit distance. */
  let focal = 1;

  function resize(cssWidth: number, cssHeight: number) {
    const dpr = options.dpr;
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    // On phones the address bar slides in and out constantly. Reallocating the
    // whole target chain for that costs more than the slight aspect error of
    // riding it out, so small height-only changes on narrow screens are ignored.
    const slack = cssWidth < 900 ? 120 * dpr : 0;
    if (scene && w === width && Math.abs(h - height) <= slack) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    proj = perspective(w / h);
    focal = h / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);

    dropTarget(scene);
    dropTarget(blurA);
    dropTarget(blurB);
    scene = makeTarget(w, h);
    const bw = Math.max(1, w >> 2);
    const bh = Math.max(1, h >> 2);
    blurA = makeTarget(bw, bh);
    blurB = makeTarget(bw, bh);
  }

  /* -------------------------------------------------------------- draw */

  const fullQuad = () => {
    gl.bindVertexArray(emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let drawCount = count;
  let slowFrames = 0;

  function draw(time: number, frame: FieldFrame) {
    if (!scene || !blurA || !blurB) return;
    const started = performance.now();

    const setCommon = (u: (n: string) => WebGLUniformLocation | null, streak: number) => {
      gl.uniform1fv(u("uW"), frame.weights);
      gl.uniform1f(u("uTime"), time);
      gl.uniform1f(u("uMorph"), frame.morph);
      gl.uniform1f(u("uStreak"), streak);
      gl.uniform1f(u("uSpin"), SPIN);
      gl.uniform2f(u("uTilt"), frame.yaw, frame.pitch);
      gl.uniform2f(u("uOffset"), frame.offsetX, frame.offsetY);
      gl.uniformMatrix4fv(u("uProj"), false, proj);
      gl.uniform1f(u("uCamZ"), CAM_Z);
      gl.uniform1f(u("uFade"), frame.fade);
      gl.uniform3f(u("uInk"), INK[0], INK[1], INK[2]);
    };

    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fbo);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    const grain = (TUNING.grain + TUNING.grainMorph * frame.morph) * focal;

    gl.useProgram(pointProgram);
    setCommon(uPoint, 0);
    gl.uniform1f(uPoint("uSize"), grain);
    gl.uniform1f(uPoint("uGain"), TUNING.pointGain);
    gl.bindVertexArray(points.vao);
    if (points.endLoc >= 0) gl.vertexAttrib1f(points.endLoc, 1.0);
    gl.drawArrays(gl.POINTS, 0, drawCount);

    if (frame.streak > 0.0005) {
      gl.useProgram(streakProgram);
      setCommon(uStreakU, frame.streak);
      gl.uniform1f(uStreakU("uSize"), grain);
      gl.uniform1f(uStreakU("uGain"), TUNING.streakGain * (1 + frame.morph * 0.6));
      gl.bindVertexArray(streaks.vao);
      gl.drawArraysInstanced(gl.LINES, 0, 2, Math.floor(drawCount * TUNING.streakShare));
    }

    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, blurA.fbo);
    gl.viewport(0, 0, blurA.w, blurA.h);
    gl.useProgram(brightProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, scene.tex);
    gl.uniform1i(uBright("uSrc"), 0);
    gl.uniform1f(uBright("uThreshold"), TUNING.bloomThreshold);
    fullQuad();

    gl.useProgram(blurProgram);
    gl.uniform1i(uBlur("uSrc"), 0);
    for (let pass = 0; pass < 2; pass++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, blurB.fbo);
      gl.bindTexture(gl.TEXTURE_2D, blurA.tex);
      gl.uniform2f(uBlur("uStep"), (1 + pass) / blurA.w, 0);
      fullQuad();
      gl.bindFramebuffer(gl.FRAMEBUFFER, blurA.fbo);
      gl.bindTexture(gl.TEXTURE_2D, blurB.tex);
      gl.uniform2f(uBlur("uStep"), 0, (1 + pass) / blurA.h);
      fullQuad();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.useProgram(compositeProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, scene.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blurA.tex);
    gl.uniform1i(uComp("uScene"), 0);
    gl.uniform1i(uComp("uBloom"), 1);
    gl.uniform2f(uComp("uRes"), width, height);
    gl.uniform1f(uComp("uTime"), time);
    gl.uniform1f(uComp("uBloomGain"), frame.bloom);
    gl.uniform1f(uComp("uExposure"), frame.exposure);
    gl.uniform1f(uComp("uGrain"), TUNING.filmGrain);
    gl.uniform1f(uComp("uAspect"), width / height);
    gl.uniform3f(uComp("uWarm"), WARM[0], WARM[1], WARM[2]);
    fullQuad();
    gl.bindVertexArray(null);

    // Give ground on particle count rather than on frame rate.
    const cost = performance.now() - started;
    if (cost > 12) {
      if (++slowFrames > 30 && drawCount > count * 0.35) {
        drawCount = Math.floor(drawCount * 0.8);
        slowFrames = 0;
      }
    } else {
      slowFrames = Math.max(0, slowFrames - 1);
    }
  }

  function dispose() {
    dropTarget(scene);
    dropTarget(blurA);
    dropTarget(blurB);
    shapeBuffers.forEach((b) => gl.deleteBuffer(b));
    gl.deleteBuffer(seedBuffer);
    gl.deleteBuffer(endBuffer);
    gl.deleteVertexArray(points.vao);
    gl.deleteVertexArray(streaks.vao);
    gl.deleteVertexArray(emptyVao);
    [pointProgram, streakProgram, brightProgram, blurProgram, compositeProgram].forEach((p) =>
      gl.deleteProgram(p),
    );
    // Deliberately not calling WEBGL_lose_context here: a canvas only ever hands
    // out one context, so losing it would leave a remount — StrictMode's double
    // effect invocation, for one — with a dead context and nothing on screen.
  }

  if (SHAPE_COUNT !== 5) throw new Error("shader expects five states");

  return { resize, draw, dispose, count };
}
