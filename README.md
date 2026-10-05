# vincentmay.com

Vincent May's English portfolio. React, TypeScript, Vite, and TanStack Router.
Local fonts and images; no third-party analytics, embeds, or animation libraries.

```sh
npm ci
npm run dev
npm run build           # TypeScript, Vite, and prerendering of 7 pages
npm run check           # Build, route/asset checks, and pendant geometry checks
npm run check:release   # Fail if public legal details are still missing
npm run preview         # Inspect the production build
npm run icons           # Generate matching SVG, ICO, and touch icons
```

Use Node 24.18.0, pinned in `.node-version` for Cloudflare Pages and GitHub
Actions. The verification workflow installs the lockfile, builds and prerenders
the site, checks routes/assets and the pendant meshes, and runs the legal-copy
release check on pushes to `main` and pull requests.

## Content and routes

`src/portfolio.ts` contains English copy and the three project studies.
`src/routes/Home.tsx` and `src/routes/Project.tsx` present them. Change content in
one place; the client and prerendered pages use the same React components.

The site is English-only. `/` and `/en` serve the homepage, with project routes at
`/en/work/<project>`. The build creates complete HTML for the homepage,
project studies, and English legal pages, including canonical URLs.
Serve `dist/` as a static site; every public route has a prerendered HTML file.

## The identity

The open four-point star and close diagonal band are based on the
[Stellar pendant](https://warpedsense.com/products/stellar-halskette).
`src/brand/pendant-model.ts` builds two closed meshes: a rounded silver frame
with solid tapered tips and small diagonal spurs, and a flattened orbital band.
The model interprets the available product photographs; it is not a measured
replica. `Mark.tsx` draws the small ink version using the shared SVG geometry.
`stellar-webgl.ts` provides studio reflections and interaction in Three.js.
`npm run model:export` regenerates the reusable `public/models/stellar.glb`.

The star anchors the hero, header, section indexes, contact, footer, favicon,
and sharing image. The hero lazily loads Three.js and responds to the pointer
and scroll. Rendering pauses offscreen and while the document is hidden. The
matching raster poster remains available without JavaScript or WebGL, and
returns if the graphics context is lost. Reflections are rebuilt on recovery.
The previous particle
renderer and design explorations are retained
as local experiments; their routes and code are excluded from production.

## Motion and image presentation

The chrome pendant stays in the hero as a three-dimensional object. Native
scroll adds a small turn to its reflections, independent of pointer movement.
The hero occupies one screen rather than a separate pinned docking sequence.

On sufficiently large screens (1100px wide and 760px tall), projects form a
horizontal exhibition on a dark stage. `src/app/work-journey.ts` measures the
panels and maps native vertical scrolling directly to their horizontal position.
Images settle from 96% scale to their full size as they reach the center; copy
settles with them. Project buttons show chapter progress, and keyboard focus
selects its corresponding panel. Forward and reverse scrolling produce the same
poses. Smaller screens, reduced motion and pages without JavaScript retain a
readable vertical gallery. There is no decorative page-wide path or travelling
cursor, and no animation or scrolling library is needed.

`src/app/motion.ts` schedules one frame per scroll/resize event, measures stable
layout after fonts and responsive changes, and drives small reversible entrances.
Screenshots stay fully readable at each project position. `src/finishing.css`
defines the dark stage, image framing and hover details. WebGL stops rendering
when the hero is off screen and recovers through the matching poster on context
loss.

Reduced motion removes the sequence and uses the static poster without loading
WebGL. HTML without JavaScript remains complete and readable. Route intent
preloading stays disabled: the published pages are already bundled without
loaders, and preloading previously triggered a scroll reset on hover or focus.
`src/editorial.css` defines the dark chrome opening, warm work introduction and portrait
section. Navigation uses native view transitions after hydration.

`npm run icons` regenerates the flat mark from the actual 3D model's shared
profile, including `public/favicon.svg`, 16/32/48px `favicon.ico`, and the touch
icon. The application mark uses the generated `src/brand/pendant-mark.ts`.
`public/stellar.webp` is a 600px render of the chrome object;
`public/apple-touch-icon.png` is a supersampled 180px version of the same mark.
`scripts/social-assets.py` composes
the Open Graph card using the raster star; it requires Python and Pillow.

## Project visuals and attribution

- **GFOS Code:** four actual 1920×1080 client/backend captures from the merged
  application, commit `3214597a32`: ticket workspace, Stack setup, module build
  preview, and expanded Services. Fictional tickets and isolated sample Git
  repositories use real worktrees and repository threads. The actual provisioner
  inspects fixture modules and creates instances; Maven, WildFly, npm, and JDK
  probes are explicit test stubs. These captures do not prove that a company
  application compiled, deployed, or was approved for colleagues. Frames were
  extracted from native browser recordings to avoid snapshot downsampling.
  The original application checkout and screenshot content were not edited.
  The former invented application demo has
  been replaced by an accessible screenshot walkthrough, with full-size image
  inspection and a CSP that prevents service connections. The case study
  distinguishes my integration work from the upstream T3 Code harness and
  describes the merged version's activity estimates. The repository is private.
- **Blockwright:** `002_stellar_star` is the main preview, connecting the portfolio
  identity to an actual agent-built schematic. Directional studio lighting shows
  its depth without inventing emissive blocks. Fable Universe has a full-width
  gallery image, followed by Solar Containment, Tidal Engine and a full-width
  Universe Under Glass. Orbital Crystal Star was removed at the owner's request.
  Delivered schematics match passing registry/static-lint
  evidence. Fable uses the authored program's cached voxel model: 747,537 blocks
  in a 400 × 250 × 400 volume. Its legacy basalt state receives the exact registry
  default `axis=y` in a local render copy; occupied cells and bounds are unchanged.
  This copy passes registry validation and a schematic export/import round trip.
  The failed, 16-block-deep Black Hole Panorama is excluded. Test Universe is
  genuinely three dimensional but less varied than Fable; the older black hole
  is much smaller. Both were reviewed and left out of the selected gallery.
  None is described as proven working machinery. The copy explains iterative
  reference-based design, the in-game studio, native Codex/Claude threads,
  reference and terrain context, Python authoring, review and schematic delivery.
  Run `scripts/render-blockwright-scenes.py <scene>` with the
  sibling checkout's `.venv/Scripts/python.exe` to prepare the local Three.js
  studio. Capture its 3840 × 2400 canvas using the printed camera, then pass
  `--capture <file>` to install the WebPs. Geometry uses resolved game models,
  including stairs and bars; face colours and glass alpha average the client's
  textures. Water source cells use the native renderer's volume approximation.
  Lighting, shadows and restrained bloom are presentation effects, not game
  screenshots. No structures or blocks are invented for these previews.
  Fable's selected view separates the planets from the core, with soft lighting
  and an optical vignette to soften the square star-field boundary. Solar uses a
  point-light approximation of the authored core's warm spill on nearby rings;
  this is studio illumination, not a claim about Minecraft light propagation.
  Each image has 960px/1920px responsive derivatives and a full-size image viewer.
  For Fable, run `scripts/prepare-universe-previews.py fable_universe`, using the
  existing local voxel cache in `.preview/blockwright`. Capture the printed view,
  then use the same command with `--capture <file>` to install its derivatives
  and record source, geometry and image hashes in the local provenance file.
  The source checkout and Minecraft worlds are untouched; geometry is not shipped.
  The owner confirmed the repository is private; its case study uses the local
  source as evidence and does not offer an inaccessible public source link.
- **POVLINE / NoPixel Viewer:** four 1920×1080 captures from the running
  application using public community feeds: the four-pane viewer, police-crew
  discovery, an incident map, and broadcast-overlap history. Source-provided
  previews are genuine; the selected viewer's players remain paused. Broadcast
  timing is not described as frame-accurate synchronization. Described as an
  independent fan project.

No adoption, time-saving, or business-impact metrics are invented. Public
repository links are provided only where a repository was verified.

## Publication

The owner-approved public operator details are in `src/routes/Legal.tsx`.
`npm run check:release` fails if publication placeholders are reintroduced. The privacy
notice identifies Cloudflare Pages and its published retention criteria and
international-transfer safeguards; it does not invent a fixed log lifetime.
The confirmed final domain is `https://vincentmay.com`; canonical and Open Graph
URLs already use it.
The legal pages are linked from every footer and prerendered without requiring
JavaScript. They use `noindex,follow` and are excluded from the search sitemap.
This discourages search indexing; it does not restrict public access or protect
the details from copying.
Hosting is confirmed as Cloudflare Pages, project `portfolio`, connected to
`vincentmay/Portfolio`. Set the Pages build command to `npm run build` and
output directory to `dist`. The build includes a static `404.html` so Pages returns
its error page for unknown URLs instead of implicitly serving the homepage.
There is no catch-all `_redirects` rewrite to override the prerendered pages.
The client also displays a noindex error page. Verify HTTP status after deploying.
`public/_headers` sends `no-transform` to prevent automatic Cloudflare analytics
injection. The script/connection policy allows only this origin, so a provider
beacon cannot execute even if injected. The application includes no analytics.
Verify these response headers and browser requests after deployment; reassess
the privacy notice if new third-party features are deliberately enabled.
The GFOS walkthrough presents actual screens; it does not connect to an app.
