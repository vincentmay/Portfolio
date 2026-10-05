import { Mark } from "../brand/Mark";
import { useLocation } from "@tanstack/react-router";
import { StellarObject } from "../brand/StellarObject";
import { usePortfolioMotion } from "../app/motion";
import type { Locale } from "../content";
import { useDocument } from "../app/page";
import { work, words } from "../portfolio";
import {
  Header,
  Footer,
  ProjectVisual,
  Arrow,
  ProjectLink,
} from "../components/Portfolio";
import portrait from "../assets/vincent-may-about-cutout-v3.webp";
import { PortraitOrbit } from "../components/PortraitOrbit";

export function Home({ locale }: { locale: Locale }) {
  const t = words[locale];
  const hash = useLocation({ select: (location) => location.hash });
  const smoothWorkReturn = useLocation({ select: (location) => location.state.smoothWorkReturn === true });
  const motion = usePortfolioMotion(locale, hash.startsWith("work-") ? hash.slice(5) : undefined, smoothWorkReturn);
  useDocument(locale, `Vincent May — ${t.role}`, t.intro);
  return (
    <div className="portfolio portfolio-home" ref={motion}>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <Header locale={locale} dark />
      <main id="main" tabIndex={-1}>
        <div className="hero-stage" id="top">
          <section className="hero wrap" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="status-dot" />
                {t.role}
                <span className="eyebrow-separator">/</span>
                {t.place}
              </p>
              <h1 id="hero-title" aria-label="Vincent May">
                <span className="hero-line">
                  <span>Vincent</span>
                </span>
                <span className="hero-line">
                  <span>
                    May<span className="name-period">.</span>
                  </span>
                </span>
              </h1>
              <p className="hero-statement">{"Curiosity, put to work."}</p>
              <p className="hero-intro">{t.intro}</p>
              <div className="hero-actions">
                <a className="button primary" href="#work">
                  {t.cta}
                  <Arrow direction="down" />
                </a>
                <a className="text-link" href="mailto:contact@vincentmay.com">
                  {t.hello}
                  <Arrow />
                </a>
              </div>
            </div>
            <div className="stellar-scene">
              <StellarObject />
            </div>
            <div className="hero-bottom">
              <span>
                Java <i>·</i> TypeScript <i>·</i> React <i>·</i> Python
              </span>
              <a href="#work" aria-label={t.cta}>
                <Arrow direction="down" />
              </a>
            </div>
          </section>
        </div>
        <section
          className="work-section wrap"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow section-index">
                <Mark className="section-mark" />
                {t.index}
              </p>
              <h2 id="work-title">
                <span className="title-line">
                  <span>{t.workTitle[0]}</span>
                </span>
                <span className="title-line">
                  <span>{t.workTitle[1]}</span>
                </span>
              </h2>
            </div>
            <p>{t.workIntro}</p>
          </div>
          <div className="work-journey">
            <div className="work-viewport">
              <div className="work-clip">
                <div className="selected-work">
                  {work.map((project) => (
                    <article
                      id={`work-${project.id}`}
                      className={`work-row work-${project.id}`}
                      data-reveal
                      key={project.id}
                    >
                      <ProjectLink
                        locale={locale}
                        id={project.id}
                        className="project-art"
                        aria-label={`${t.read}: ${project.name}`}
                      >
                        <ProjectVisual
                          project={project}
                          locale={locale}
                          eager
                          sizes="(min-width: 1512px) and (min-height: 760px) 1030px, (min-width: 1100px) and (min-height: 760px) calc(96vw - 396px), (min-width: 1512px) 1400px, calc(100vw - 48px)"
                        />
                        <span className="art-open">
                          <Arrow />
                        </span>
                      </ProjectLink>
                      <div className="work-copy">
                        <p className="project-kicker">{project.kind[locale]}</p>
                        <h3>
                          <ProjectLink locale={locale} id={project.id}>
                            {project.name}
                          </ProjectLink>
                        </h3>
                        <p className="project-summary">
                          {project.summary[locale]}
                        </p>
                        <p className="project-focus">{project.focus[locale]}</p>
                        <ul className="project-stack">
                          {project.stack.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                        <ProjectLink
                          locale={locale}
                          id={project.id}
                          className="text-link project-read"
                        >
                          {t.read}
                          <Arrow />
                        </ProjectLink>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <nav className="journey-nav" aria-label="Selected projects">
                {work.map((project, index) => (
                  <button
                    type="button"
                    data-journey-index={index}
                    key={project.id}
                  >
                    {project.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </section>
        <section
          className="about-section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="wrap about-layout">
            <figure className="about-portrait" data-reveal>
              <div className="portrait-surface">
                <PortraitOrbit />
                <img
                  src={portrait}
                  alt="Vincent May"
                  width="1254"
                  height="1254"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </figure>
            <div className="about-text" data-reveal>
              <p className="eyebrow section-index">
                <Mark className="section-mark" />
                {t.aboutIndex}
              </p>
              <h2 id="about-title">
                <span className="title-line">
                  <span>{t.aboutTitle[0]}</span>
                </span>
                <span className="title-line">
                  <span>{t.aboutTitle[1]}</span>
                </span>
              </h2>
              {t.aboutBody.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <dl className="about-facts">
                <div>
                  <dt>{t.current}</dt>
                  <dd>GFOS mbH</dd>
                </div>
                <div>
                  <dt>{t.location}</dt>
                  <dd>Essen, DE</dd>
                </div>
                <div>
                  <dt>{t.languages}</dt>
                  <dd>{t.languageValue}</dd>
                </div>
              </dl>
              <div className="skills">
                <span>{t.skills}</span>
                <p>
                  Java · TypeScript · React · Node.js · Python · Electron · SQL
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          className="contact-section wrap"
          id="contact"
          aria-labelledby="contact-title"
        >
          <p className="eyebrow section-index" data-reveal>
            <Mark className="section-mark" />
            {t.contactIndex}
          </p>
          <div className="contact-layout" data-reveal>
            <div>
              <h2 id="contact-title">
                <span className="title-line">
                  <span>{t.contactTitle[0]}</span>
                </span>
                <span className="title-line">
                  <span>{t.contactTitle[1]}</span>
                </span>
              </h2>
              <p>{t.contactBody}</p>
              <a className="contact-email" href="mailto:contact@vincentmay.com">
                contact@vincentmay.com
                <Arrow />
              </a>
            </div>
            <div className="contact-side">
              <Mark className="contact-mark" />
              <p className="opportunity">
                <span className="status-dot" />
                {t.opportunity}
              </p>
              <a
                className="text-link"
                href="https://github.com/vincentmay"
                target="_blank"
                rel="me noreferrer"
              >
                GitHub
                <Arrow />
              </a>
              <a
                className="text-link"
                href="https://www.linkedin.com/in/vincent-may/"
                target="_blank"
                rel="me noreferrer"
              >
                LinkedIn
                <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
