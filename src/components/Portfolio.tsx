import { Mark } from "../brand/Mark";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import type { Locale } from "../content";
import { words, type ProjectImage } from "../portfolio";
import { ImageViewer } from "./ImageViewer";

export function Arrow({
  direction = "up",
}: {
  direction?: "up" | "down" | "left";
}) {
  return (
    <svg
      className={`arrow arrow-${direction}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 19 19 5M5 5h14v14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function ProjectLink({
  id,
  locale: _locale,
  children,
  ...props
}: {
  locale: Locale;
  id: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <Link to="/en/work/$project" params={{ project: id }} {...props}>
      {children}
    </Link>
  );
}
export function Header({
  locale,
  project,
  dark = false,
}: {
  locale: Locale;
  project?: string;
  dark?: boolean;
}) {
  const t = words[locale];
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = header.current!;
    const sections = Array.from(
      element
        .closest(".portfolio")!
        .querySelectorAll(".hero-stage, .about-section, .work-journey"),
    );
    const chapters = Array.from(
      element
        .closest(".portfolio")!
        .querySelectorAll<HTMLElement>("#work, #about, #contact"),
    );
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>("[data-section]"),
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      const midpoint = element.getBoundingClientRect().height / 2;
      const onDark = sections.some((section) => {
        const gallery = section.classList.contains("work-journey");
        if (gallery && (section as HTMLElement).dataset.enabled !== "true")
          return false;
        const box = section.getBoundingClientRect();
        return box.top <= (gallery ? 101 : midpoint) && box.bottom > midpoint;
      });
      element.dataset.theme = onDark ? "dark" : "light";
      const active = chapters.find((section) => {
        const box = section.getBoundingClientRect();
        const point = window.innerHeight * 0.35;
        return box.top <= point && box.bottom > point;
      });
      for (const link of links) {
        const selected = link.dataset.section === active?.id;
        link.dataset.active = String(selected);
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [locale, project]);
  return (
    <header
      className="site-header"
      ref={header}
      data-theme={dark ? "dark" : "light"}
    >
      <div className="reading-progress" aria-hidden="true" />
      <div className="wrap header-inner">
        <Link
          to={`/${locale}`}
          className="wordmark"
          aria-label="Vincent May home"
        >
          <Mark className="header-mark" />
          <span>
            vincent<span className="wordmark-dot">.</span>may
          </span>
        </Link>
        <nav aria-label={"Main navigation"}>
          <Link
            to={`/${locale}`}
            hash="work"
            viewTransition={false}
            data-section="work"
          >
            {t.work}
          </Link>
          <Link
            to={`/${locale}`}
            hash="about"
            viewTransition={false}
            data-section="about"
          >
            {t.about}
          </Link>
          <Link
            to={`/${locale}`}
            hash="contact"
            className="nav-contact"
            viewTransition={false}
            data-section="contact"
          >
            {t.contact}
            <Arrow />
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer({ locale }: { locale: Locale }) {
  const t = words[locale];
  return (
    <footer className="site-footer wrap">
      <div className="footer-identity">
        <Mark className="footer-mark" />
        <div>
          <span>© {new Date().getFullYear()} Vincent May</span>
          <p>{t.footer}</p>
        </div>
      </div>
      <nav aria-label={"Footer navigation"}>
        <Link to={"/legal-notice"}>{t.legal}</Link>
        <Link to={"/privacy"}>{t.privacy}</Link>
        <a href="#top">{t.top} ↑</a>
      </nav>
    </footer>
  );
}
export function ProjectVisual({
  project,
  locale,
  large = false,
  sizes = "(max-width: 1512px) 100vw, 1400px",
}: {
  project: ProjectImage & { id: string };
  locale: Locale;
  large?: boolean;
  sizes?: string;
}) {
  return (
    <figure
      className={`project-visual visual-${project.id}${large ? " visual-large" : ""}`}
      data-image-stage
    >
      <svg
        className="stage-outline"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 9V0H9 M91 0H100V9 M100 91V100H91 M9 100H0V91"
          pathLength="1"
        />
      </svg>
      <div
        className="screenshot-frame"
        style={large ? { aspectRatio: `${project.imageWidth} / ${project.imageHeight}` } : undefined}
      >
        <img
          src={project.image}
          srcSet={project.imageSrcSet}
          sizes={project.imageSrcSet ? sizes : undefined}
          alt={project.alt[locale]}
          width={project.imageWidth}
          height={project.imageHeight}
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption>{project.caption[locale]}</figcaption>
      {large && (
        <ImageViewer
          src={project.image}
          alt={project.alt[locale]}
          caption={project.caption[locale]}
          locale={locale}
        />
      )}
    </figure>
  );
}
