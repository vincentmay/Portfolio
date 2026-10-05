import { Link } from "@tanstack/react-router";
import { copy, projects, social, type Locale } from "../content.ts";
import { useDocument } from "../app/page.ts";
import { DrawMark } from "./Marks.tsx";
import { useSkin } from "./skin.ts";
import portrait from "../assets/vincent-may-about-cutout-v3.webp";
import "./studio.css";

/**
 * Studio — after openai.com.
 *
 * Paper white, one weight of one typeface, and almost no ornament: the whole
 * design is spacing and a strict left margin. Nothing moves unless you ask it
 * to, which is why the mark simply draws itself once and then holds still.
 */
export function Studio({ locale }: { locale: Locale }) {
  const t = copy[locale];
  useDocument(locale, `${t.meta.title} — Studio`, t.meta.description);
  useSkin("studio");

  return (
    <div className="studio">
      <header className="st-nav">
        <Link to="/designs" className="st-brand">
          <DrawMark className="st-mark" />
          <span>Vincent May</span>
        </Link>
        <nav>
          <a href="#work">{t.nav.work}</a>
          <a href="#about">{t.nav.about}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <a className="st-pill" href={`mailto:${t.contact.email}`}>
          {t.nav.contact}
        </a>
      </header>

      <main>
        <section className="st-hero">
          <p className="st-eyebrow">
            {t.index.role} · {t.index.place}
          </p>
          <h1>{t.index.lead}</h1>
          <div className="st-hero-actions">
            <a className="st-button" href="#work">
              {t.index.cta}
            </a>

          </div>
        </section>

        <section className="st-block" id="focus">
          <h2 className="st-h2">{t.focus.title}</h2>
          <div className="st-grid">
            {t.focus.items.map((item) => (
              <article className="st-card" key={item.title}>
                <h3>{item.title}</h3>
                <p className="st-tools">{item.tools}</p>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="st-block" id="work">
          <h2 className="st-h2">{t.work.title}</h2>
          <p className="st-note">{t.work.note}</p>
          <div className="st-grid st-grid-3">
            {projects.map((project) => (
              <a
                className="st-tile"
                key={project.name}
                href={project.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="st-tile-kind">{project.meta[locale]}</span>
                <h3>{project.name}</h3>
                <p>{project.description[locale]}</p>
                <span className="st-tile-stack">{project.stack.join(" · ")}</span>
                <span className="st-tile-go">{t.work.repository} →</span>
              </a>
            ))}
          </div>
        </section>

        <section className="st-block st-about" id="about">
          <div>
            <h2 className="st-h2">{t.about.title}</h2>
            <p className="st-lead">{t.about.lead}</p>
            {t.about.body.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <dl className="st-facts">
              {t.about.facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="st-portrait">
            <img src={portrait} alt={t.about.portraitAlt} loading="lazy" decoding="async" />
          </figure>
        </section>

        <section className="st-block" id="method">
          <h2 className="st-h2">{t.method.title}</h2>
          <ol className="st-steps">
            {t.method.items.map((item, i) => (
              <li key={item.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="st-cta" id="contact">
          <h2>{t.contact.title}</h2>
          <p>{t.contact.body}</p>
          <a className="st-button" href={`mailto:${t.contact.email}`}>
            {t.contact.email}
          </a>
        </section>
      </main>

      <footer className="st-foot">
        <p>{t.footer.rights}</p>
        <nav>
          {social.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
          <Link to={"/legal-notice"}>{t.footer.imprint}</Link>
          <Link to="/designs">Designs</Link>
        </nav>
      </footer>
    </div>
  );
}
