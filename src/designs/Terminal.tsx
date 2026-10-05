import { Link } from "@tanstack/react-router";
import { copy, projects, social, type Locale } from "../content.ts";
import { useDocument } from "../app/page.ts";
import { GlitchMark } from "./Marks.tsx";
import { useSkin } from "./skin.ts";
import "./terminal.css";

/**
 * Terminal — the portfolio as a readout.
 *
 * Everything is monospace and everything is on a rule. There is no decoration
 * at all; the interest comes from treating the page as a fixed-width document,
 * so the mark tears like a bad signal rather than easing anywhere.
 */
export function Terminal({ locale }: { locale: Locale }) {
  const t = copy[locale];
  useDocument(locale, `${t.meta.title} — Terminal`, t.meta.description);
  useSkin("terminal");

  const row = (label: string, value: string) => (
    <div className="tm-row" key={label}>
      <span>{label}</span>
      <span className="tm-dots" aria-hidden="true" />
      <span>{value}</span>
    </div>
  );

  return (
    <div className="terminal">
      <header className="tm-head">
        <Link to="/designs" className="tm-brand">
          <GlitchMark className="tm-mark" />
          <span>vincent-may</span>
        </Link>
        <span className="tm-meta">{t.index.place}</span>

      </header>

      <main className="tm-body">
        <section className="tm-hero">
          <pre className="tm-banner" aria-hidden="true">
            {`┌─ ${t.index.role.toUpperCase()} ${"─".repeat(6)}┐`}
          </pre>
          <h1>
            Vincent May<span className="tm-caret" aria-hidden="true" />
          </h1>
          <p className="tm-lead">{t.index.lead}</p>
        </section>

        <section className="tm-section" id="focus">
          <h2>
            <span className="tm-idx">{t.focus.index}</span> {t.focus.title}
          </h2>
          <div className="tm-list">
            {t.focus.items.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p className="tm-dim">{item.tools}</p>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tm-section" id="work">
          <h2>
            <span className="tm-idx">{t.work.index}</span> {t.work.title}
          </h2>
          <p className="tm-dim">{t.work.note}</p>
          <table className="tm-table">
            <tbody>
              {projects.map((project, i) => (
                <tr key={project.name}>
                  <td className="tm-dim">{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {project.name}
                    </a>
                    <p>{project.description[locale]}</p>
                  </td>
                  <td className="tm-dim tm-stack">{project.stack.join("\n")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="tm-section" id="about">
          <h2>
            <span className="tm-idx">{t.about.index}</span> {t.about.title}
          </h2>
          <p>{t.about.lead}</p>
          {t.about.body.map((p) => (
            <p key={p.slice(0, 20)} className="tm-dim">
              {p}
            </p>
          ))}
          <div className="tm-rows">{t.about.facts.map(([k, v]) => row(k, v))}</div>
        </section>

        <section className="tm-section" id="method">
          <h2>
            <span className="tm-idx">{t.method.index}</span> {t.method.title}
          </h2>
          <ol className="tm-steps">
            {t.method.items.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p className="tm-dim">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="tm-section" id="contact">
          <h2>
            <span className="tm-idx">{t.contact.index}</span> {t.contact.title}
          </h2>
          <p className="tm-dim">{t.contact.body}</p>
          <a className="tm-mail" href={`mailto:${t.contact.email}`}>
            {t.contact.email}
          </a>
          <div className="tm-rows">{social.map((s) => row(s.label, s.handle))}</div>
        </section>
      </main>

      <footer className="tm-foot">
        <span>{t.footer.rights}</span>
        <span>
          <Link to={"/legal-notice"}>{t.footer.imprint}</Link>
          {" · "}
          <Link to="/designs">designs</Link>
        </span>
      </footer>
    </div>
  );
}
