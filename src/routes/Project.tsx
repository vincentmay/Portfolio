import { usePortfolioMotion } from "../app/motion";
import { Mark } from "../brand/Mark";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { Locale } from "../content";
import { useDocument } from "../app/page";
import { work, words } from "../portfolio";
import {
  Header,
  Footer,
  Arrow,
  ProjectVisual,
  ProjectLink,
} from "../components/Portfolio";

export function Project({ locale, id }: { locale: Locale; id: string }) {
  const t = words[locale];
  const motion = usePortfolioMotion(`${locale}-${id}`);
  const project = work.find((p) => p.id === id);
  useDocument(
    locale,
    `${project?.name ?? t.missing} — Vincent May`,
    project?.summary[locale] ?? t.missing,
    !project,
  );
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);
  if (!project)
    return (
      <div className="portfolio portfolio-case" ref={motion}>
        <Header locale={locale} />
        <main className="wrap not-found" id="top">
          <h1>{t.missing}</h1>
          <Link to={`/${locale}`} hash="work">
            ← {t.back}
          </Link>
        </main>
        <Footer locale={locale} />
      </div>
    );
  const next = work[(work.indexOf(project) + 1) % work.length];
  return (
    <div className="portfolio portfolio-case" ref={motion}>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <Header locale={locale} project={id} />
      <main id="main" tabIndex={-1}>
        <section className="case-hero wrap" id="top">
          <Link
            className="case-back text-link"
            to={`/${locale}`}
            hash={`work-${id}`}
            resetScroll={false}
            hashScrollIntoView={false}
            viewTransition={false}
          >
            <Arrow direction="left" />
            {t.back}
          </Link>
          <p className="eyebrow section-index">
            <Mark className="section-mark" />
            {project.kind[locale]}
          </p>
          <h1>
            {project.name}
            <span className="case-title-dot">.</span>
          </h1>
          <p className="case-summary">{project.summary[locale]}</p>
          <div className="case-meta">
            <span>{project.focus[locale]}</span>
            <ul className="project-stack">
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <dl className="case-facts">
            <div>
              <dt>{"My contribution"}</dt>
              <dd>{project.contribution[locale]}</dd>
            </div>
            <div>
              <dt>{"Project stage"}</dt>
              <dd>{project.stage[locale]}</dd>
            </div>
          </dl>
          <div className="case-actions">
            {project.demo && (
              <a
                className="button primary"
                href={project.demo}
                target="_blank"
                rel="noreferrer"
              >
                {t.demo}
                <Arrow />
              </a>
            )}
            {project.source && (
              <a
                className="button primary"
                href={project.source}
                target="_blank"
                rel="noreferrer"
              >
                {t.source}
                <Arrow />
              </a>
            )}
            {project.id === "gfos-code" && (
              <a
                className="text-link"
                href="https://github.com/pingdotgg/t3code"
                target="_blank"
                rel="noreferrer"
              >
                T3 Code upstream
                <Arrow />
              </a>
            )}
          </div>
        </section>
        <div className="case-image wrap" data-reveal data-parallax>
          <ProjectVisual project={project} locale={locale} large />
        </div>
        {project.features && (
          <section className="case-features wrap" aria-label={`${project.name} in use`}>
            {project.features.map((feature) => (
              <article className="case-feature" key={feature.image}>
                <div className="case-feature-heading" data-reveal>
                  <h2>{feature.title[locale]}</h2>
                  <p>{feature.body[locale]}</p>
                </div>
                <div className="case-image" data-reveal>
                  <ProjectVisual project={{ id: project.id, ...feature }} locale={locale} large />
                </div>
              </article>
            ))}
          </section>
        )}
        <section className="case-story wrap" aria-labelledby="case-overview">
          <div className="story-aside">
            <p className="eyebrow section-index">{t.engineering}</p>
            <h2 id="case-overview">{t.overview}</h2>
            <ol className="case-flow">
              {project.flow[locale].map((step, i) => (
                <li key={step}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="story-body">
            <p className="case-intro">{project.intro[locale]}</p>
            {project.sections.map((section) => (
              <section key={section.title.en} data-reveal>
                <h3>{section.title[locale]}</h3>
                <p>{section.body[locale]}</p>
              </section>
            ))}
            {project.demo && (
              <a
                className="text-link"
                href={project.demo}
                target="_blank"
                rel="noreferrer"
              >
                {t.demo}
                <Arrow />
              </a>
            )}
          </div>
        </section>
        {project.examples && (
          <section
            className="case-builds wrap"
            aria-labelledby="case-builds-title"
          >
            <div className="case-builds-heading" data-reveal>
              <h2 id="case-builds-title">{project.galleryHeading?.[locale]}</h2>
              <p>{project.galleryIntro?.[locale]}</p>
            </div>
            <div className="case-builds-grid">
              {project.examples.map((example) => (
                <div
                  className={`case-image${example.featured ? " case-image-featured" : ""}`}
                  key={example.image}
                  data-reveal
                >
                  <ProjectVisual
                    project={{ id: project.id, ...example }}
                    locale={locale}
                    large
                    sizes={
                      example.featured
                        ? "(max-width: 1512px) 100vw, 1400px"
                        : "(max-width: 800px) 100vw, (max-width: 1512px) 50vw, 700px"
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="case-next wrap" data-reveal>
          <span className="eyebrow">{t.next}</span>
          <ProjectLink locale={locale} id={next.id}>
            {next.name}
            <Arrow />
          </ProjectLink>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
