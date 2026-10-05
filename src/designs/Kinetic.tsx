import { Link } from "@tanstack/react-router";
import { copy, projects, social, type Locale } from "../content.ts";
import { useDocument, useRise } from "../app/page.ts";
import { ShatterMark } from "./Marks.tsx";
import { useSkin } from "./skin.ts";
import "./kinetic.css";

/**
 * Kinetic — Swiss poster, shouted.
 *
 * A hard grid, one accent colour against black, and type set as large as the
 * measure allows. It is the only design here that uses colour at all, and the
 * mark matches by arriving in pieces rather than fading in.
 */
export function Kinetic({ locale }: { locale: Locale }) {
  const t = copy[locale];
  useDocument(locale, `${t.meta.title} — Kinetic`, t.meta.description);
  useSkin("kinetic");
  useRise();

  return (
    <div className="kinetic">
      <header className="kn-head">
        <Link to="/designs" className="kn-brand">
          <ShatterMark className="kn-mark" />
          <span>VM</span>
        </Link>
        <nav>
          <a href="#work">{t.nav.work}</a>
          <a href="#about">{t.nav.about}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>

      </header>

      <main>
        <section className="kn-hero">
          <p className="kn-tag">
            {t.index.role} <b>/</b> {t.index.place}
          </p>
          <h1>
            <span className="kn-line">Vincent</span>
            <span className="kn-line kn-accent">May</span>
          </h1>
          <p className="kn-lead">{t.index.lead}</p>
          <a className="kn-cta" href="#work">
            {t.index.cta}
          </a>
        </section>

        <section className="kn-strip" aria-hidden="true">
          <div className="kn-marquee">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i}>
                Java <b>◆</b> TypeScript <b>◆</b> React <b>◆</b> WebGL <b>◆</b> Electron <b>◆</b>{" "}
              </span>
            ))}
          </div>
        </section>

        <section className="kn-section" id="focus">
          <header>
            <span className="kn-idx">{t.focus.index}</span>
            <h2>{t.focus.title}</h2>
          </header>
          <div className="kn-cards">
            {t.focus.items.map((item) => (
              <article className="rise" key={item.title}>
                <h3>{item.title}</h3>
                <p className="kn-tools">{item.tools}</p>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="kn-section" id="work">
          <header>
            <span className="kn-idx">{t.work.index}</span>
            <h2>{t.work.title}</h2>
          </header>
          <div className="kn-work">
            {projects.map((project) => (
              <a
                className="rise"
                key={project.name}
                href={project.href}
                target="_blank"
                rel="noreferrer"
              >
                <h3>{project.name}</h3>
                <p className="kn-kind">{project.meta[locale]}</p>
                <p>{project.description[locale]}</p>
                <span className="kn-tools">{project.stack.join(" · ")}</span>
                <span className="kn-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="kn-section kn-quote" id="method">
          <header>
            <span className="kn-idx">{t.method.index}</span>
            <h2>{t.method.title}</h2>
          </header>
          <ol>
            {t.method.items.map((item, i) => (
              <li className="rise" key={item.title}>
                <span className="kn-big">{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="kn-section" id="about">
          <header>
            <span className="kn-idx">{t.about.index}</span>
            <h2>{t.about.title}</h2>
          </header>
          <div className="kn-about rise">
            <p className="kn-lead">{t.about.lead}</p>
            {t.about.body.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <dl>
              {t.about.facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="kn-contact" id="contact">
          <h2>{t.contact.title}</h2>
          <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <nav>
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </section>
      </main>

      <footer className="kn-foot">
        <span>{t.footer.rights}</span>
        <span>
          <Link to={"/legal-notice"}>{t.footer.imprint}</Link>
          {" / "}
          <Link to="/designs">Designs</Link>
        </span>
      </footer>
    </div>
  );
}
