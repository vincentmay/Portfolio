import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Short wheel easing over the native document, with native touch and keyboard. */
export function SmoothScroll() {
  const pathname = useLocation({ select: (location) => location.pathname });
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    const interrupt = () => {
      if (lenis?.isScrolling === "smooth")
        lenis.scrollTo(lenis.actualScroll, { immediate: true });
    };
    const start = () => {
      lenis?.destroy();
      lenis = undefined;
      if (preference.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        duration: 0.28,
        lerp: 0,
        easing: (t) => 1 - (1 - t) ** 3,
        syncTouch: false,
        autoToggle: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        // Leave zoom gestures, horizontal gestures and native modal scrolling alone.
        virtualScroll: ({ event, deltaX, deltaY }) =>
          !event.shiftKey && Math.abs(deltaY) >= Math.abs(deltaX) &&
          !document.querySelector("dialog[open]"),
      });
    };
    start();
    preference.addEventListener("change", start);
    window.addEventListener("keydown", interrupt);
    window.addEventListener("pointerdown", interrupt, { passive: true });
    // Stop wheel inertia before section links or gallery controls start scrolling.
    document.addEventListener("click", interrupt, true);
    return () => {
      lenis?.destroy();
      preference.removeEventListener("change", start);
      window.removeEventListener("keydown", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      document.removeEventListener("click", interrupt, true);
    };
  }, [pathname]);
  return null;
}
