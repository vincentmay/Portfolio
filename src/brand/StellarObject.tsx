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
    let visible = false;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const start = async (current: number) => {
      try {
        const { createStellar } = await import("./stellar-webgl");
        if (!cancelled && current === generation && visible && !document.hidden)
          dispose = createStellar(element);
      } catch {
        // The matching poster remains visible if WebGL cannot be initialized.
      }
    };
    const change = () => {
      const current = ++generation;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      if (preference.matches || connection?.saveData) {
        dispose?.();
        dispose = undefined;
        return;
      }
      if (dispose || !visible || document.hidden) return;
      // The matching poster is visible immediately; GPU work waits for paint.
      if (typeof window.requestIdleCallback === "function")
        idle = window.requestIdleCallback(() => void start(current), { timeout: 700 });
      else timer = window.setTimeout(() => void start(current), 120);
    };
    preference.addEventListener("change", change);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      change();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", change);
    return () => {
      cancelled = true;
      generation++;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      dispose?.();
      observer.disconnect();
      preference.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", change);
    };
  }, []);
  return (
    <div className="stellar-object" ref={host} aria-hidden="true">
      <img className="stellar-fallback" src="/stellar.webp" width="600" height="600" alt="" decoding="async" fetchPriority="high" />
    </div>
  );
}
