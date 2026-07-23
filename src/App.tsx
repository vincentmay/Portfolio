import { Suspense, lazy, useEffect } from "react";
import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import cutout from "./assets/vincent-may-about-cutout-v3.webp";
import { copy, projects, social, type Locale } from "./content";
import { CosmicUniverse } from "./CosmicUniverse";
import { LogoMark } from "./LogoMark";

const LogoLab = lazy(() => import("./LogoLab"));

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: () => <Portfolio locale="de" /> });
const germanRoute = createRoute({ getParentRoute: () => rootRoute, path: "/de", component: () => <Portfolio locale="de" /> });
const englishRoute = createRoute({ getParentRoute: () => rootRoute, path: "/en", component: () => <Portfolio locale="en" /> });
const imprintRoute = createRoute({ getParentRoute: () => rootRoute, path: "/impressum", component: () => <LegalPage page="imprint" /> });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/datenschutz", component: () => <LegalPage page="privacy" /> });
const logoLabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/logo-lab",
  component: () => (
    <Suspense fallback={<div className="logo-lab-loading">Loading logo lab…</div>}>
      <LogoLab />
    </Suspense>
  ),
});
const routeTree = rootRoute.addChildren([
  homeRoute,
  germanRoute,
  englishRoute,
  imprintRoute,
  privacyRoute,
  logoLabRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });
declare module "@tanstack/react-router" { interface Register { router: typeof router } }

function Portfolio({ locale }: { locale: Locale }) {
  const text = copy[locale];
  useReveal();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = text.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", text.meta.description);
  }, [locale, text]);

  return (
    <div className="site">
      <a className="skip-link" href="#main">{text.skip}</a>
      <CosmicUniverse />
      <div className="scrim" aria-hidden="true" />
      <header className="site-header shell">
        <Link to={locale === "de" ? "/de" : "/en"} className="wordmark" aria-label="Vincent May — Home">
          <LogoMark className="logo-mark-header" />
          <span>Vincent May</span>
        </Link>
        <nav aria-label={locale === "de" ? "Hauptnavigation" : "Primary navigation"}>
          <a href="#work">{text.nav.work}</a>
          <a href="#about">{text.nav.about}</a>
          <a href="#contact">{text.nav.contact}</a>
        </nav>
        <Link
          className="language-link"
          to={locale === "de" ? "/en" : "/de"}
          aria-label={locale === "de" ? "Switch to English" : "Zur deutschen Version wechseln"}
        >
          {locale === "de" ? "EN" : "DE"}
        </Link>
      </header>

      <main id="main">
        <section className="hero scene shell" aria-labelledby="hero-title">
          <p className="hero-role">{text.hero.role}</p>
          <h1 id="hero-title">Vincent May</h1>
          <p className="hero-intro">{text.hero.intro}</p>
          <a className="hero-cta" href="#work">{text.hero.cta} <span aria-hidden="true">↓</span></a>
        </section>

        <section className="section scene shell" id="work" aria-labelledby="work-title">
          <header className="section-head">
            <h2 id="work-title">{text.work.title}</h2>
            <p>{text.work.note}</p>
          </header>
          <ol className="project-list">
            {projects.map((project, index) => (
              <li className="project reveal" key={project.name}>
                <div className="project-head">
                  <span className="project-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{project.name}</h3>
                  <span className="project-meta">{project.meta[locale]}</span>
                </div>
                <p className="project-description">{project.description[locale]}</p>
                <div className="project-foot">
                  <span className="project-stack" translate="no">{project.stack.join(" · ")}</span>
                  <a
                    className="project-link"
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.name} — ${text.work.repository} (GitHub)`}
                  >
                    {text.work.repository} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section scene shell" id="focus" aria-labelledby="focus-title">
          <header className="section-head">
            <h2 id="focus-title">{text.focus.title}</h2>
          </header>
          <dl className="focus-list">
            {text.focus.items.map(([term, detail]) => (
              <div className="focus-row reveal" key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="section scene shell about" id="about" aria-labelledby="about-title">
          <header className="section-head">
            <h2 id="about-title">{text.about.title}</h2>
          </header>
          <div className="about-grid">
            <div className="about-text reveal">
              <p className="about-lead">{text.about.lead}</p>
              <p>{text.about.body}</p>
              <dl className="facts">
                {text.about.facts.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </div>
            <img
              className="about-cutout reveal"
              src={cutout}
              alt={text.about.portraitAlt}
              width="1254"
              height="1254"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <section className="section scene shell contact" id="contact" aria-labelledby="contact-title">
          <header className="section-head">
            <h2 id="contact-title">{text.contact.title}</h2>
          </header>
          <p className="contact-body">{text.contact.body}</p>
          <a className="contact-mail" href={`mailto:${text.contact.email}`}>{text.contact.email}</a>
          <ul className="contact-social">
            {social.map((item) => (
              <li key={item.label}>
                <a href={item.href} target="_blank" rel="noreferrer">{item.label} <span aria-hidden="true">↗</span></a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="site-footer shell">
        <p>{text.footer.rights}</p>
        <div className="footer-legal">
          <Link to="/impressum">{text.footer.imprint}</Link>
          <Link to="/datenschutz">{text.footer.privacy}</Link>
        </div>
      </footer>
    </div>
  );
}

function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    elements.forEach((element) => element.classList.add("will-reveal"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove("will-reveal");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8%" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function LegalPage({ page }: { page: "imprint" | "privacy" }) {
  const imprint = page === "imprint";
  useEffect(() => {
    document.documentElement.lang = "de";
    document.title = `${imprint ? "Impressum" : "Datenschutz"} — Vincent May`;
  }, [imprint]);

  return (
    <main className="legal shell">
      <header className="legal-head">
        <Link to="/de" className="wordmark" aria-label="Vincent May — Home"><LogoMark className="logo-mark-header" /><span>Vincent May</span></Link>
        <Link to="/de">← {copy.de.footer.back}</Link>
      </header>
      <article>
        <h1>{imprint ? "Impressum" : "Datenschutz"}</h1>
        {imprint ? <>
          <h2>Angaben gemäß § 5 DDG</h2>
          <p>Vincent May<br />Die vollständige ladungsfähige Anschrift wird vor der Veröffentlichung ergänzt.</p>
          <h2>Kontakt</h2>
          <p><a href="mailto:contact@vincentmay.com">contact@vincentmay.com</a></p>
          <h2>Hinweis</h2>
          <p>Vor dem Go-live müssen alle gesetzlich erforderlichen Angaben vervollständigt und rechtlich geprüft werden.</p>
        </> : <>
          <h2>Überblick</h2>
          <p>Diese statische Portfolio-Seite setzt derzeit keine Analyse- oder Marketing-Cookies ein.</p>
          <h2>Hosting</h2>
          <p>Vor Veröffentlichung werden Hosting-Anbieter und gegebenenfalls eingesetzte Dienste hier verbindlich dokumentiert.</p>
          <h2>Kontakt</h2>
          <p>Daten aus einer E-Mail-Anfrage werden ausschließlich zur Bearbeitung der Anfrage verwendet.</p>
        </>}
      </article>
    </main>
  );
}
