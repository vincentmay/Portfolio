import { useEffect } from "react";
import type { Locale } from "../content.ts";

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
    const canonical = `https://vincentmay.com${path === "/en" ? "/" : path}`;
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
