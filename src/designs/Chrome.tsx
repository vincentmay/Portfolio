import { Link } from "@tanstack/react-router";
import { copy, projects, social, type Locale } from "../content.ts";
import { useDocument, useRise } from "../app/page.ts";
import { ChromeMark } from "./Marks.tsx";
import { useSkin } from "./skin.ts";
import portrait from "../assets/vincent-may-about-cutout-v3.webp";
import "./chrome.css";

/**
 * Chrome — the pendant's own material, made into a layout.
 *
 * Warm silver paper, enormous thin type, and highlights that travel rather than
 * sit still. The mark turns slowly under a moving light, which is the whole
 * idea: this design treats the site as a polished object, not a document.
 */
export function Chrome({ locale }: { locale: Locale }) {
  const t = copy[locale];
  useDocument(locale, `${t.meta.title} — Chrome`, t.meta.description);
  useSkin("chrome");
  useRise();

  return (
    <div className="chrome">
      <header className="ch-head">
        <Link to="/designs" className="ch-brand">
          <ChromeMark className="ch-mark" />
        </Link>
        <nav>
          <a href="#work">{t.nav.work}</a>
          <a href="#about">{t.nav.about}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>

      </header>

      <main>
        <section className="ch-hero">
          <ChromeMark className="ch-hero-mark" />
          <h1 className="ch-display">
            <span>Vincent</span>
            <span>May</span>
          </h1>
          <div className="ch-hero-foot">
            <p>{t.index.role}</p>
            <p>{t.index.place}</p>
          </div>
        </section>

        <section className="ch-statement">
          <p className="rise">{t.index.lead}</p>
        </section>

        <section className="ch-band" id="focus">
          <h2 className="ch-h2">{t.focus.title}</h2>
          <div className="ch-focus">
            {t.focus.items.map((item, i) => (
              <article className="rise" key={item.title}>
                <span className="ch-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p className="ch-tools">{item.tools}</p>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ch-band" id="work">
          <h2 className="ch-h2">{t.work.title}</h2>
          {projects.map((project, i) => (
            <a
              className="ch-work rise"
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="ch-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="ch-display ch-display-sm">{project.name}</h3>
              <p>{project.description[locale]}</p>
              <span className="ch-tools">{project.stack.join(" / ")}</span>
            </a>
          ))}
        </section>

        <section className="ch-about" id="about">
          <figure className="rise">
            <img src={portrait} alt={t.about.portraitAlt} loading="lazy" decoding="async" />
          </figure>
          <div className="rise">
            <h2 className="ch-h2">{t.about.title}</h2>
            <p className="ch-lead">{t.about.lead}</p>
            {t.about.body.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <dl className="ch-facts">
              {t.about.facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="ch-band" id="method">
          <h2 className="ch-h2">{t.method.title}</h2>
          <div className="ch-method">
            {t.method.items.map((item) => (
              <article className="rise" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ch-contact" id="contact">
          <p>{t.contact.body}</p>
          <a className="ch-display ch-mail" href={`mailto:${t.contact.email}`}>
            {t.contact.email}
          </a>
          <nav>
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </nav>
        </section>
      </main>

      <footer className="ch-foot">
        <span>{t.footer.rights}</span>
        <span>
          <Link to={"/legal-notice"}>{t.footer.imprint}</Link>
          {" — "}
          <Link to="/designs">Designs</Link>
        </span>
      </footer>
    </div>
  );
}
