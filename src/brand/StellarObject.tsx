import { useEffect, useRef } from "react";

export function StellarObject() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current!;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let generation = 0;
    let dispose: (() => void) | undefined;
    let idle: number | undefined;
    let timer: number | undefined;
    const start = async (current: number) => {
      try {
        const { createStellar } = await import("./stellar-webgl");
        if (!cancelled && current === generation)
          dispose = createStellar(element, preference.matches);
      } catch {
        // The matching poster remains visible if WebGL cannot be initialized.
      }
    };
    const change = () => {
      const current = ++generation;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      dispose?.();
      dispose = undefined;
      if (preference.matches) return;
      // The matching poster is visible immediately; GPU work waits for paint.
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(() => void start(current), { timeout: 700 });
      else timer = window.setTimeout(() => void start(current), 120);
    };
    preference.addEventListener("change", change);
    change();
    return () => {
      cancelled = true;
      generation++;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      dispose?.();
      preference.removeEventListener("change", change);
    };
  }, []);
  return (
    <div className="stellar-object" ref={host} aria-hidden="true">
      <img className="stellar-fallback" src="/stellar.webp" width="600" height="600" alt="" decoding="async" fetchPriority="high" />
    </div>
  );
}
