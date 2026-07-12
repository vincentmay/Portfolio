export type Locale = "de" | "en";

type Localized = Record<Locale, string>;

export type Project = {
  name: string;
  meta: Localized;
  description: Localized;
  stack: readonly string[];
  href: string;
};

export const copy = {
  de: {
    meta: {
      title: "Vincent May — Full-Stack-Entwickler",
      description: "Vincent May, Full-Stack-Entwickler aus Essen. Java, React und TypeScript.",
    },
    skip: "Zum Inhalt",
    nav: { work: "Projekte", about: "Über mich", contact: "Kontakt" },
    hero: {
      role: "Full-Stack-Entwickler — Essen",
      intro: "Ich entwickle Software bei der GFOS mbH: Java im Backend, React und TypeScript im Frontend. Daneben baue ich eigene Entwickler-Werkzeuge und beschäftige mich mit KI-Werkzeugen in der Entwicklung.",
      cta: "Projekte ansehen",
    },
    work: {
      title: "Projekte",
      note: "Drei öffentliche Projekte auf GitHub.",
      repository: "Repository",
    },
    focus: {
      title: "Arbeitsfelder",
      items: [
        ["Backend", "Java, Enterprise-Software"],
        ["Frontend", "React, TypeScript, Zugänglichkeit"],
        ["Tooling", "Electron, Build-Werkzeuge, KI-gestützte Workflows"],
      ],
    },
    about: {
      title: "Über mich",
      lead: "Ich bin Vincent May, Full-Stack-Entwickler aus Essen, aktuell bei der GFOS mbH.",
      body: "Mich interessieren langlebige Systeme und Oberflächen, die man nicht erklären muss. Ich arbeite auf Deutsch und Englisch — vom Datenmodell bis zum Interaktionsdetail.",
      portraitAlt: "Vincent May",
      facts: [
        ["Rolle", "Full-Stack-Entwickler"],
        ["Standort", "Essen, Deutschland"],
        ["Aktuell", "GFOS mbH"],
        ["Sprachen", "Deutsch / Englisch"],
      ],
    },
    contact: {
      title: "Kontakt",
      body: "Schreib mir für Projekte, Fragen oder einen fachlichen Austausch — auf Deutsch oder Englisch.",
      email: "contact@vincentmay.com",
    },
    footer: {
      rights: "© 2026 Vincent May",
      imprint: "Impressum",
      privacy: "Datenschutz",
      back: "Zurück zur Startseite",
    },
  },
  en: {
    meta: {
      title: "Vincent May — Full-stack developer",
      description: "Vincent May, full-stack developer based in Essen. Java, React, and TypeScript.",
    },
    skip: "Skip to content",
    nav: { work: "Projects", about: "About", contact: "Contact" },
    hero: {
      role: "Full-stack developer — Essen",
      intro: "I build software at GFOS mbH: Java on the backend, React and TypeScript on the frontend. On the side I build my own developer tools and work with AI tooling in development.",
      cta: "View projects",
    },
    work: {
      title: "Projects",
      note: "Three public projects on GitHub.",
      repository: "Repository",
    },
    focus: {
      title: "Focus",
      items: [
        ["Backend", "Java, enterprise software"],
        ["Frontend", "React, TypeScript, accessibility"],
        ["Tooling", "Electron, build tools, AI-assisted workflows"],
      ],
    },
    about: {
      title: "About",
      lead: "I’m Vincent May, a full-stack developer from Essen, currently at GFOS mbH.",
      body: "I care about long-lived systems and interfaces that need no explanation. I work in German and English — from the data model to the interaction detail.",
      portraitAlt: "Vincent May",
      facts: [
        ["Role", "Full-stack developer"],
        ["Based in", "Essen, Germany"],
        ["Currently", "GFOS mbH"],
        ["Languages", "German / English"],
      ],
    },
    contact: {
      title: "Contact",
      body: "Write to me about projects, questions, or a technical conversation — in German or English.",
      email: "contact@vincentmay.com",
    },
    footer: {
      rights: "© 2026 Vincent May",
      imprint: "Legal notice",
      privacy: "Privacy",
      back: "Back to home",
    },
  },
} as const;

export const projects: readonly Project[] = [
  {
    name: "GFOS Build",
    meta: { de: "Desktop-App · Alpha", en: "Desktop app · Alpha" },
    description: {
      de: "Eine Desktop-Anwendung, die Maven-Projekte im Workspace findet und mehrstufige Build-Pipelines mit Live-Logs ausführt.",
      en: "A desktop application that discovers Maven projects in a workspace and runs multi-step build pipelines with live logs.",
    },
    stack: ["TypeScript", "Electron", "React", "Bun", "SQLite"],
    href: "https://github.com/vimfinity/GFOS-Build",
  },
  {
    name: "Boids",
    meta: { de: "Simulation · Open Source", en: "Simulation · Open source" },
    description: {
      de: "Eine C#-Umsetzung des Flocking-Modells von Craig Reynolds in Unity: Separation, Ausrichtung und Kohäsion als einstellbare Regeln.",
      en: "A C# implementation of Craig Reynolds’ flocking model in Unity: separation, alignment, and cohesion as adjustable rules.",
    },
    stack: ["C#", "Unity"],
    href: "https://github.com/vincentmay/Boids",
  },
  {
    name: "Mentor Hub",
    meta: { de: "Prototyp · Open Source", en: "Prototype · Open source" },
    description: {
      de: "Ein früher, mehrsprachiger JavaScript-Prototyp zu einer Mentoring-Idee — als Experiment veröffentlicht, nicht als fertiges Produkt.",
      en: "An early multilingual JavaScript prototype around a mentoring idea — published as an experiment, not a finished product.",
    },
    stack: ["JavaScript", "CSS", "i18n"],
    href: "https://github.com/vimfinity/mentor-hub",
  },
];

export const social = [
  { label: "GitHub", href: "https://github.com/vincentmay" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/vincent-may/" },
] as const;
