import { useEffect, useState } from "react";
import { STAGES, type StageId } from "../field/scene.ts";
import { copy, type Locale } from "../content.ts";

/** Keeps the document head in step with the route. */
export function useDocument(
  locale: Locale,
  title: string,
  description?: string,
  noindex = false,
) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = title;
    document.querySelector('meta[name="robots"]')?.remove();
    if (noindex) {
      const robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex,follow";
      document.head.append(robots);
    }
    if (description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", description);
    }
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const canonical = `https://vincentmay.com${path}`;
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", canonical);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", canonical);
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute("content", "en_GB");
    if (description)
      document
        .querySelector('meta[property="og:description"]')
        ?.setAttribute("content", description);
  }, [locale, title, description, noindex]);
}

/**
 * Reveals elements marked `.rise` as they come into view. Elements are only
 * hidden once the observer is known to be running, so a browser without it —
 * or a visitor who asked for reduced motion — simply sees everything.
 */
export function useRise() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(document.querySelectorAll<HTMLElement>(".rise"));
    items.forEach((el) => el.classList.add("rise-armed"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("rise-armed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10%" },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/**
 * Tracks which stage the reader is in. The id lands on the root element so the
 * veil behind the text can move out of the way of the object, and comes back as
 * state for the rail.
 */
export function useStage() {
  const [active, setActive] = useState<StageId>(STAGES[0].id);

  useEffect(() => {
    const ids = STAGES.map((stage) => stage.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const apply = (id: StageId) => {
      document.documentElement.dataset.stage = id;
      setActive(id);
    };

    if (!("IntersectionObserver" in window)) {
      apply(ids[0]);
      return;
    }

    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          seen.set(entry.target.id, entry.intersectionRatio);
        let best = ids[0];
        let bestRatio = -1;
        for (const id of ids) {
          const ratio = seen.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        apply(best);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    );
    sections.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.stage;
    };
  }, []);

  return active;
}

export const stageLabels = (locale: Locale) => copy[locale].stages;
