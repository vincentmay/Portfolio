/** GLSL for the field. WebGL2 / GLSL ES 3.00. */

/**
 * Every particle carries its position in all five states and blends between
 * them with the weights the scroll position hands down. The same function is
 * evaluated twice per vertex — once at `uTime` and once slightly earlier — so
 * the line pass can draw each grain as a short arc of its own motion. That is
 * where the light-streak smear comes from.
 */
export const PARTICLE_VERT = /* glsl */ `#version 300 es
precision highp float;

in vec3 aMark;
in vec3 aDisc;
in vec3 aSpiral;
in vec3 aOrrery;
in vec3 aBurst;
in vec4 aSeed;
in float aEnd;

uniform float uW[5];
uniform float uTime;
uniform float uMorph;
uniform float uStreak;
uniform float uSpin;
uniform vec2 uTilt;
uniform vec2 uOffset;
uniform mat4 uProj;
uniform float uCamZ;
/** Grain radius already multiplied by the focal length, in framebuffer pixels. */
uniform float uSize;
uniform float uFade;

out float vAlpha;
out float vHeat;

vec3 blend() {
  return uW[0] * aMark
       + uW[1] * aDisc
       + uW[2] * aSpiral
       + uW[3] * aOrrery
       + uW[4] * aBurst;
}

vec3 place(vec3 base, float t) {
  vec3 dir = normalize(aSeed.xyz * 2.0 - 1.0 + 1e-4);
  vec3 p = base;

  // Mid-transition the cloud is thrown apart and pulled back together. Without
  // this the morph is a straight line between two shapes and reads as a wipe.
  float throwOut = uMorph * (0.09 + 0.40 * aSeed.w);
  p += dir * throwOut * (0.75 + 0.25 * sin(t * 0.7 + aSeed.w * 6.283));
  p *= 1.0 + uMorph * 0.09;

  // A slow breath so a settled state is never completely still.
  p += dir * 0.011 * sin(t * 0.33 + aSeed.w * 12.0);

  float yaw = uSpin * t + uTilt.x;
  float cy = cos(yaw), sy = sin(yaw);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);

  float pitch = uTilt.y;
  float cp = cos(pitch), sp = sin(pitch);
  p = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);

  return p;
}

void main() {
  vec3 base = blend();
  vec3 head = place(base, uTime);
  vec3 tail = place(base, uTime - uStreak);
  vec3 p = mix(tail, head, aEnd);

  vec4 view = vec4(p, 1.0);
  view.z -= uCamZ;
  vec4 clip = uProj * view;
  clip.xy += uOffset * clip.w;
  gl_Position = clip;

  float dist = max(0.35, clip.w);
  gl_PointSize = clamp(uSize / dist, 0.85, 40.0);

  // Grains further from the camera dim, so the cloud keeps its volume.
  // smoothstep needs its edges in ascending order, hence the inversions.
  float depth = 1.0 - smoothstep(uCamZ - 1.4, uCamZ + 1.9, dist);
  // On the streak pass the tail end fades out; on the point pass aEnd is 1.
  float taper = step(0.0001, uStreak) * 0.85;
  vAlpha = uFade * mix(0.35, 1.0, depth) * mix(1.0, aEnd, taper);
  vHeat = (1.0 - smoothstep(-0.9, 0.9, dist - uCamZ)) * (0.4 + 0.6 * aSeed.w);
}
`;

/** Round, soft grain. */
export const PARTICLE_FRAG = /* glsl */ `#version 300 es
precision highp float;

in float vAlpha;
in float vHeat;
uniform vec3 uInk;
uniform float uGain;
out vec4 outColor;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d) * 4.0;
  if (r2 > 1.0) discard;
  float a = exp(-r2 * 3.1) * vAlpha * uGain;
  vec3 ink = mix(uInk, uInk * vec3(1.0, 0.955, 0.855), vHeat);
  outColor = vec4(ink * a, a);
}
`;

/** The smear pass: no sprite, alpha already tapers along the segment. */
export const STREAK_FRAG = /* glsl */ `#version 300 es
precision highp float;

in float vAlpha;
in float vHeat;
uniform vec3 uInk;
uniform float uGain;
out vec4 outColor;

void main() {
  float a = vAlpha * uGain;
  vec3 ink = mix(uInk, uInk * vec3(1.0, 0.955, 0.855), vHeat);
  outColor = vec4(ink * a, a);
}
`;

export const QUAD_VERT = /* glsl */ `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/** Keep only what is already close to blowing out, at quarter resolution. */
export const BRIGHT_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uSrc;
uniform float uThreshold;
out vec4 outColor;

void main() {
  vec3 c = texture(uSrc, vUv).rgb;
  float l = max(max(c.r, c.g), c.b);
  outColor = vec4(c * smoothstep(uThreshold, uThreshold + 0.45, l), 1.0);
}
`;

export const BLUR_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uSrc;
uniform vec2 uStep;
out vec4 outColor;

const float W[5] = float[5](0.2270270, 0.1945945, 0.1216216, 0.0540540, 0.0162162);

void main() {
  vec3 sum = texture(uSrc, vUv).rgb * W[0];
  for (int i = 1; i < 5; i++) {
    vec2 o = uStep * float(i) * 1.35;
    sum += texture(uSrc, vUv + o).rgb * W[i];
    sum += texture(uSrc, vUv - o).rgb * W[i];
  }
  outColor = vec4(sum, 1.0);
}
`;

/**
 * Scene + halation, then the film: warm cast, grain, faint horizontal
 * interference and a vignette. This is what turns clean GPU dust into
 * something that looks photographed.
 */
export const COMPOSITE_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2 uRes;
uniform float uTime;
uniform float uBloomGain;
uniform float uExposure;
uniform float uGrain;
uniform float uAspect;
uniform vec3 uWarm;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

void main() {
  vec3 scene = texture(uScene, vUv).rgb;
  vec3 bloom = texture(uBloom, vUv).rgb;
  vec3 c = scene + bloom * uBloomGain;

  c = vec3(1.0) - exp(-c * uExposure);
  c *= uWarm;

  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float g = hash(vUv * uRes + fract(uTime) * 137.0);
  c += (g - 0.5) * uGrain * (0.30 + 0.70 * (1.0 - luma));

  // Scan interference, barely there — it only shows up in the blown-out areas.
  c *= 1.0 - 0.035 * luma * (0.5 + 0.5 * sin(vUv.y * uRes.y * 1.7 + uTime * 2.0));

  vec2 v = (vUv - 0.5) * vec2(uAspect, 1.0);
  c *= 1.0 - smoothstep(0.30, 1.55, length(v) * 1.15);

  outColor = vec4(max(c, 0.0), 1.0);
}
`;
