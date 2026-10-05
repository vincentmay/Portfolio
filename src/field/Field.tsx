import { useEffect, useRef, useState } from "react";
import { createFieldRenderer, type FieldRenderer } from "./renderer.ts";
import { STAGES, budgetFor, frameFor, positionFromAnchors } from "./scene.ts";

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Mounts the field behind the page and drives it from scroll and pointer.
 *
 * Nothing in here touches React state per frame — the loop reads mutable refs
 * and writes to the GPU, so scrolling never re-renders the tree.
 */
export function Field() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    let renderer: FieldRenderer | null = null;
    try {
      renderer = createFieldRenderer(canvas, {
        count: budgetFor(window.innerWidth, window.innerHeight, dpr),
        dpr: motion.matches ? Math.min(dpr, 1.5) : dpr,
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      renderer = null;
    }
    if (!renderer) {
      setFailed(true);
      return;
    }
    const field = renderer;

    /* ------------------------------------------------------- inputs */

    let anchors: number[] = [];
    const measure = () => {
      const half = window.innerHeight / 2;
      anchors = STAGES.map((stage) => {
        const el = document.getElementById(stage.id);
        if (!el) return 0;
        const box = el.getBoundingClientRect();
        return box.top + window.scrollY + box.height / 2 - half;
      });
      // Anchors must increase for the interpolation to make sense.
      for (let i = 1; i < anchors.length; i++) {
        anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
      }
      field.resize(window.innerWidth, window.innerHeight);
    };

    let target = 0;
    let position = 0;
    let energy = 0;
    let lastScroll = window.scrollY;
    let pointerX = 0;
    let pointerY = 0;
    let aimX = 0;
    let aimY = 0;
    let presence = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - lastScroll);
      lastScroll = y;
      energy = Math.min(1, energy + delta / 900);
      target = positionFromAnchors(y, anchors);
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      aimX = (event.clientX / window.innerWidth) * 2 - 1;
      aimY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    /* --------------------------------------------------------- loop */

    let raf = 0;
    let running = true;
    let previous = performance.now();
    let drawnAt = Number.NaN;

    const still = () => motion.matches;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;

      const smooth = still() ? 1 : 1 - Math.exp(-dt * 4.5);
      position += (target - position) * smooth;
      pointerX += (aimX - pointerX) * (1 - Math.exp(-dt * 2.5));
      pointerY += (aimY - pointerY) * (1 - Math.exp(-dt * 2.5));
      presence += (1 - presence) * (1 - Math.exp(-dt * 1.2));
      energy *= Math.exp(-dt * 2.6);

      // With reduced motion the field holds still, so there is nothing to
      // redraw until the reader moves to another section.
      if (still() && Math.abs(position - drawnAt) < 0.0005) return;
      drawnAt = position;

      const narrow = window.innerWidth < 900;
      const frame = frameFor({
        position,
        energy: still() ? 0 : energy,
        pointerX: still() ? 0 : pointerX,
        pointerY: still() ? 0 : pointerY,
        spread: narrow ? 0.25 : 1,
        presence: (narrow ? 0.72 : 1) * (still() ? 1 : presence),
      });
      if (still()) frame.streak = 0;

      field.draw(still() ? 0 : now / 1000, frame);
    };

    // A GPU reset, or a phone reclaiming memory from a backgrounded tab, takes
    // the context away without warning. Preventing the default keeps the canvas
    // eligible for restore, but rather than juggle a half-live renderer we hand
    // over to the static fallback, which loses nothing but the motion.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      setFailed(true);
    };

    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      if (hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!hidden && !running) {
        running = true;
        previous = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    measure();
    onScroll();
    position = target;
    if (still()) presence = 1;
    raf = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      field.dispose();
    };
  }, []);

  return (
    <div className="field" aria-hidden="true">
      {failed ? <div className="field-fallback" /> : <canvas ref={canvasRef} className="field-canvas" />}
      <div className="field-veil">
        <div className="veil-base" />
        <div className="veil-left" />
        <div className="veil-right" />
        <div className="veil-foot" />
      </div>
    </div>
  );
}
