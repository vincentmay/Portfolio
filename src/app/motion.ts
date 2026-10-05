import { useEffect, useRef } from "react";
import { createWorkJourney } from "./work-journey";
const clamp = (v: number) => Math.max(0, Math.min(1, v));

function layoutTop(element: HTMLElement, root: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/** One native-scroll frame, stable geometry, and a direction-independent playhead. */
export function usePortfolioMotion(key: string, workProjectId?: string, smoothWorkReturn = false) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current!;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    let showProject = (id: string, _smooth = false) => {
      const row = [...element.querySelectorAll<HTMLElement>(".work-row")]
        .find((row) => row.id === `work-${id}`);
      row?.scrollIntoView({ block: "start", behavior: "instant" });
    };
    const start = () => {
      stop();
      if (preference.matches) return;
      const journey = createWorkJourney(element);
      if (journey) showProject = journey.showProject;
      const star = element.querySelector<HTMLElement>(".stellar-object");
      const reveals = [
        ...element.querySelectorAll<HTMLElement>("[data-reveal]"),
      ];
      const stages = [
        ...element.querySelectorAll<HTMLElement>("[data-image-stage]"),
      ];
      let geometry: { el: HTMLElement; y: number }[] = [];
      let frame = 0,
        needsMeasure = true,
        active = true;
      element.classList.add("motion-ready");
      const update = () => {
        frame = 0;
        const height = innerHeight,
          scroll = scrollY;
        if (needsMeasure) {
          journey?.measure();
          geometry = reveals.map((el) => ({ el, y: layoutTop(el, element) }));
          needsMeasure = false;
        }
        journey?.draw(scroll);
        if (star) star.dataset.scrollPose = String(clamp(scroll / height));
        const max = document.documentElement.scrollHeight - height;
        element.style.setProperty(
          "--page-progress",
          String(max > 0 ? scroll / max : 0),
        );
        for (const { el, y } of geometry) {
          // Small, scrubbed entrances: reversing scroll restores the exact same state.
          el.style.setProperty(
            "--reveal",
            String(clamp((scroll + height * 0.9 - y) / (height * 0.3))),
          );
        }
        for (const stage of stages) {
          const box = stage.getBoundingClientRect();
          stage.style.setProperty(
            "--stage-enter",
            String(clamp((height - box.top) / (height * 0.6))),
          );
        }
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      const resize = () => {
        needsMeasure = true;
        schedule();
      };
      const sizes = new ResizeObserver(resize);
      sizes.observe(element);
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", resize);
      void document.fonts.ready.then(() => {
        if (active) resize();
      });
      update();
      stop = () => {
        active = false;
        sizes.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", resize);
        journey?.stop();
        if (star) delete star.dataset.scrollPose;
        element.classList.remove("motion-ready");
        reveals.forEach((el) => el.style.removeProperty("--reveal"));
        stages.forEach((el) => el.style.removeProperty("--stage-enter"));
        element.style.removeProperty("--page-progress");
      };
    };
    start();
    // The gallery maps vertical scroll to horizontal cards. Restore its selected
    // project after measuring; native hash scrolling cannot identify that offset.
    if (workProjectId) showProject(workProjectId, smoothWorkReturn);
    preference.addEventListener("change", start);
    return () => {
      stop();
      preference.removeEventListener("change", start);
    };
  }, [key, workProjectId, smoothWorkReturn]);
  return root;
}
