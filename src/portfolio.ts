import type { Locale } from "./content";

type Text = Record<Locale, string>;
export type ProjectImage = {
  image: string;
  imageSrcSet?: string;
  imageWidth: number;
  imageHeight: number;
  alt: Text;
  caption: Text;
  featured?: boolean;
};
export type CaseStudy = ProjectImage & {
  id: string;
  name: string;
  kind: Text;
  summary: Text;
  seo: { title: Text; description: Text };
  focus: Text;
  contribution: Text;
  stage: Text;
  stack: string[];
  examples?: ProjectImage[];
  galleryHeading?: Text;
  galleryIntro?: Text;
  features?: (ProjectImage & { title: Text; body: Text })[];
  source?: string;
  demo?: string;
  demoLabel?: Text;
  intro: Text;
  sections: { title: Text; body: Text }[];
  flow: Record<Locale, string[]>;
};
export const work: CaseStudy[] = [
  {
    "id": "gfos-code",
    "name": "GFOS Code",
    "contribution": {
      "en": "Designed and built the ticket workflow, multi-repository orchestration, incremental builds, runtime lifecycle, and activity review."
    },
    "stage": {
      "en": "Self-directed project · private T3 Code fork"
    },
    "kind": {
      "en": "Developer tools · multi-repository workspaces"
    },
    "summary": {
      "en": "A ticket-driven workspace for multi-repository development. Coordinate coding agents, incremental builds, and isolated application environments."
    },
    "seo": {
      "title": { "en": "GFOS Code: Developer Workspace | Vincent May" },
      "description": { "en": "Explore Vincent May’s GFOS Code project: a T3 Code fork connecting tickets, coding agents, multi-repository worktrees, Maven builds, and isolated runtimes." }
    },
    "focus": {
      "en": "Developer experience / full stack"
    },
    "stack": [
      "TypeScript",
      "React",
      "Effect",
      "Node.js",
      "Electron",
      "Maven"
    ],
    "image": "/projects/gfos-code.webp",
    "imageSrcSet": "/projects/gfos-code-960.webp 960w, /projects/gfos-code-1440.webp 1440w, /projects/gfos-code.webp 1920w",
    "imageWidth": 1920,
    "imageHeight": 1080,
    "alt": {
      "en": "GFOS Code ticket workspace showing acceptance criteria, four repository threads, release context, and the running ticket Stack"
    },
    "caption": {
      "en": "Ticket workspace · fictional data · isolated test toolchain"
    },
    "features": [
      {
        "image": "/projects/gfos-code-setup.webp",
        "imageSrcSet": "/projects/gfos-code-setup-960.webp 960w, /projects/gfos-code-setup-1440.webp 1440w, /projects/gfos-code-setup.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": { "en": "GFOS Code Stack setup reviewing four ticket repositories, worktree preparation, release, database, backend connection, and deployable EARs" },
        "caption": { "en": "Stack setup · real interface with sample repositories" },
        "title": { "en": "Prepare every repository for the ticket." },
        "body": { "en": "A ticket can touch several repositories. The setup finds its branches, reuses matching workspaces, and creates a coding-agent thread for each participant. Review the release, database, backend connection, and deployable artifacts together. Preparing the worktrees is a separate choice from building and starting the application." }
      },
      {
        "image": "/projects/gfos-code-build.webp",
        "imageSrcSet": "/projects/gfos-code-build-960.webp 960w, /projects/gfos-code-build-1440.webp 1440w, /projects/gfos-code-build.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": { "en": "GFOS Code Build preview showing five modules across three Java repositories, module selection, and separate build-only and build-and-run actions" },
        "caption": { "en": "Build preview · sample Maven modules · test toolchain" },
        "title": { "en": "Inspect the build before it runs." },
        "body": { "en": "See which modules will build and why before execution. Changed mode follows module inputs and affected dependencies; Full build and Selected give explicit control. The Build view keeps module results, output, diagnostics, and history together, with separate actions for compilation and deployment." }
      },
      {
        "image": "/projects/gfos-code-services.webp",
        "imageSrcSet": "/projects/gfos-code-services-960.webp 960w, /projects/gfos-code-services-1440.webp 1440w, /projects/gfos-code-services.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": { "en": "GFOS Code Services view with two isolated application servers, HTTP, management and debug ports, frontend dev server, and backend selection" },
        "caption": { "en": "Service lifecycle · actual orchestration · Maven, WildFly, and npm stubs" },
        "title": { "en": "Manage an isolated runtime for each ticket." },
        "body": { "en": "Each ticket gets its own application-server instances, port allocation, build cache, and frontend dev server. The Services view exposes startup steps, deployment state, and the frontend’s backend connection. Stop, restart, and teardown act on the ticket’s Stack while its repository threads retain the shared context." }
      }
    ],
    "demo": "/demos/gfos-code/index.html",
    "demoLabel": { "en": "View the walkthrough" },
    "intro": {
      "en": "A business-software change can span shared Java libraries, backend services, and frontend applications. Before development starts, someone has to connect the ticket to the right branches, release toolchain, and running services. I’m building GFOS Code to coordinate that workflow: prepare the ticket’s repositories, work with coding agents, and build and run the application in an isolated environment. My integration extends T3 Code’s agent harness and clients with the ticket and runtime lifecycle."
    },
    "flow": {
      "en": [
        "Ticket & requirements",
        "Coordinated worktrees",
        "Repository agent threads",
        "Build & deploy",
        "Review activity"
      ]
    },
    "sections": [
      {
        "title": {
          "en": "Incremental builds with an explicit plan"
        },
        "body": {
          "en": "The build system derives dependency order from Maven POMs and tracks module inputs, including uncommitted changes. Auto mode selects changed modules and their affected consumers; generated inputs and deployable EAR packages are part of that decision. Build previews explain the selection before execution. A verified artifact can be reused when its inputs still match, while uncertain state falls back to a full build."
        }
      },
      {
        "title": {
          "en": "One ticket, explicit runtime ownership"
        },
        "body": {
          "en": "A Stack is shared by the ticket’s repository threads. It owns isolated worktrees, Maven caches, application-server instances, and allocated ports. Build and deployment are separate actions: prepare the code, build selected modules, or build and start the application. Release-specific Java and WildFly configurations, frontend backend selection, retained build history, and restart recovery make the lifecycle inspectable."
        }
      },
      {
        "title": {
          "en": "An integration designed to survive upstream changes"
        },
        "body": {
          "en": "I build the GFOS workflow in dedicated modules on top of T3 Code’s open-source agent harness and base clients. That gives repository threads the existing agent, diff, and terminal experience while keeping the ticket and Stack lifecycle cohesive. The Windows client and WSL execution environment retain explicit ownership of paths, build tools, and deployed artifacts."
        }
      },
      {
        "title": {
          "en": "Review activity across agent sessions"
        },
        "body": {
          "en": "Ticket activity can be reviewed by week or month, with editable descriptions and an allocation of overlapping agent sessions. It connects the development work back to the ticket without double-counting simultaneous turns. These are activity estimates for review; they do not automatically book time into company systems."
        }
      }
    ]
  },
  {
    "id": "blockwright",
    "name": "Blockwright",
    "contribution": {
      "en": "Built the in-game studio, local agent runtime, Python geometry toolkit, game-derived material data, and artifact verification pipeline."
    },
    "stage": {
      "en": "Personal toolchain · private repository"
    },
    "kind": {
      "en": "Agent workspace · creative tooling"
    },
    "summary": {
      "en": "An in-game workspace for coding agents to design, render, and verify Minecraft builds. From a brief to an editable Litematica schematic."
    },
    "seo": {
      "title": { "en": "Blockwright: AI Minecraft Building | Vincent May" },
      "description": { "en": "Blockwright gives Codex and Claude a Minecraft studio, Python geometry tools, renders, and artifact checks to create and revise Litematica schematics." }
    },
    "focus": {
      "en": "Agent tooling / graphics / validation"
    },
    "stack": [
      "Python",
      "NumPy",
      "Java",
      "Fabric",
      "Minecraft"
    ],
    "image": "/projects/blockwright-stellar-002.webp",
    "imageSrcSet": "/projects/blockwright-stellar-002-960.webp 960w, /projects/blockwright-stellar-002-1920.webp 1920w, /projects/blockwright-stellar-002.webp 3840w",
    "imageWidth": 3840,
    "imageHeight": 2400,
    "alt": {
      "en": "Stellar Star 002: a Minecraft sculpture with long white voxel arms, recessed violet edges, and a thick diagonal orbital band, viewed from a slight angle"
    },
    "caption": {
      "en": "Stellar Star 002 · schematic render"
    },
    "examples": [
      {
        "image": "/projects/blockwright-fable-universe.webp",
        "imageSrcSet": "/projects/blockwright-fable-universe-960.webp 960w, /projects/blockwright-fable-universe-1920.webp 1920w, /projects/blockwright-fable-universe.webp 3840w",
        "imageWidth": 3840,
        "imageHeight": 2400,
        "featured": true,
        "alt": {
          "en": "A volumetric Minecraft universe with a white spiral galaxy, blue dust lanes, a ringed gas giant, a blue-green planet, coloured nebulae, and a surrounding three-dimensional star field"
        },
        "caption": {
          "en": "Fable Universe · 400 × 250 × 400 blocks · schematic render"
        }
      },
      {
        "image": "/projects/blockwright-solar.webp",
        "imageSrcSet": "/projects/blockwright-solar-960.webp 960w, /projects/blockwright-solar-1920.webp 1920w, /projects/blockwright-solar.webp 3840w",
        "imageWidth": 3840,
        "imageHeight": 2400,
        "alt": {
          "en": "A floating Minecraft sculpture with broken copper rings, layered dark fins, glass, and a bright amber core visible through the open frame"
        },
        "caption": {
          "en": "Solar Containment · schematic render"
        }
      },
      {
        "image": "/projects/blockwright-tidal.webp",
        "imageSrcSet": "/projects/blockwright-tidal-960.webp 960w, /projects/blockwright-tidal-1920.webp 1920w, /projects/blockwright-tidal.webp 3840w",
        "imageWidth": 3840,
        "imageHeight": 2400,
        "alt": {
          "en": "An angled render of the Tidal Engine Minecraft schematic: a layered copper-and-prismarine rotor between two unequal towers, with bridges, stairs, and illuminated walkways"
        },
        "caption": {
          "en": "Tidal Engine · schematic render"
        }
      },
      {
        "image": "/projects/blockwright-under-glass.webp",
        "imageSrcSet": "/projects/blockwright-under-glass-960.webp 960w, /projects/blockwright-under-glass-1920.webp 1920w, /projects/blockwright-under-glass.webp 3840w",
        "imageWidth": 3840,
        "imageHeight": 2400,
        "featured": true,
        "alt": {
          "en": "A three-dimensional Minecraft universe sculpture, with cutaway glass shells, blue and purple spiral arms, intersecting orbital rings, and a raised viewing walkway"
        },
        "caption": {
          "en": "Universe Under Glass · schematic render"
        }
      }
    ],
    "intro": {
      "en": "Blockwright gives coding agents a complete toolchain for Minecraft creation. Start a conversation in the game, describe a build, and provide image references or terrain context. The agent writes Python geometry code, renders the result, inspects it, and revises the design. Each delivered Litematica schematic keeps its version history and verification evidence. I built the studio, agent runtime, authoring tools, and review pipeline to support open-ended work ranging from architecture to volumetric sculptures and tested mechanisms."
    },
    "flow": {
      "en": [
        "Brief & references",
        "In-game agent thread",
        "Programmatic geometry",
        "Inspect & revise",
        "Verified artifact"
      ]
    },
    "sections": [
      {
        "title": {
          "en": "Persistent agents inside the game"
        },
        "body": {
          "en": "The Fabric studio connects to native Codex and Claude runtimes through a local Python daemon. Threads retain their conversations, drafts, build versions, and tool activity. You can steer a running agent, queue the next request, attach an image, or give it a selected area’s terrain and player position. Closing the screen leaves the daemon in charge of the work."
        }
      },
      {
        "title": {
          "en": "Geometry and materials the agent can inspect"
        },
        "body": {
          "en": "Python, NumPy, geometry helpers, and exact Minecraft block states give the agent a programmable design space. Blockpedia supplies measured colour and texture information; game-derived geometry includes shaped blocks and transparent materials. Renders and structural checks let the agent inspect the result and make targeted revisions instead of stopping at its first export."
        }
      },
      {
        "title": {
          "en": "Verification tied to the delivered schematic"
        },
        "body": {
          "en": "Registry and structural checks validate the exported blocks. Independent visual review runs in a fresh, read-only agent session with a selectable model. A build’s declared mechanical behaviour can be tested in an isolated Minecraft GameTest, with evidence bound to the exact schematic and test bytes. Material reports and terrain-fit checks support placement planning. Delivery produces a schematic for the player to load with Litematica."
        }
      },
      {
        "title": {
          "en": "From this portfolio’s star to a volumetric universe"
        },
        "body": {
          "en": "Stellar Star 002 translates the portfolio’s logo reference into a voxel sculpture. The other examples explore transparent enclosures, industrial sections, orbital structures, and a universe with planets arranged throughout its full volume. These presentation renders use the authored voxel geometry with studio lighting. The turbine and containment array are sculptural designs; their appearance does not imply working machinery."
        }
      }
    ],
    "galleryHeading": {
      "en": "Builds created with the agent toolchain."
    },
    "galleryIntro": {
      "en": "Sculptures, orbital structures, and volumetric universes created from different briefs. These studio renders use the delivered schematics’ voxel geometry with presentation lighting."
    },
    "features": [
      {
        "image": "/projects/blockwright-studio.webp",
        "imageSrcSet": "/projects/blockwright-studio-960.webp 960w, /projects/blockwright-studio-1440.webp 1440w, /projects/blockwright-studio.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 760,
        "alt": {
          "en": "Blockwright’s Minecraft studio showing the Tidal Engine brief and the agent’s design response."
        },
        "caption": {
          "en": "Build brief · in-game Studio"
        },
        "title": {
          "en": "Direct the build in a persistent agent thread."
        },
        "body": {
          "en": "Give the agent a brief, a reference image, or terrain context from the game. It can write geometry code, inspect renders, and revise the build in the same thread. The Studio keeps the model, design intent, tool activity, and subsequent versions together, with steering and queued follow-ups while work is running."
        }
      },
      {
        "image": "/projects/blockwright-review.webp",
        "imageSrcSet": "/projects/blockwright-review-960.webp 960w, /projects/blockwright-review-1440.webp 1440w, /projects/blockwright-review.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 760,
        "alt": {
          "en": "Blockwright’s studio with the delivered Tidal Engine schematic, structural evidence, and the independent review-model menu open."
        },
        "caption": {
          "en": "Schematic delivery · independent review"
        },
        "title": {
          "en": "An independent review, tied to the build."
        },
        "body": {
          "en": "The versioned schematic and its verification record stay attached to the conversation. Choose a separate model for a fresh, read-only visual review. Structural checks and mechanical tests are reported separately; GameTest evidence binds to the exact artifact and test bytes, keeping each claim traceable to the delivered build."
        }
      }
    ]
  },
  {
    "id": "city-signal",
    "name": "POVLINE",
    "demo": "https://povline.vincentmay.com/",
    "demoLabel": { "en": "Try POVLINE" },
    "contribution": {
      "en": "Designed and built the discovery-to-viewer experience, interactive layouts, crew following, live-data backend, scene library, map, and broadcast history."
    },
    "stage": {
      "en": "Independent fan project"
    },
    "kind": {
      "en": "Live web product · multi-stream viewing"
    },
    "summary": {
      "en": "A NoPixel multi-stream viewer connecting creators, crews, live perspectives, and broadcast history. Arrange your view and save it for later."
    },
    "seo": {
      "title": { "en": "POVLINE: NoPixel Multi-stream Viewer | Vincent May" },
      "description": { "en": "POVLINE is Vincent May’s independent NoPixel viewer: customizable multi-stream layouts, creator and crew discovery, saved views, maps, and broadcast history." }
    },
    "focus": {
      "en": "Product engineering / real-time systems"
    },
    "stack": [
      "React",
      "TypeScript",
      "Effect",
      "Cloudflare Workers",
      "Durable Objects",
      "Leaflet"
    ],
    "image": "/projects/povline-main.webp",
    "imageWidth": 1672,
    "imageHeight": 1080,
    "alt": {
      "en": "POVLINE’s Brick Bois viewer with anthonyz as the main perspective and live-channel previews from buddha, omie, and xqc stacked alongside."
    },
    "caption": {
      "en": "Brick Bois · one main perspective · three supporting live previews"
    },
    "intro": {
      "en": "NoPixel roleplay unfolds across multiple creators’ streams. Following a crew means finding its channels, choosing perspectives, and keeping track of events across broadcasts. I built POVLINE to connect those tasks in one web application: discover creators, arrange a live multi-stream view, save it, and revisit moments through the map and broadcast history. The project covers the viewing interface, browser-local library, and live-data infrastructure. It is an independent fan project."
    },
    "flow": {
      "en": [
        "Discover creators",
        "Follow a crew",
        "Arrange perspectives",
        "Save your view",
        "Revisit a moment"
      ]
    },
    "sections": [
      {
        "title": {
          "en": "A viewing layout you can control"
        },
        "body": {
          "en": "Save up to 24 perspectives in a view and watch up to four at once. Start with equal tiles or one main perspective, then move or swap panes, resize the splits, focus a channel, and undo layout changes. Playback, audio, and chat controls follow the selected channels. Supported players retain their identity during rearrangement, and the desktop mini-player keeps the view available while browsing. Reloads restore the selection with playback stopped."
        }
      },
      {
        "title": {
          "en": "Live data with explicit freshness and recovery"
        },
        "body": {
          "en": "The Effect backend validates public feeds, caches snapshots, coalesces requests, and backs off after source failures. On Cloudflare, a Durable Object coordinates refreshes with alarms, persists snapshots and cooldowns, and sends updates over hibernating WebSockets. Supporting browsers share one connection across tabs; hidden or offline pages disconnect and recover from current snapshots. Polling remains a fallback. Source timestamps distinguish fresh, expired, and unavailable data."
        }
      },
      {
        "title": {
          "en": "Saved views with clear privacy boundaries"
        },
        "body": {
          "en": "Discovery, watching, following, and saving work without an account. Search, filters, perspectives, and history dates are URL state, while saved views, follows, favourites, and notes stay in the browser’s library. Validated backups support private transfer and recovery. Shared links include the viewing configuration and exclude private notes and personal preferences. Public discovery, creator, crew, map, and history pages render on the server with descriptive titles and canonical URLs."
        }
      }
    ],
    "imageSrcSet": "/projects/povline-main-960.webp 960w, /projects/povline-main-1440.webp 1440w, /projects/povline-main.webp 1672w",
    "features": [
      {
        "image": "/projects/povline-viewer.webp",
        "imageSrcSet": "/projects/povline-viewer-960.webp 960w, /projects/povline-viewer-1440.webp 1440w, /projects/povline-viewer.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": {
          "en": "POVLINE’s equal-tile layout with four Brick Bois Twitch channel previews from anthonyz, buddha, omie, and xqc."
        },
        "caption": {
          "en": "Brick Bois · equal tiles · source-provided live previews"
        },
        "title": {
          "en": "Arrange multiple perspectives in one view."
        },
        "body": {
          "en": "Give one perspective the main stage, or keep all four equally visible. Switch between layout presets, move or swap panes, and resize the splits to follow the story your way. Each channel keeps its own playback and audio controls."
        }
      },
      {
        "image": "/projects/povline-crews.webp",
        "imageSrcSet": "/projects/povline-crews-960.webp 960w, /projects/povline-crews-1440.webp 1440w, /projects/povline-crews.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": {
          "en": "POVLINE’s Brick Bois roster with five creators, four available live perspectives, stream previews, and controls for following or opening the crew together."
        },
        "caption": {
          "en": "Brick Bois roster · four live perspectives · public community data"
        },
        "title": {
          "en": "Open a crew’s live perspectives together."
        },
        "body": {
          "en": "Find a crew, inspect its roster, and open the available live perspectives together. A crew view can follow roster updates or become a saved selection you control. Twitch and Kick preferences connect discovery directly to the viewer."
        }
      },
      {
        "image": "/projects/povline-map.webp",
        "imageSrcSet": "/projects/povline-map-960.webp 960w, /projects/povline-map-1440.webp 1440w, /projects/povline-map.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": {
          "en": "POVLINE’s Los Santos map with a selected reported incident and participant details."
        },
        "caption": {
          "en": "City map · selected source-reported incident"
        },
        "title": {
          "en": "Explore reported events on the city map."
        },
        "body": {
          "en": "The city map connects reported incidents with named participants and source details. It adds context to discovery while keeping the difference between a reported event and a confirmed live perspective visible."
        }
      },
      {
        "image": "/projects/povline-history.webp",
        "imageSrcSet": "/projects/povline-history-960.webp 960w, /projects/povline-history-1440.webp 1440w, /projects/povline-history.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": {
          "en": "POVLINE’s broadcast-history comparison showing six overlapping broadcasts and approximate offsets for a selected time."
        },
        "caption": {
          "en": "Broadcast comparison · reported starts and available VODs"
        },
        "title": {
          "en": "Find the moment across broadcasts."
        },
        "body": {
          "en": "Choose a time to compare overlapping broadcasts and revisit available recordings. Twitch links can jump to an approximate offset. Saved private moments connect the viewer back to that history, even when you return later."
        }
      }
    ]
  }
];

export const words = {
  "en": {
    "skip": "Skip to content",
    "work": "Work",
    "about": "About",
    "contact": "Contact",
    "role": "Product engineer",
    "place": "Hattingen, Germany",
    "metaTitle": "Vincent May | Product Engineer & Full-stack Developer",
    "metaDescription": "Vincent May is a product engineer and full-stack developer in Hattingen, Germany. Explore developer tools, AI agent workspaces, and real-time web products.",
    "heroStatement": "From idea to working software.",
    "intro": "I design and build developer tools, agent workspaces, and live web applications, from the interface to the systems behind them. Full-stack developer at GFOS.",
    "cta": "Explore my work",
    "hello": "Say hello",
    "index": "Selected work",
    "workTitle": [
      "Three projects.",
      "One approach."
    ],
    "workIntro": "Multi-repository development, agent-driven creation, and live viewing. Each project connects a focused interface with the systems that make it work.",
    "read": "Explore the project",
    "source": "Source code",
    "demo": "Explore the workflow",
    "aboutIndex": "About",
    "aboutTitle": [
      "I build across",
      "the whole stack."
    ],
    "aboutBody": [
      "I’m a full-stack developer at GFOS mbH, working on business software with Java, React, and TypeScript. Based in Hattingen, Germany, I also design and build independent tools and web products.",
      "My projects connect interfaces with substantial engineering: coordinating repositories and runtimes in GFOS Code, giving coding agents a creative toolchain in Blockwright, and bringing live discovery, viewing, and saved context together in POVLINE.",
      "I’m looking for a product engineering role where I can own features from the initial problem through release, work directly with users, and keep improving the result. I care about clear interfaces and reliable systems."
    ],
    "skills": "Technologies I work with",
    "current": "Currently",
    "location": "Based in",
    "languages": "Languages",
    "languageValue": "German & English",

    "contactIndex": "Contact",
    "contactTitle": [
      "A role or a project?",
      "Let’s talk."
    ],
    "contactBody": "For product engineering roles, collaboration, or questions about these projects, contact me by email.",
    "footer": "Built in Hattingen, Germany.",
    "legal": "Legal notice / Impressum",
    "privacy": "Privacy",
    "top": "Back to top",
    "back": "All projects",
    "overview": "Project overview",
    "engineering": "Engineering decisions",
    "next": "Next project",
    "missing": "Project not found"
  }
} as const;
