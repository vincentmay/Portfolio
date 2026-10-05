# vincentmay.com

Vincent May's portfolio: React, TypeScript, Vite, and TanStack Router.
Cloudflare Pages publishes `main` from `vincentmay/Portfolio` to
`https://vincentmay.com`. All fonts and images are local; the app has no analytics
or third-party embeds. Wheel easing uses Lenis.

## Development and release

Use the Node version in `.node-version` and the committed npm lockfile.

```sh
npm ci
npm run dev
npm run check           # TypeScript, build, prerendering, assets, geometry, budgets
npm run check:release   # Reject legal publication placeholders
npm run preview         # Inspect the production build
```

Cloudflare's build command is `npm run build`, with output directory `dist`.
GitHub Actions runs both checks on pushes to `main` and pull requests.
The build prerenders seven public pages and a static 404 fallback. Complete
content and legal pages work without JavaScript; the browser hydrates the same
React components. The site is English-only, with home at `/` and `/en`, project
studies at `/en/work/<project>`, and legal pages linked in each footer.

## Maintenance

- Copy and project images: `src/portfolio.ts`.
- Page components: `src/routes/`; shared presentation: `src/components/`.
- Styling: `src/styles.css`. Keep the cascade in one file.
- Operator details and privacy notice: `src/routes/Legal.tsx`.
- Brand geometry: `src/brand/pendant-model.ts`. `npm run icons` regenerates the
  matching mark, favicon, and touch icon; `npm run model:export` exports the GLB.

Public images use WebP with responsive derivatives and reserved proportions.
Homepage previews load eagerly so transformed gallery cards remain reliable
when returning from a study. Larger study galleries load lazily. Skeletons show
only during genuine loading; cached images skip them. Failed images have a
quiet fallback. Image dialogs support Escape, focus return, and native scrolling.

The hero uses a matching poster before loading Three.js. GPU initialization
waits until the star is visible and the browser is idle. Reduced motion and
data-saving mode retain the poster. The renderer draws only for interaction,
resize, or scroll, then stops when damping settles; it pauses offscreen and
recovers after graphics-context loss. Wheel easing also stops its frame loop at
rest; touch and keyboard scrolling remain native. Reduced motion disables both.

The horizontal project exhibition is enabled only on large, tall viewports.
Small screens and reduced-motion mode use the ordinary vertical document.
Case-study returns preserve the selected project. Hashes and section links work
with native navigation; readers can interrupt the short return animation.

Only content-hashed `/assets/` files have immutable year-long browser caching.
HTML and mutable screenshot filenames use Cloudflare Pages' default
revalidation. Font files have a one-day cache. `scripts/performance-check.mjs`
guards compressed client JavaScript, CSS, and the deferred Three.js bundle.
These are build budgets, not claims about real-user Core Web Vitals.

## Screenshot sources

GFOS Code and POVLINE screenshots come from their running applications. GFOS
captures use fictional tickets, sample repositories, and an isolated test
toolchain; captions disclose that context. Blockwright images render actual
delivered schematics in a portfolio studio with presentation lighting. They
are not Minecraft gameplay screenshots. No adoption or impact metrics are
invented; private repositories do not have broken public source links.

The Python tools in `scripts/` prepare Blockwright schematics and responsive
captures using the sibling checkout's environment. Capture intermediates and
provenance stay in ignored `.preview/`; only selected WebPs are published.
Keep font license files with their assets. Recheck the privacy notice before
introducing third-party services or changing the hosting setup.
