import { Link } from "@tanstack/react-router";
import { Header, Footer } from "../components/Portfolio";
import { copy, type Locale } from "../content.ts";
import { useDocument } from "../app/page.ts";

type Section = { heading: string; body: readonly string[] };

export const legalDescription = {
  en: { imprint: "Contact and legal information for Vincent May’s portfolio.", privacy: "How Vincent May’s portfolio handles hosting data and email enquiries." },
};

/**
 * Imprint and privacy notice.
 *
 * Public operator details supplied and approved by the site owner.
 */
const TEXT: Record<
  Locale,
  Record<"imprint" | "privacy", { title: string; sections: Section[] }>
> = {
  en: {
    imprint: {
      title: "Legal notice / Impressum",
      sections: [
        {
          heading: "Website operator",
          body: [
            "Vincent May",
            "Rüggenweg 5",
            "45529 Hattingen",
            "Germany",
          ],
        },
        { heading: "Contact", body: ["Email: contact@vincentmay.com"] },
      ],
    },
    privacy: {
      title: "Privacy",
      sections: [
        {
          heading: "Data controller",
          body: ["Vincent May", "Email: contact@vincentmay.com", "Postal address: /legal-notice"],
        },
        {
          heading: "Overview",
          body: [
            "The portfolio application is a static website. It does not itself set cookies, serves its fonts and application scripts locally, and includes no analytics or tracking services. It is delivered through Cloudflare Pages.",
          ],
        },
        {
          heading: "Server logs",
          body: [
            "When the site is requested, the hosting provider processes technically necessary data such as IP address, request time and requested file. The legal basis is Art. 6(1)(f) GDPR. The legitimate interest is providing a reliable, secure website and preventing misuse.",
            "This website is hosted on Cloudflare Pages, provided by Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA. Cloudflare processes request data to deliver, secure, and maintain its service.",
            "Cloudflare does not publish one retention period for all request data. Its privacy policy determines retention according to the processing purpose, the nature and sensitivity of the data, and legal or contractual obligations. Once the applicable period ends, data is deleted or destroyed; where this is not yet technically possible, further use is prevented.",
            "Data may also be processed in the United States. Cloudflare states that it relies on its EU-US Data Privacy Framework certification for transfers from the European Economic Area to the US, and uses standard contractual clauses for other international transfers. Its privacy policy provides details of these safeguards.",
            "Further information: https://www.cloudflare.com/privacypolicy/",
          ],
        },
        {
          heading: "Getting in touch",
          body: [
            "Writing by email transmits your address and the content of your message. These data are used to answer the enquiry; email providers participate in technical delivery and storage. The legal basis is the legitimate interest in responding to enquiries under Art. 6(1)(f) GDPR, or Art. 6(1)(b) GDPR for concrete contractual enquiries.",
            "Correspondence is retained for handling the enquiry and necessary follow-up, and for any applicable statutory retention requirements.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "Subject to the applicable legal conditions, you have rights to access, rectification, erasure, restriction of processing and data portability. You may object to processing based on legitimate interests on grounds relating to your particular situation. Contact: contact@vincentmay.com.",
            "You also have the right to lodge a complaint with a data protection supervisory authority, including the authority in your country of residence or work. The authority for North Rhine-Westphalia is the Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW): https://www.ldi.nrw.de/",
          ],
        },
      ],
    },
  },
};

export function Legal({
  page,
  locale,
}: {
  page: "imprint" | "privacy";
  locale: Locale;
}) {
  const t = copy[locale];
  const doc = TEXT[locale][page];
  useDocument(locale, `${doc.title} — Vincent May`, legalDescription[locale][page], true);

  return (
    <div className="portfolio legal-site" id="top">
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <Header locale={locale} />

      <main id="main" className="legal wrap" tabIndex={-1}>
        <Link className="text-link" to={`/${locale}`}>
          ← {t.footer.back}
        </Link>
        <h1>{doc.title}</h1>
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((line) => {
              return <p key={line}><LegalText text={line} /></p>;
            })}
          </section>
        ))}
      </main>

      <Footer locale={locale} />
    </div>
  );
}

function LegalText({ text }: { text: string }) {
  const references = [
    { value: "https://www.cloudflare.com/privacypolicy/", label: "Cloudflare privacy policy" },
    { value: "https://www.ldi.nrw.de/", label: "LDI NRW" },
    { value: "contact@vincentmay.com", label: "contact@vincentmay.com" },
    { value: "/legal-notice", label: "Legal notice / Impressum" },
  ];
  const reference = references.find(({ value }) => text.includes(value));
  if (!reference) return text;
  const position = text.indexOf(reference.value);
  const href = reference.value.includes("@") ? `mailto:${reference.value}` : reference.value;
  return <>
    {text.slice(0, position)}
    {reference.value === "/legal-notice" ? (
      <Link to="/legal-notice" style={{ textDecoration: "underline" }}>{reference.label}</Link>
    ) : (
      <a href={href} style={{ textDecoration: "underline" }}>{reference.label}</a>
    )}
    {text.slice(position + reference.value.length)}
  </>;
}
