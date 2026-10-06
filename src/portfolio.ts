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
      "en": "Turn a ticket into a complete development workspace. Repositories, agents, builds, and services—connected."
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
        "title": { "en": "Start with the whole change." },
        "body": { "en": "A ticket can touch several repositories. The setup finds its branches, reuses matching workspaces, and creates a coding-agent thread for each participant. Review the release, database, backend connection, and deployable artifacts together. Preparing the worktrees is a separate choice from building and starting the application." }
      },
      {
        "image": "/projects/gfos-code-build.webp",
        "imageSrcSet": "/projects/gfos-code-build-960.webp 960w, /projects/gfos-code-build-1440.webp 1440w, /projects/gfos-code-build.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": { "en": "GFOS Code Build preview showing five modules across three Java repositories, module selection, and separate build-only and build-and-run actions" },
        "caption": { "en": "Build preview · sample Maven modules · test toolchain" },
        "title": { "en": "Make the build a decision you can inspect." },
        "body": { "en": "See which modules will build and why before execution. Changed mode follows module inputs and affected dependencies; Full build and Selected give explicit control. The Build view keeps module results, output, diagnostics, and history together, with separate actions for compilation and deployment." }
      },
      {
        "image": "/projects/gfos-code-services.webp",
        "imageSrcSet": "/projects/gfos-code-services-960.webp 960w, /projects/gfos-code-services-1440.webp 1440w, /projects/gfos-code-services.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": { "en": "GFOS Code Services view with two isolated application servers, HTTP, management and debug ports, frontend dev server, and backend selection" },
        "caption": { "en": "Service lifecycle · actual orchestration · Maven, WildFly, and npm stubs" },
        "title": { "en": "Own the environment, not just the process." },
        "body": { "en": "Each ticket gets its own application-server instances, port allocation, build cache, and frontend dev server. The Services view exposes startup steps, deployment state, and the frontend’s backend connection. Stop, restart, and teardown act on the ticket’s Stack while its repository threads retain the shared context." }
      }
    ],
    "demo": "/demos/gfos-code/index.html",
    "intro": {
      "en": "A single business-software change can span shared Java libraries, backend services, and frontend applications. Getting ready to work often means reconstructing the ticket, checking out several branches, choosing a release toolchain, and bringing up the right services. I’m building GFOS Code to make that one coherent workflow: choose the ticket, prepare its workspaces, work with agents, then build and run the application with the same context."
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
          "en": "Build what changed. Know why."
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
          "en": "Close the loop on the work"
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
      "en": "Bring coding agents into Minecraft. Direct a build, inspect its geometry, and iterate toward a usable schematic."
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
      "en": "Blockwright turns Minecraft building into a conversation with a coding agent. Give it a brief, attach references, and share a build site. The agent writes a Python program in its own workspace, renders the result, examines what it made, and revises it. The output is an actual Litematica schematic, with its history and evidence attached. The ambition is open-ended creative work you can direct—not a catalogue of preset structures."
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
          "en": "A workspace for the whole creative loop"
        },
        "body": {
          "en": "The Fabric studio connects to native Codex and Claude runtimes through a local Python daemon. Threads retain their conversations, drafts, build versions, and tool activity. You can steer a running agent, queue the next request, attach an image, or give it a selected area’s terrain and player position. Closing the screen leaves the daemon in charge of the work."
        }
      },
      {
        "title": {
          "en": "Give the agent tools to see and reason"
        },
        "body": {
          "en": "Python, NumPy, geometry helpers, and exact Minecraft block states give the agent a programmable design space. Blockpedia supplies measured colour and texture information; game-derived geometry includes shaped blocks and transparent materials. Renders and structural checks let the agent inspect the result and make targeted revisions instead of stopping at its first export."
        }
      },
      {
        "title": {
          "en": "Review the artifact that will actually be delivered"
        },
        "body": {
          "en": "Builds pass registry and structural checks before delivery. Independent visual review runs in a fresh, read-only agent session with a selectable model. Claims about working mechanisms can be checked in an isolated Minecraft GameTest; the evidence binds to the exact schematic and test bytes. Material reports and terrain-fit checks help bridge the gap between a rendered concept and a build you can place."
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
      "en": "A design space, not a template library."
    },
    "galleryIntro": {
      "en": "Different briefs, the same agent workspace. Each image renders an authored Minecraft build with its actual three-dimensional geometry."
    },
    "features": [
      {
        "image": "/projects/blockwright-studio.webp",
        "imageSrcSet": "/projects/blockwright-studio-960.webp 960w, /projects/blockwright-studio-1440.webp 1440w, /projects/blockwright-studio.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 760,
        "alt": {
          "en": "Blockwright’s actual Minecraft studio showing the Tidal Engine brief and the agent’s design response."
        },
        "caption": {
          "en": "Build brief · in-game Studio"
        },
        "title": {
          "en": "The brief stays in the build’s thread."
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
          "en": "Blockwright’s actual studio with the delivered Tidal Engine schematic, structural evidence, and the independent review-model menu open."
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
      "en": "Consumer product · multi-perspective viewing"
    },
    "summary": {
      "en": "One story, many perspectives. Discover the crew, build your own live view, and pick up where you left off."
    },
    "focus": {
      "en": "Product engineering / real-time systems"
    },
    "stack": [
      "React",
      "TypeScript",
      "TanStack Query",
      "Node.js",
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
      "en": "A roleplay story unfolds across people, channels, and places. Following it through separate stream tabs loses the connections. POVLINE is an independent NoPixel viewing companion that joins those pieces: discover creators and crews, assemble the perspectives you care about, explore reported city events, and return to moments through broadcast history. I built the product experience and the data infrastructure together."
    },
    "flow": {
      "en": [
        "Discover creators",
        "Follow a crew",
        "Arrange perspectives",
        "Save a scene",
        "Revisit a moment"
      ]
    },
    "sections": [
      {
        "title": {
          "en": "Watching is a workspace"
        },
        "body": {
          "en": "Save up to 24 perspectives in a scene and arrange up to four simultaneous panes. Equal tiles, a main perspective, columns, and rows are starting points: drag to move or swap a pane, resize a split, focus one channel, and undo layout changes. Individual playback and audio controls keep it usable. Player identity survives rearrangement; a desktop mini-player lets watching continue while browsing."
        }
      },
      {
        "title": {
          "en": "A live product needs a reliable data layer"
        },
        "body": {
          "en": "The Node backend validates and caches public feeds, coalesces concurrent requests, and backs off when a source fails. A shared refresh loop publishes live snapshots over SSE. In the browser, tab leadership keeps one live connection across open tabs, with reconnect handling and a polling fallback. Freshness comes from source timestamps, so expired data and source failures remain visible."
        }
      },
      {
        "title": {
          "en": "Make the experience survive navigation"
        },
        "body": {
          "en": "Search, filters, selected scenes, perspectives, and history dates are reflected in the URL. Saved scenes, follows, favourites, and private notes live in a local library with validated backup import and export. Scene links carry the information another device needs. Public discovery, crew, and map pages also have server-rendered content and canonical metadata."
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
          "en": "Choose what gets your attention."
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
          "en": "Follow people, not a pile of tabs."
        },
        "body": {
          "en": "Find a crew, inspect its roster, and open the available live perspectives together. Automatic crew views follow roster changes; editing one gives you a manual scene you control. Twitch and Kick preferences connect discovery directly to the viewing workspace."
        }
      },
      {
        "image": "/projects/povline-map.webp",
        "imageSrcSet": "/projects/povline-map-960.webp 960w, /projects/povline-map-1440.webp 1440w, /projects/povline-map.webp 1920w",
        "imageWidth": 1920,
        "imageHeight": 1080,
        "alt": {
          "en": "POVLINE’s actual Los Santos map with a selected reported incident and participant details."
        },
        "caption": {
          "en": "City map · selected source-reported incident"
        },
        "title": {
          "en": "Give the story a place."
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
          "en": "POVLINE’s actual broadcast-history comparison showing six overlapping broadcasts and approximate offsets for a selected time."
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
    "role": "Full-stack developer",
    "place": "Hattingen, Germany",
    "heading": [
      "I build software.",
      "And the tools",
      "I wish I had."
    ],
    "intro": "I’m Vincent. I work on business software at GFOS, then follow my curiosity into developer tools, agent workspaces, and the occasional Minecraft rabbit hole.",
    "cta": "Explore my work",
    "hello": "Say hello",
    "desk": "A few things from my workbench",
    "index": "Selected work",
    "workTitle": [
      "Different problems.",
      "Same curiosity."
    ],
    "workIntro": "Developer workflows, creative agents, and a live viewing product. Built from the interface down to the systems behind it.",
    "read": "Inside the project",
    "source": "Source code",
    "demo": "Explore the workflow",
    "aboutIndex": "About",
    "aboutTitle": [
      "Hi, I’m Vincent.",
      "I tend to keep building."
    ],
    "aboutBody": [
      "I’m a full-stack developer based in Hattingen, Germany. At GFOS mbH, I work with Java, React, and TypeScript on software people use in their working day.",
      "Outside that work, I usually have a project open. Sometimes it removes friction from a build workflow. Sometimes it follows a story across livestreams. Sometimes it turns Python into a galaxy.",
      "I’m looking for a team where I can work close to the product, take responsibility for what I ship, and keep learning from people who care about their craft."
    ],
    "skills": "The tools I reach for",
    "current": "Currently",
    "location": "Based in",
    "languages": "Languages",
    "languageValue": "German & English",

    "contactIndex": "Contact",
    "contactTitle": [
      "Something in common?",
      "Let’s talk."
    ],
    "contactBody": "An interesting role, a project to build together, or a question about the work—my inbox is open.",
    "footer": "Built in Hattingen, Germany.",
    "legal": "Legal notice / Impressum",
    "privacy": "Privacy",
    "top": "Back to top",
    "back": "All projects",
    "overview": "Project overview",
    "engineering": "Under the surface",
    "next": "Next project",
    "missing": "Project not found"
  }
} as const;
