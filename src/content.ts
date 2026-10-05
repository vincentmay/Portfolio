export type Locale = "en";

type Localized = Record<Locale, string>;

export type Project = {
  name: string;
  meta: Localized;
  description: Localized;
  stack: readonly string[];
  href: string;
};

export const copy = {

  en: {
    meta: {
      title: "Vincent May — Full-stack developer",
      description:
        "Vincent May, full-stack developer based in Essen, Germany. Java on the backend, React and TypeScript on the frontend, self-built tools in between.",
    },
    skip: "Skip to content",
    nav: { work: "Work", about: "About", contact: "Contact" },
    stages: {
      index: "Start",
      focus: "Focus",
      work: "Work",
      about: "About",
      method: "Principles",
      contact: "Contact",
    },
    index: {
      role: "Full-stack developer",
      place: "Essen, Germany",
      lead: "At GFOS mbH I build software that runs inside other people's working day — Java at the core, React and TypeScript at the surface. Alongside it I build the tools I keep wishing existed while doing that work.",
      cta: "See the work",
      scroll: "Scroll",
    },
    focus: {
      index: "01",
      title: "Focus",
      note: "Four areas I'm at home in.",
      items: [
        {
          title: "Backend",
          tools: "Java · domain models · APIs",
          body: "Systems that still have to make sense ten years from now. I like the part nobody sees and everything rests on.",
        },
        {
          title: "Frontend",
          tools: "React · TypeScript · accessibility",
          body: "Interfaces that need no explaining: clear states, full keyboard operation, honest feedback instead of endless spinners.",
        },
        {
          title: "Tooling",
          tools: "Electron · Bun · build pipelines",
          body: "Anything done by hand three times a day becomes a tool. Usually a small program that makes a large annoyance disappear.",
        },
        {
          title: "Graphics",
          tools: "WebGL · simulation · Unity",
          body: "Particles, flocks, shaders. This page is an example of it: around a hundred thousand points rearranging themselves as you scroll.",
        },
      ],
    },
    work: {
      index: "02",
      title: "Work",
      note: "Three public repositories. No portfolio filler — this either runs or has run.",
      repository: "View repository",
    },
    about: {
      index: "03",
      title: "About",
      lead: "I'm Vincent May, a full-stack developer from Essen, Germany.",
      body: [
        "At GFOS mbH I work on software other people have to use every day — not want to, have to. That shapes how I build: I'd rather have a model that holds than a surface that impresses.",
        "What interests me is the point where the technology disappears. I work in German and English, from the data model to the last interaction detail — and I keep testing where AI tooling genuinely carries weight and where it only adds noise.",
      ],
      portraitAlt: "Vincent May",
      facts: [
        ["Role", "Full-stack developer"],
        ["Based in", "Essen, Germany"],
        ["Currently", "GFOS mbH"],
        ["Core stack", "Java · TypeScript · React"],
        ["Languages", "German · English"],
      ],
    },
    method: {
      index: "04",
      title: "Principles",
      note: "Four sentences I'm happy to be measured against.",
      items: [
        {
          title: "The model comes first.",
          body: "Before any interface exists, the domain has to be right: names, states, boundaries. Everything after that gets easier — or it doesn't.",
        },
        {
          title: "Code is read more often than written.",
          body: "Small units, honest names, no cleverness that has to be decoded again six months later.",
        },
        {
          title: "Repetition is a request for a tool.",
          body: "Repeated manual work is usually a good starting point for a tool.",
        },
        {
          title: "Done means usable.",
          body: "Operable by keyboard, bearable on a slow connection, calm when motion is reduced. Otherwise it isn't finished, only nearly.",
        },
      ],
    },
    contact: {
      index: "05",
      title: "Contact",
      body: "Write to me — about projects, questions, or a proper technical conversation. German or English, either is welcome.",
      email: "contact@vincentmay.com",
      elsewhere: "Elsewhere",
    },
    footer: {
      rights: "© 2026 Vincent May",
      colophon:
        "Built with React, TypeScript and WebGL2. No framework for the animation: one vertex shader, five states, around a hundred thousand points. Type: Manrope and DM Mono.",
      imprint: "Legal notice",
      privacy: "Privacy",
      back: "Back to home",
      top: "Back to top",
    },
  },
} as const;

export const projects: readonly Project[] = [
  {
    name: "Boids",
    meta: { en: "Simulation · Open source" },
    description: {
      en: "Craig Reynolds' flocking model in C# and Unity: separation, alignment and cohesion as three adjustable rules. Three lines of behaviour that add up to a whole flock — the shortest answer to why simulation interests me.",
    },
    stack: ["C#", "Unity"],
    href: "https://github.com/vincentmay/Boids",
  },
  {
    name: "Mentor Hub",
    meta: { en: "Prototype · Open source" },
    description: {
      en: "An early multilingual prototype around a mentoring idea: profiles, roles, matching. Published deliberately as an experiment rather than a finished product — an honest record of where I started.",
    },
    stack: ["JavaScript", "CSS", "i18n"],
    href: "https://github.com/vimfinity/mentor-hub",
  },
];

export const social = [
  { label: "GitHub", handle: "@vincentmay", href: "https://github.com/vincentmay" },
  { label: "LinkedIn", handle: "vincent-may", href: "https://www.linkedin.com/in/vincent-may/" },
] as const;
