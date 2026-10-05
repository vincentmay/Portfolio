/** Settle into a destination without animating across an unrelated page. */
export function settleScroll(top: number, smooth: boolean) {
  const target = Math.max(0, Math.min(top, document.documentElement.scrollHeight - innerHeight));
  const animate = smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const from = animate ? Math.max(0, target - 48) : target;
  scrollTo({ top: from, behavior: "instant" });
  if (!animate) return () => {};

  const started = performance.now();
  let frame = 0;
  const cancel = () => {
    cancelAnimationFrame(frame);
    for (const event of ["wheel", "touchstart", "pointerdown", "keydown"])
      window.removeEventListener(event, cancel);
  };
  const tick = (now: number) => {
    const progress = Math.max(0, Math.min(1, (now - started) / 220));
    const eased = 1 - (1 - progress) ** 3;
    scrollTo({ top: from + (target - from) * eased, behavior: "instant" });
    if (progress < 1) frame = requestAnimationFrame(tick);
    else cancel();
  };
  // Only animate this short navigation finish. Any user input takes over.
  for (const event of ["wheel", "touchstart", "pointerdown", "keydown"])
    window.addEventListener(event, cancel, { passive: true });
  frame = requestAnimationFrame(tick);
  return cancel;
}
