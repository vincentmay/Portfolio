# Release review — 5 October 2026

The local production preview is at `http://localhost:5189/en`.
Deployment status is reported by the connected GitHub/Cloudflare checks.

## Completed

## Quiet image loading and entrances — 6 October 2026

- Project previews, case screenshots, and enlarged images now use an actual
  loading state. A soft ice-blue surface fills the reserved frame until the image
  is downloaded and decoded, then fades out as the image rises 8px over 350ms.
  Already complete images skip loading before paint; no minimum wait is added.
  Failed requests show “Image unavailable” rather than an endless skeleton.
  Alt text is retained, loading surfaces are hidden from assistive technology,
  and the container reports its real busy state. Server-rendered images remain
  visible when JavaScript is disabled.
- Hero text and case headings use a 550ms, 8px entrance that starts at 72% opacity.
  Text is readable immediately. The existing measured scroll reveals remain;
  reduced motion disables the new entrances, image movement, and skeleton sheen.
  Sheen stops after three cycles rather than animating indefinitely.
- The shared browser disconnected and the agent-browser Windows executable
  failed to launch. Used the existing local Playwright/Chrome installation for
  11 focused checks with no runtime page errors: gated real downloads, stable
  frame bounds (under 1px difference), all three case returns at 1440×900 and
  390×844, gated full-size modal loading, Escape/focus/scroll cleanup, aborted
  image requests, real reduced-motion emulation, and a JavaScript-disabled page.
  Desktop loading/ready and mobile ready/modal screenshots were visually reviewed.
- `npm run check`, `npm run check:release`, and `git diff --check` pass.

## Preview loading, captions, and whole-page easing — 5 October 2026

- Homepage previews previously remained unloaded outside the transformed
  horizontal gallery after returning from a case. All three small responsive
  previews now load eagerly, request synchronous decoding, and reserve their
  image proportions. Case-study galleries retain lazy loading. All nine public
  homepage image candidates return HTTP 200 with image/webp content; the smoke
  check now verifies every responsive image candidate exists in the release.
- Returns from GFOS Code, Blockwright, and POVLINE at 1440×900 show all three
  previews complete with nonzero natural dimensions. At 390×844 all three 960px
  candidates also complete, with no horizontal overflow. Removed the repeated
  homepage preview and portrait captions and their reserved space. Case-study
  captions retain build names, source context, and sample-data disclosures;
  descriptive alt text remains intact.
- Lenis now eases wheel input throughout the document over 280ms, with native
  touch/keyboard behaviour and no scroll-speed multiplier. Input and navigation
  interrupt wheel inertia. Reduced motion destroys the controller; modal and
  nested scrolling stay native. Effect cleanup removes the controller and all
  listeners on route changes and React StrictMode remounts.
- Instrumented wheel input moves down 180px and back up 180px monotonically
  without overshoot. Keyboard interruption at 82px produces no later scroll
  writes. Because the collaborative preview throttles background animation
  frames, these timing checks used a temporary 16ms timer-driven frame scheduler
  in the test page; the shipped controller uses native requestAnimationFrame.
  Reduced-motion returns create no Lenis controller and do not prevent wheel
  input. Image enlargement lets the dialog scroll natively; Escape restores
  focus and unlocks the page. Native CSS anchor animation is also throttled in
  both the existing public version and the local preview.
- `npm run check`, `npm run check:release`, and `git diff --check` pass.

## Gentle navigation scrolling — 5 October 2026

- Section links and gallery controls retain native smooth scrolling. Returning
  from a case study now adds a bounded 48px, 220ms ease into the matching project,
  after the homepage gallery is measured. Direct project anchors remain instant.
  Wheel/touch scrolling remains native; any wheel, touch, pointer, or keyboard
  input cancels the short return animation, as does leaving the route.
- Desktop Blockwright returns to scrollY 2627, card top 100px and left 56px;
  mobile POVLINE returns to scrollY 2404, card top 99.5px, without overflow.
  Instrumented wheel interruption stops subsequent animation writes. Reopening
  a case during the return leaves the case at scrollY 0. Instrumented reduced
  motion uses instant anchor placement and performs no animation scroll writes.
- The collaborative preview throttles animation frames in background tabs;
  positions were checked again after the frames completed. Clamping both ends
  of animation progress prevents an earlier frame timestamp moving backwards.
  `npm run check`, `npm run check:release`, and `git diff --check` pass.

## Return to the selected project — 5 October 2026

- Reproduced “All projects” returning to the work heading at scrollY 800 and
  showing GFOS Code regardless of the case study. Each case now links to its
  own semantic project anchor. The measured gallery restores the matching card
  instantly; stacked and reduced-motion layouts use ordinary anchor positioning.
  Router top/hash scrolling and the view transition are disabled for this return
  link to avoid competing with the gallery's positioning.
- Actual navigation from all three case studies at 1440×900 returns the expected
  active project and card top at 100px, below the header. At 390×844 each matching
  stacked card lands within 1px of 100px without horizontal overflow. Direct
  loading of the POVLINE anchor, three repeated open/return cycles, and an
  instrumented reduced-motion return pass. No delayed top reset occurred.
- `npm run check`, `npm run check:release`, and `git diff --check` pass.

## POVLINE layout showcase — 5 October 2026

- Captured the real Brick Bois viewer after choosing “One main POV” in the app:
  anthonyz is the main pane, with buddha, omie, and xqc stacked alongside.
  The 1920×1240 capture viewport keeps all supporting Twitch video areas above
  their minimum size. The browser recording exports a 1672×1080 image; its actual
  dimensions and responsive 960px/1440px variants are used in the portfolio.
- The main-perspective view now leads the project. The equal-tile view remains
  as a separate feature explaining the layout controls. Both use real paused
  source previews, with no invented playback or synchronized-event claims.
- Reviewed the new lead image at 1440×900 and 390×844, with no horizontal overflow.
  Keyboard enlargement loads the full-size image, and Escape closes it.
  `npm run check`, `npm run check:release`, and `git diff --check` pass.

## Direct image enlargement — 5 October 2026

- Removed the separate enlargement control and its layout row from project
  images. The image itself is a labelled native button with a zoom cursor and
  an inset keyboard-focus outline; homepage project links remain unchanged.
- Keyboard Enter opens the full-size modal, Escape closes it, scrolling unlocks,
  and focus returns to the image without moving the page. Mobile direct activation
  loads the 1920px asset. All three case studies fit at 390px with no horizontal
  overflow; desktop POVLINE and Blockwright image presentations were reviewed.
- `npm run check`, `npm run check:release`, and `git diff --check` pass.

## POVLINE screenshot refresh — 5 October 2026

- Replaced the viewer and crew-discovery images with genuine 1920×1080 captures
  from the running POVLINE application while four Brick Bois channels were live:
  anthonyz, buddha, omie, and xqc. The roster includes all five directory members
  and accurately shows sayeed as absent from the live feed.
- The workspace retains its actual paused, source-provided previews and controls.
  Captions and alternative text identify the crew and previews. No playback,
  shared event, or synchronization is fabricated. The map/history captures remain.
- Exported 960px and 1440px WebP variants alongside the full-size captures.
  Reviewed both images inside the portfolio at 1440×900 and 390×844, with no
  horizontal overflow; the roster's full-image view loads the 1920×1080 asset
  and closes with Escape. `npm run check` and `npm run check:release` pass.

## Live hosting verification — 5 October 2026

- Commit `c34c3ad` deployed successfully to Cloudflare Pages. The public domain
  serves all seven expected portfolio pages and the walkthrough with HTTP 200;
  an unknown URL returns the prerendered HTTP 404. Twenty distinct directly
  linked image/style/script assets checked on the public site return HTTP 200.
- The live Chromium browser exposed a dashboard-managed Cloudflare Analytics
  beacon, which was absent in the local app and non-browser HTTP response.
  Added Pages response headers: `no-transform` requests unchanged proxy responses;
  script and connection sources are restricted to this origin, preventing
  execution of an injected external beacon. Pages still adds a managed script
  tag at deployment time. After deploy `2482525`, a fresh public browser load
  records the attempted script as blocked (zero transfer/body bytes, status 0)
  and no analytics POST. The star's canvas, loaded images, and hydrated pages work.
  Local fonts, images, dynamic imports, and the WebGL star remain same-origin.
- Both build and release checks pass. Local Cloudflare emulation delivers the
  expected CSP/cache headers; actual navigation to the GFOS Code study,
  1920px image opening, Escape/focus restoration, and return via Work pass with
  the policy active. The public domain delivers the same headers. GitHub's
  additional verification job remains queued; Cloudflare deployment checks succeed.
- Reference: https://developers.cloudflare.com/web-analytics/get-started/
- Reference: https://developers.cloudflare.com/pages/configuration/headers/

## Legal publication details — 5 October 2026

- Researched the current provider-identification guidance from the NRW media
  authority and the LFK guide, together with section 5 DDG. This public job-seeking
  portfolio is treated as requiring operator identification; the exception for
  exclusively personal/family use is not relied on. This is an implementation
  assessment, not a guarantee or a commissioned legal opinion.
- The owner authorized use of the supplied residence address, conditional on
  that being a regular practice. The LFK explicitly identifies residence as the
  regular address for natural persons. The owner was informed that publication
  also includes the public source repository and is not guaranteed risk-free.
- Completed the operator details, made Impressum identifiable in footer links,
  removed unnecessary link-liability and editorial-responsibility boilerplate,
  and added working email/privacy-authority links. Clarified hosting interests
  and the qualified GDPR objection right. Hosting remains Cloudflare Pages.
- Legal pages now have `noindex,follow` in both prerendered and hydrated HTML,
  and stay outside the search sitemap. This is not access control.
- `npm run check` and `npm run check:release` pass with the final public copy.

Sources:
- https://www.medienanstalt-nrw.de/aufsicht/transparenz-im-internet.html
- https://www.lfk.de/service/dokumente-rechtsgrundlagen/leitfaden-zur-impressumspflicht-im-internet
- https://www.gesetze-im-internet.de/ddg/__5.html
- https://www.cloudflare.com/privacypolicy/

## Final release preparation — 5 October 2026

- Added `.node-version` (24.18.0) for reproducible Cloudflare/GitHub builds and
  `.github/workflows/verify.yml` for lockfile installation, production/asset/mesh
  checks, and the legal-copy release check. GitHub Actions is enabled for this
  repository. Updated the README's current screenshot provenance and setup.
- A fresh isolated Linux install from the same lockfile passed TypeScript,
  Vite, prerendering, all route/asset checks, and both pendant mesh checks.
  Linux used Node 24.20.0; the workspace build passes on pinned Node 24.18.0.
  The test distro has no outbound network, so public npm tarballs were fetched
  into a separate Windows cache and transferred for Linux `npm ci --offline`.
  Original project dependencies and sibling repositories were not modified.
- Current production and development dependency audits report zero known
  vulnerabilities. Twelve current WCAG 2 A/AA and 2.1 AA scans across Home,
  the three case studies, Legal notice, and Privacy at 1440px and 390px report
  zero detected violations. Evidence: `.preview/release-a11y.json`.
- Tested the production build through local Cloudflare Pages/Wrangler: all
  seven pages and the screenshot walkthrough return 200; unknown URLs and
  local design experiments return 404 with noindex. All 54 distinct linked
  internal paths/images checked across the seven pages return 200, including
  responsive derivatives. Client hydration uses the correct route and assets.
- Actual project-link navigation, full-resolution image opening (1920px),
  Escape, focus restoration, and document scroll unlock pass in the browser.
  The staged diff has no whitespace errors; local `main` and `origin/main`
  matched before release preparation. Cloudflare's existing successful check
  identifies the `portfolio` Pages project linked to this repository.
- At this earlier checkpoint, publication was still pending: the address was missing, and
  `npm run check:release` fails on the two explicit postal-address placeholders.
  The currently live site's old Impressum also has no usable postal address
  to reuse. No address was inferred, no commit was made, and no push occurred
  at that checkpoint. The subsequent authorization and completion are recorded above.

## Selected Work transition — 5 October 2026

- Fixed a painted overlap, separate from the text-mask issue: the sticky
  project stage's background extended 100px above its box and covered the
  preceding heading. It now extends only 14px to bridge the 86px fixed header
  and the 100px sticky position. Horizontal project scrolling is retained.
- Reviewed the exact reported composition in the production preview, then
  checked 32 entry, pinned, panel, and reverse-scroll positions at 1920×1032,
  1440×900, 1366×768, and 390×844. Desktop heading ink keeps at least 52px
  clearance from the stage background; no horizontal page overflow occurred.
  Evidence: `.preview/work-transition-audit.json`. `npm run check` passes.

## Ice indigo accent — 5 October 2026

- Centralized the accent as `#b9c9ff`, hover `#d4dfff`, and readable ink
  `#485b92`. Applied it to primary buttons, status marks, heading dots,
  decorative orbits, stage outlines, focus rings, selection, and the walkthrough.
  The WebGL star rim reads the CSS accent; regenerated favicons, touch icon,
  and the social card using the updated palette.
- Visually reviewed the production desktop hero, light Contact, and mobile
  hero. Contrast is 11.07:1 for primary-button text, 5.67:1 for accent ink
  on paper, and 11.27:1 for the pastel accent on the dark background.
  `npm run check` passes.

## Text ink clearance — 5 October 2026

- Removed the unnecessary clipping masks from scroll-revealed heading lines.
  The contact heading's `g` is now complete, including during its 18px drift.
- Expanded the hero entrance mask's bottom clearance for the `y` in `May`.
  Compensating margins preserve the original 0.95em baseline spacing.
- Checked the production homepage, all three case studies, legal notice,
  privacy, and 404 page at 1920×1032, 1440×900, 1366×768, 390×844, and
  320×568. A DOM Range/Canvas glyph-ink audit found no text crossing a
  clipping ancestor in these 35 route/viewport combinations. Intentional
  offscreen carousel content, the unfocused skip link, and the hero's masked
  entrance were excluded from settled-state checks. Also checked nine
  forward/reverse scroll positions across Work, About, and Contact.
- Visually reviewed production screenshots of the desktop hero and Contact,
  plus the mobile Contact heading. Build, prerender, smoke, and model checks
  pass. These browser checks cover the installed Chromium preview.

## Product stories and actual application captures — 5 October 2026

- Reviewed the sibling applications, their documentation, implementation, and
  real UI before rewriting the three case studies. The copy now explains the
  product goal, user workflow, personal contribution, and relevant engineering
  decisions. No adoption figures, time savings, or business outcomes were added.
- GFOS Code has four fresh 1920×1080 captures: ticket context with four
  repository threads, Stack setup, module build preview, and expanded Services.
  The current web client was compiled from the actual merged source in a
  separate Linux capture folder using matching dependencies. The original
  repository was not edited. Its license-packaging plugin was omitted only in
  this private capture build; this was not an application release build.
  Captures use fictional tickets, isolated sample Git repositories, and the
  repository's current playground toolchain. The real provisioner created
  worktrees and instances, inspected fixture modules, allocated ports, and
  followed readiness/deployment markers. Maven, WildFly, npm, and JDK probes
  are explicit test stubs. These images do not prove a company application
  compiled, deployed, or was approved for other employees. The screenshot
  walkthrough now has all four views and explains this boundary. GFOS's own
  workflow is attributed separately from T3 Code's upstream harness and clients.
- POVLINE has four fresh 1920×1080 captures from its actual browser UI:
  four-pane crew viewing, police-crew discovery, a selected map incident, and
  a broadcast-overlap comparison. Public feeds and platform-provided stream
  previews are genuine. Players remain paused in the selected viewer capture;
  broadcast start/VOD offsets do not imply frame-accurate synchronization.
  Private notes, credentials, and unrelated personal data were not published.
- Blockwright has fresh actual Minecraft Studio captures for the Tidal Engine
  brief, delivered schematic, and independent review-model picker. The brief
  and review views are integrated alongside the five existing selected 3D
  build renders; the standalone delivery capture is also available. A copied
  client and separate daemon loaded existing authored thread/artifact history;
  the application UI was not redesigned or mocked for these screenshots. A
  capture-only GameTest drove the client screens. No new paid agent inference
  was submitted. The structural record and untested mechanical behaviour remain
  visible as reported by the application. Stellar Star 002 remains primary.
- Native-resolution frames were extracted from app-owned browser recordings or
  Minecraft screenshots, then encoded as high-quality WebP with smaller 960px
  and 1440px variants. No invented panels, screenshot retouching, or upscaling.
  Integrated captures comprise four GFOS, four POVLINE, and two Blockwright UI
  views, plus the existing Blockwright build gallery. Feature sections pair each
  image with a concrete product capability and retain full-image inspection.
- Final native-browser geometry checks covered all 15 case-study figures at
  1440×900, 1366×768, 390×844, and 320×568: 60 passing image presentations,
  including caption and button containment, with no horizontal overflow.
  Desktop feature sections also fit their heading, explanation, image, caption,
  and control in one viewport below the header. Short/mobile layouts keep
  natural scrolling. Evidence: `.preview/product-capture-final-layout.json`.
- Automated WCAG 2 A/AA and 2.1 AA scans of all three updated case studies at
  1440px and 390px detected no violations. Full-image loading at 1920px,
  keyboard Escape, focus restoration, and scroll unlock were checked in the
  native browser. Home project panels retain their native horizontal chapter;
  forward and reverse positions fit and return to the same transforms without
  changing the requested scroll offset. No new animation loop was introduced.
- TypeScript, production build, seven prerendered routes, asset/SEO/404 smoke
  checks, and pendant mesh checks pass. Existing deferred WebGL chunk-size and
  third-party router directive warnings remain visible. No deployment.

## Complete viewport presentations - 5 October 2026

- Case-study figures now share a viewport-height budget below the fixed header.
  The image frame flexes around the actual caption and button heights, including
  wrapped captions. Its declared aspect ratio supplies its natural size; the
  image uses `object-fit: contain` when height is constrained, preserving the
  entire image. Figure entrance translation no longer shifts aligned frames
  behind the header. This applies to all three projects and Blockwright's gallery.
- The short desktop hero reduces type and spacing to keep its copy, star and
  footer in one viewport. Portrait layouts of at least 700px height allocate the
  remaining space to the star; short portraits use more compact typography.
  Smaller portrait windows retain natural document scrolling.
- Native-browser geometry checks covered all three case studies at ten sizes:
  1920x1080, 1440x900, 1366x768, 1280x720, 1280x600, 1024x768,
  768x1000, 390x844, 844x390 and 320x568. All 70 aligned image frames
  clear the header and viewport bottom, contain captions/buttons and show no
  horizontal overflow. Evidence: `.preview/viewport-fit-checks.json`.
- Production-preview hero checks pass at 390x700, 390x844, 768x1000,
  1280x600 and 1280x500; visually confirmed the mobile WebGL star. All three
  horizontal project panels fit at 1366x768, including the navigation.
  The production universe frame at 1440x900 spans y=100.4 to 880.4;
  its caption and button fit inside it. Reviewed its integrated screenshot.
- `npm run check` passes, including TypeScript, production build, prerender,
  route/asset smoke checks and pendant geometry verification. No deployment.

## Lighting and composition refinement - 5 October 2026

This supersedes the camera and illumination choices in the image-selection
review below. Schematic geometry and the portfolio's scroll behavior are unchanged.

- Compared twelve Fable Universe angle/lighting studies. Selected an angle that
  separates the blue-green planet from the bright core and reveals the smaller
  cratered moon and volcanic planet. Soft directional illumination, controlled
  emission and bloom emphasize the core. An optical vignette fades the outer
  star field toward the frame edges, softening its square outline without moving
  or deleting blocks. Rejected hard-shadow variants because the tiny voxel faces
  developed distracting contrast and sampling noise; depth fog trials were also
  rejected. Final camera and light parameters are in the preparation script.
- Compared multiple variants of all four other selected builds. Solar's closer
  view retains more core detail and warms its copper rings with a point-light
  approximation of the existing emissive sphere at source coordinates (0,48,0).
  The point light approximates spill in the studio, not Minecraft light propagation.
  Tidal's slightly lower angle and directional shadows expose its rotor's depth.
  Stellar 002 has cleaner directional illumination without noisy self-shadowing
  and retains zero emission/bloom. Universe Under Glass keeps the clearer original
  angle with adjusted fill and emission, preserving readable cutaway shells.
- Removed Orbital Crystal Star from the gallery, active copy and public assets.
  Both universes now span the full gallery width; Solar and Tidal share the middle
  row, avoiding an empty half-row after the removal. Actual application screenshots
  remain unchanged. These presentation changes introduce no imaginary interfaces,
  structures or light-emitting blocks.
- Captured all five final native-browser canvases at 3840 × 2400. Verified all
  fifteen WebPs have their declared 960px, 1920px or 3840px dimensions. Capture
  installation verifies source evidence and records image hashes, lighting and
  camera parameters. Evidence: `.preview/new-builds/*-refined-*.webp`, final 4K
  captures, `final-assets.json`, and `.preview/blockwright/*-provenance.json`.
- `npm run check` passes. Native production-preview checks at 1440 × 1000,
  768 × 1000 and 390 × 844 show no horizontal overflow and contained image frames.
  All five image viewers load their 3840 × 2400 originals and close cleanly.
  Native Escape closes the universe dialog, restores scrolling and returns focus
  to its opener. Reviewed integrated desktop universe, paired-gallery and mobile
  screenshots; Orbital Crystal Star is absent from the generated page.

## Stellar 002 primary and universe review - 5 October 2026

This supersedes the Radiant Star primary-image selection below. The horizontal
showcase and its motion are unchanged.

- Selected the owner's preferred `002_stellar_star` as the homepage and case
  study primary image. The original schematic contains 43,977 blocks in a
  221 × 221 × 31 volume. Its SHA-256 matches passing registry/static evidence:
  `19421be38f7352e98ce6679d21da2f9ce25d7bb4b06d7bf53c7c1c25bc6a1192`.
  Rendered resolved game elements with a slightly angled camera, directional
  illumination and shadows. Bloom is zero; no light-emitting blocks were added.
- Compared the available universe programs, delivered schematics, native views
  and angled studio renders. Fable Universe and Test Universe occupy genuine
  400 × 250 × 400 volumes, containing 747,537 and 608,969 blocks respectively.
  Selected Fable's more varied planets, spiral galaxy and nebulae for a full-width
  case-study image. Universe Under Glass remains as a distinct transparent,
  spatial example (279 × 264 × 280; 207,014 blocks). The older 69 × 31 × 63 black
  hole was too small for this selection. Excluded Black Hole Panorama: its
  561 × 316 × 16 bounds and side view expose the flat result the owner rejected.
- Fable's source program SHA-256 is
  `3c0bf6188c51d49b193a50a7b34a07733cea1f95ca38389827c0d70efcc2fb96`.
  Its local legacy voxel cache omitted basalt's axis property. The portfolio
  preparation script adds the exact registry default `axis=y` to a render copy,
  without changing any occupied cells or bounds. Registry validation and a local
  schematic export/import round trip pass. Resolved game elements produce
  2,199,576 vertices with no geometry approximations. The sibling source and
  Minecraft worlds were not edited. Source/cache/export/image hashes and the
  exact camera are recorded in `.preview/blockwright/*-provenance.json`.
- Captured both selected views from the native-browser canvas at 3840 × 2400,
  with 960px and 1920px responsive WebPs. Fable retains actual emissive block
  materials with restrained bloom; these remain studio presentations, not
  in-game screenshots or proof of runtime mechanics. Added repeatable capture
  installation to `scripts/prepare-universe-previews.py`.
- `npm run check` passes. Native production-preview inspection at 1440 × 1000,
  390 × 844 and 320 × 844 confirms the selected images load, frames remain inside
  the viewport and the page has no horizontal overflow. Fable's desktop and mobile
  dialogs load the 3840 × 2400 original, lock background scrolling and close
  cleanly; the mobile page retains its scroll position. Reviewed desktop primary,
  desktop universe and mobile gallery screenshots. Evidence includes native
  browser captures and `.preview/new-builds/*-4k.webp`.

## Image-led showcase replaces the travelling line - 5 October 2026

This supersedes the line, cursor and hero docking in both motion reviews below.

- Revisited and recorded the reference's full scene sequence. Removed the
  portfolio's page-wide SVG path, travelling cursor, miniature loops and flat-star
  handoff, including their components and geometry controllers. The actual chrome
  pendant remains three dimensional and turns gently with scroll. Removed the
  hero's extra pinned scroll distance.
- Retained horizontal project scrolling on large screens. Rebuilt the chapter
  as a dark exhibition stage, reclaimed the strip previously reserved for the
  path, enlarged the image frames and reduced the gaps between scenes. Images
  settle from 96% scale to full size; descriptions settle with them. Added simple
  progress indicators to the existing direct project buttons. Captures and render
  provenance remain unchanged; no new interface mockups were introduced.
- Native-browser checks covered 101 positions in each direction at nine viewport
  sizes: 1920x1080, 1440x1000, 1280x800, 1100x760, 1280x720, 1024x900, 768x1000,
  390x844 and 320x844. All 1,818 sampled states passed: matching transforms, focus
  values, header themes and hero scroll poses at matching positions, no horizontal
  overflow, and contained images at all three project positions.
- The shared browser disconnected during final accessibility verification and
  explicitly reported that no automation host was available. Completed the review
  using the permitted headless Chrome fallback with software WebGL. Native Tab and
  Shift+Tab keep the corresponding project visible; direct project buttons work.
  Real wheel events remain monotone in their intended direction. Live resize and
  reduced-motion changes restore the readable vertical gallery; reduced motion
  removes the canvas. No-JavaScript HTML retains all three projects.
- WCAG 2 A/AA and 2.1 AA scans at all three desktop project positions and at the
  mobile layout returned zero violations. Browser behavior checks returned no
  page errors. Reviewed screenshots and full forward/reverse desktop/mobile
  recordings. Evidence: `.preview/showcase-checks.json`, `showcase-project-*.png`,
  `showcase-mobile.png`, `showcase-desktop.mp4` and `showcase-mobile.mp4`.
  These are desktop browser simulations, not physical-device measurements.

## Horizontal chapter restored and revised - 5 October 2026

This supersedes the vertical-gallery decision in the review below. Project assets
and their provenance are unchanged.

- Restored native-scroll-driven horizontal project panels on screens at least
  1100px wide and 760px tall. Small or short screens remain vertical. The hero
  handoff, project chapter and page outro use one shared cursor and one frame
  scheduler. The chapter's entry line moves with the panels, preventing the
  floating line that previously crossed later project descriptions.
- Added one asymmetric orbit between GFOS Code and Blockwright, then a distinct
  rising arc toward POVLINE. Reserved the lower strip and panel gaps for these
  gestures. The star exits beside the portrait and docks in the contact mark.
  Monotone arc-length interpolation is shared by all three phases.
- Native collaborative-browser forward/reverse audit: 121 positions per
  direction across 1920x1080, 1440x1000, 1280x800, 1100x760, 1280x720, 1024x900,
  768x1000, 390x844 and 320x844, totaling 2,178 states. No detected line/content
  crossings, horizontal overflow or different cursor states at matching scroll
  positions. Checks wait for two animation frames, rather than reading stale
  states from a timer while the shared preview is backgrounded.
- Inspected all three project frames and both transition gestures. Images remain
  contained, with captions and descriptions clear of the path. Updated responsive
  image sizing for the horizontal layout. Native Tab/Shift+Tab selects the correct
  panel and keeps focus visible without horizontal container scrolling. Direct
  project selection and live resizing to the mobile layout pass.
- Native WCAG 2 A/AA and 2.1 AA scans at the first and final desktop panels and
  the 390px mobile layout return zero violations. `npm run check` passes, including
  production prerendering, seven routes, screenshot assets and pendant geometry.
  Reduced motion and HTML without JavaScript retain the existing static gallery.
- Recorded and visually reviewed the complete forward/reverse sequence. Current
  local evidence: `.preview/motion-horizontal-refined.mp4` and
  `.preview/horizontal-review.png`. This is resized desktop Chrome, not a
  physical-device or field-performance measurement.

## Motion deep dive and replacement ? 5 October 2026

This replaces the pinned horizontal gallery and separate cursors described in the
older motion review below. The project assets and their provenance are unchanged.

- Audited the actual native-browser sequence forward and backward, recorded it,
  and reviewed the original reference plus primary SVG/scroll-scrubbing examples.
  Found two disconnected paths, plateau-based progress jumps, delayed CSS image
  transforms, repeated loops and an abrupt switch between independent cursors.
- Replaced those systems with one measured scroll score: the actual chrome hero
  pendant shrinks, turns toward its flat shared profile, then joins the line. The
  line passes through gutters and one reserved inter-project gap. It settles into
  the contact mark on desktop; narrow screens keep the small star in the gutter.
  Removed horizontal pinning, duplicate cursor geometry and keyboard scroll logic.
- Each broad curve receives a defined scroll interval. Monotone cubic arc-length
  interpolation gives continuous speed at joins and no direction-change lag.
  Fixed the page-bottom bug where independent clamping collapsed two endpoints
  onto the same scroll position. The line now finishes before the footer.
- Native recordings succeeded; snapshots failed, then the shared browser explicitly
  reported its host unavailable during mobile testing. Continued with the permitted
  headless Chrome fallback against the production preview, using software WebGL.
- Complete forward and reverse passes at 1920?1080, 1440?1000, 1280?720,
  1100?760, 1024?900, 801?900, 768?1000, 390?844 and 320?844: 2,924 sampled
  states in 32px increments. Identical cursor, line and hero states at the same
  scroll position; no detected cursor/content overlaps, path/content crossings,
  abrupt jumps or horizontal overflow. The line completes at all nine sizes.
  The mobile pass found and corrected a two-pixel cursor intrusion into content.
- Handoff checked at single-pixel increments around its boundary: the hero's flat
  profile and line cursor centres match within 0.1 CSS pixel. Alternating real
  wheel events at several speeds preserve scroll direction. Hover/focus do not
  reset scroll; normal Tab order, case navigation/return and header anchors pass.
  Smooth anchors require time to settle; the earlier 900ms test was too short.
- Live resizing across breakpoints preserves scroll and restores the same geometry
  when returning to the original size. Live reduced-motion switching removes the
  canvas and restores readable static content. No-JavaScript HTML is readable.
  WebGL context loss shows the poster and restoration recovers reflections.
- Automated WCAG 2 A/AA and 2.1 AA scans at the handoff, gallery curve and contact
  docking states report zero violations. Browser behavior checks report no page
  errors. `npm run check` passes, including seven routes and pendant geometry.
- Visual review includes slow full-page forward/reverse desktop and mobile videos.
  Local evidence: `.preview/motion-audit.json`, `motion-behavior.json`, screenshots,
  and `motion-reworked-desktop.mp4` / `motion-reworked-mobile.mp4`. These checks use
  resized desktop Chrome, not physical-device or field performance measurements.

## Finished lighting studies and Stellar variants — 5 October 2026

This selection supersedes the Tidal Engine main preview recorded below.

- Inspected all four newly delivered studies: Orbital Crystal Star, Solar
  Containment, Fractured Astral Orrery and Twilight Seed v2. Compared the earlier
  `002_stellar_star` with the newest Radiant Star, including original front/side
  renders and new angled studio views. Selected Radiant Star as the main preview.
  Solar and the crystal star join Tidal Engine and Universe Under Glass in a
  balanced four-image gallery; Dragon Colossus is no longer featured.
- The fresh selected artifact hashes are Radiant Star
  `c2a51980a56b5861f436f94fd954a5916908f6cd1f47b1572a694746d139b0ab`,
  Solar Containment
  `397fa23f8f2a90967b572cf347d294d6a8bc8f3a39d15870a9e82f3dd9ab9daf`,
  and Orbital Crystal Star
  `6a5eb48c4eb779e06428c104f0f4d5d7bfb47455ec99c1bf3afc0291852541c8`.
  They contain 43,977, 21,739 and 5,779 non-air blocks, with occupied sizes
  221 × 221 × 31, 70 × 69 × 55 and 71 × 97 × 63 respectively.
  Each hash matches passing static evidence; no runtime lighting claim is made.
- Prepared game-resolved meshes in Portfolio's ignored preview directory, with
  actual glass alpha and block emission. Captured each native shared-browser
  canvas at 3840 × 2400, transferring its WebP directly to a temporary local
  capture receiver. No screenshot enlargement or synthesized geometry. The
  receiver was stopped afterward; sibling source, artifacts and worlds are
  unchanged. Final cameras and hashes are recorded in per-scene provenance JSON.
- Chose front-facing camera angles so the logo's orbital diagonal agrees with
  the identity. Reduced bloom to preserve edges and the violet glass; matched
  the studio background to the existing dark presentation frame. Fresh originals
  are 136–157 KB, desktop derivatives 39–47 KB, and mobile derivatives 16–20 KB.
  Removed the second hover-glow layer from Blockwright frames so the image's
  own bloom meets a flat surround without an extra rectangular lighting edge.
- Added an evidence-based reference/revision paragraph: Stellar v2 and Radiant
  v3 are committed versions in the same thread. Radiant retains the occupied
  geometry and changes the material palette; the crystal study has real depth.
  Captions and copy identify schematic presentation renders, not game captures.
- `npm run check` passes. Homepage and case checks at 1440, 390 and 320px show
  no horizontal overflow or page errors. The pinned desktop scene was reviewed
  at its actual Blockwright position. All five case images open their 3840 × 2400
  originals with Enter, close with Escape and restore focus. Gallery columns
  stack on mobile. Automated WCAG scans report no violations at 1440 and 390px.
  Native capture completed before the desktop host disconnected on viewport
  resize; responsive/dialog checks then used the explicitly permitted headless
  fallback. Local review images and results are in `.preview/new-builds/`.

## Scroll story and image finishing — 5 October 2026

- Studied the actual pinned horizontal scroll sequence at
  `https://www.somehowliving.tech/`, including the moving world, progressively
  drawn curve and traveling point. Implemented an original orbital curve in a
  shorter three-project sequence. Native vertical scroll moves the project track;
  no wheel interception, scroll snapping or artificial scrolling engine is used.
- Roomy screens (at least 1100 × 760) pin the project viewport below the header.
  Actual images, complete descriptions and case links move together. Project
  selectors allow direct navigation; forward/backward Tab brings the focused
  project into view and can leave the showcase normally. Mobile, short windows,
  reduced motion and HTML without JavaScript retain a complete vertical layout.
- Added a drawn margin thread, staged image corners, restrained image movement,
  hover lighting, chapter navigation indicators and staggered text entrances.
  Replaced the portrait's square background with transparent orbital framing and
  a soft lower fade. Mobile thread geometry returns to the gutter before the text.
  Existing screenshots and schematic assets were not modified or replaced.
- Reproduced the previously reported jump: intent preloading a project link
  emitted a router render event followed by `scrollTo({top: 0, left: 0})` without
  navigating. Disabled redundant preloading; published pages have no loaders and
  are already bundled. Instrumented hover/focus checks now show no reset. A native
  wheel sequence with the pointer over the images stays monotonic across the hero,
  projects and About section. Removed the accidental `locale` DOM attribute.
- `npm run check` passes. Production browser checks at 1920 × 1080, 1440 × 1000,
  1280 × 800, 1100 × 760, 1280 × 720, 1024 × 900, 768 × 1000, 390 × 844 and
  320 × 844 show complete image framing and no horizontal overflow or page errors.
  Checked direct scene selection, keyboard traversal, live viewport changes, live
  motion-preference changes, no-JavaScript visibility, case navigation, return to
  Work and all header anchors. Reduced motion has no star canvas.
- Automated WCAG 2 A/AA and 2.1 AA scans report zero violations on the homepage
  and all three case studies at 1440px and 390px, plus the pinned desktop view.
  All three Blockwright image dialogs retain their 3840 × 2400 originals, Enter,
  Escape and restored focus at 1440px, 390px and 320px.
- The shared browser host explicitly reported unavailable during this pass;
  verification used isolated headless Chrome. Local evidence is in `.preview/`:
  `finishing-checks.json`, `finishing-a11y.json`, `finishing-navigation.json`,
  viewport screenshots and `portfolio-motion.mp4`. These are local checks, not
  physical-device testing or a complete accessibility audit. No deployment made.

## Dimensional Blockwright previews and agent workflow - 4 October 2026

This pass supersedes the Observatory selection below. The owner rejected that
preview and the flat black-hole relief; neither is featured on the site.

- Compared Universe Under Glass, Dragon Colossus and Tidal Engine in an isolated
  Three.js presentation studio, using the exact delivered agent schematics.
  Selected the angled Tidal Engine as the main preview and added the universe
  sculpture and dragon to the case-study gallery to show different kinds of output.
- Artifact SHA-256 values: Tidal Engine
  `a495c2e1075e1e7363b5d6f24d6896e68314516e71363d04587ad386ee6a1612`,
  Universe Under Glass
  `e81dfa07481da038ce1b60bf2b556879e7d3a29603b198ad3530ffbd825ce0ff`,
  Dragon Colossus
  `092f385ff789dcadfe6fbc11253e1dca72478822f301f087259fd6124a75eb1c`.
  Each matches passing static evidence; no Minecraft runtime claim is made.
- Rendered game-resolved block elements, including partial stairs and iron bars.
  Texture-averaged face colours, measured glass alpha, actual block emission,
  directional studio lighting, 4096px shadow maps and restrained bloom are used.
  Ordinary cube texture variants select one legal variant rather than duplicating
  overlapping geometry. Source-water cells use the native renderer's volume
  approximation; these are presentation renders, not Minecraft screenshots.
- Captured all three canvases at 3840 x 2400 through the native shared browser;
  no snapshot enlargement. Responsive 960px/1920px WebPs serve smaller layouts.
  The local reproducible pipeline is `scripts/render-blockwright-scenes.py`.
  Source repositories, delivered schematics and live worlds remain untouched.
- Rewrote the summary, contribution, introduction and workflow around the product:
  in-game conversations with native Codex/Claude runtimes, reference and selected
  terrain context, independent thread workspaces, Python design, review and
  Litematica delivery. Verified this against the current README, architecture and
  daemon/client implementation, preserving the distinction between appearance,
  static legality and verified behavior.
- TypeScript, the production build, seven prerendered routes, asset smoke checks
  and pendant geometry pass via `npm run check`. Homepage and case-study checks
  at 320, 390 and 1440px show no horizontal overflow or page exceptions. The
  main preview loads a 1920px derivative on desktop and 960px on mobile. All
  three full-image viewers load the 3840 x 2400 originals; Enter opens them,
  Escape closes them and focus returns to the opening button. Desktop gallery
  columns stack on mobile. Reviewed the final screenshots for complete framing.
  The native browser captured the actual 4K canvases; its desktop host then
  disconnected during viewport resizing, so layout/keyboard checks used isolated
  headless Chrome. React review found no new effect, listener, or expensive
  render loop; image dimensions and lazy loading keep the gallery stable.
- Automated WCAG 2 A/AA and 2.1 AA scans of the final Blockwright case study
  report no violations at 1440px and 390px, with reduced motion enabled so
  content is fully visible. This is an automated check, not a complete audit.

## New Blockwright schematic review - 4 October 2026

- Reviewed all twelve newly delivered gpt-6.1-sol threads in the sibling
  Blockwright checkout. Every schematic matches its static-evidence hash and
  has passing registry/static lint, with warnings on some decorative builds.
- Selected The Last Observatory for the portfolio: a coherent telescope,
  annular habitation structure and layered mineral crater. Tidal Engine and
  Sunken Archive are the strongest alternatives. This is a visual judgement.
- Rendered the exact Observatory artifact (SHA-256
  6d17a59e6d484f13a4a63306bda1d24211690a4394a20b2a9edfa7d5b039a3a4)
  with Blockwright's native block shapes and colours. Its 1,532,392 occupied
  blocks and 317 x 235 x 315 bounds were read from the delivered schematic.
  The native 3644 x 2599 render is centred on a 3840 x 2880 canvas; no upscaling.
  Published 960px/1920px derivatives and responsive sources for normal viewing.
  The original stays available in the full-image viewer. No source/world edits.
- Updated the image, alt text, caption and case-study description together.
  The previous universe-specific bounds no longer describe the new preview.
- Production checks at 320, 390 and 1440px pass on the homepage and case study:
  responsive images load, no horizontal overflow, and no page exceptions.
  The image viewer loads the 3840 x 2880 original, closes with Escape and
  restores focus. Changed the homepage image to contain the whole artifact.
  Native shared-browser checks were interrupted by an unavailable desktop
  automation host; final checks used isolated headless Chrome. Build, seven
  prerendered routes, smoke checks and pendant geometry pass via npm run check.
- Automated Logistics runtime evidence reports a failed check because its
  160 x 100 x 180 bounds exceed the 96-block generated test world. There are
  no observations establishing whether its routing logic works. Other new
  builds have no passing Minecraft runtime evidence either; none are described
  as proven working machines here.

## Heading and scrolling pass - 4 October 2026

- The hero name now uses Manrope's native letter spacing throughout. Removed
  negative tracking and the special V margin, restoring a single text run.
  Checked glyph separation and text bounds at 320, 361, 390, 801, 860, 1024
  and 1920px: the V and i are clear, and the word fits without clipping.
  Narrow-layout font sizes scale down slightly to accommodate normal spacing.
- Removed the root's fixed minimum width, which caused horizontal overflow
  at 320px with a classic browser scrollbar; the smallest title scales with
  the viewport instead.
- Disabled browser scroll anchoring on the homepage so its sticky and animated
  sections cannot be selected as anchors. Native scrolling and effects remain.
  This is a safeguard: the reported spontaneous return to the top has not been
  reliably reproduced. Delayed initial hydration preserved an early scroll;
  route preloading did not change its position either.
- Production preview scroll checks crossed the hero/work boundary at 320px
  and 1440px without backwards movement; continued scrolling at 390px also
  stayed stable. TypeScript, the seven-route build and smoke checks pass.

## Latest project capture pass - 4 October 2026

This pass supersedes the older four-project and image-resolution entries below.

- Removed GFOS Build from both project data sources, the visual component, CSS,
  homepage copy, social card, metadata and generated routes. Smoke checks confirm
  it is absent from all seven pages, the sitemap and production output.
- Recaptured GFOS Code's actual ticket workspace at 1920 x 1080: selected
  requirements, four real sample repository threads, and a simulated running
  Stack. Recaptured its Services view with complete ports, backend choices and
  lifecycle controls visible. All steps is collapsed to avoid clipped controls.
  These are native browser recording frames, not enlarged 1280px snapshots.
  Sample data and simulation remain disclosed. No GFOS source edits were made.
- POVLINE (formerly labelled City Signal) is captured at 1920 x 1080 from the
  running NoPixel viewer. Selected the Clowncil discovery filter, waited for
  real thumbnails and avatars, closed the menu, and framed four full cards.
  Removed the invented browser chrome. Existing city-signal URLs are retained.
- Blockwright's actual Fable Universe is freshly rendered at 3840 x 2400 with
  closer framing and lower bloom. The exported image is 738,908 bytes. This is
  generated Minecraft block geometry, not an in-game screenshot or AI image.
- TypeScript, production build, seven prerendered routes, image assets, retired
  route checks, sitemap and closed pendant geometry pass via npm run check.
- All three project previews load at their expected natural dimensions, with
  no horizontal overflow at 390px and 1440px. Full-image dialog opening and
  Escape closing work. WCAG 2 A/AA and 2.1 AA scans pass on all three desktop
  project pages after scrolling through and settling their reveal animations;
  the POVLINE mobile page also passes. This is automated verification only.


- GFOS Code's invented screenshot and simulated application demo have been
  replaced with captures from the merged app (`3214597a3206`) and a screenshot
  walkthrough. Fictional ticket fixtures run in an isolated T3 home. The actual
  backend creates repository worktrees and threads; the application's simulated
  provisioner supplies service states without Maven, WildFly, or AI execution.
  No GFOS source files were changed. The ticket capture disables backdrop filters
  locally to avoid full-screen compositor blur; the Services capture retains
  original styling. Images are direct WebP encodings of browser screenshots.
  Old manual-booking copy now describes the merged app's agent-activity estimates.
  The older five-step demo checks below are superseded by this walkthrough.
- Production GFOS gallery and study checked at 320/390px and 1440px; both show
  the complete image without page overflow. The case image viewer opens via
  Enter, closes via Escape, and returns focus. The walkthrough supports section
  anchors and full-size screenshot inspection with an independently scrollable
  image region. It replaces roughly 529 KB of invented app assets with 12 KB of
  HTML/CSS/JS, using shared fonts and actual screenshots.
- Final walkthrough WCAG 2 A/AA and 2.1 AA scans at 320px and 1280px, including
  the open image dialog, report zero detected violations. Keyboard image opening,
  focus containment, horizontal image scrolling, Escape, and focus restoration
  pass. The GFOS study also passes its automated scan. The final `npm run check`
  passes all eight route checks and pendant geometry checks. `check:release`
  still fails only on the two missing public address fields listed below.
- Blockwright preview replaced with the actual Fable Universe build after
  comparing two universe scenes, the black hole, and multiple camera angles.
  Regenerated 747,537 blocks; authored material checks and palette-proxy lint
  pass with an explicit default axis for the old log palette entry. The final
  1920 × 1200 WebP is 295,100 bytes. It uses actual exposed block faces,
  texture-derived colours, and game emission values with presentation lighting.
  It is labelled as a render, and the private source checkout is unchanged.
  Gallery layouts pass at 320, 390, and 1280px; the case-study image passes at
  390 and 1280px with no horizontal overflow. Full-image opening, Escape, and
  focus restoration pass. The case study has zero detected WCAG A/AA violations
  and no page errors. Final checks used local headless Chrome after the shared
  preview host disconnected.
- 4 October English-only update: removed German translations, routes, legal
  pages, language switches, and alternate-language metadata. The production
  build and smoke checks pass for all eight English routes; the sitemap and
  generated output contain no German pages. Earlier locale checks below refer
  to the previous bilingual version.
- Star halo seam fixed: replaced the overlapping hero gradient with a single
  closest-side gradient that reaches zero alpha at its boundary. Reviewed at
  1904px and 390px; 320px and 1280px layout checks show no horizontal overflow.
  Production build passes after the CSS change.
- 4 October update: flat SVG favicon, multi-size ICO, and touch icon generated
  from the 3D pendant's actual outline, with optical weight adjustments. Reviewed
  at 16, 24, 32, 48, 100, and 180 pixels; the site mark uses the same outline.
- Portrait treatment replaced with a smaller natural-colour image and simplified
  layout; removed the marquee and photo stamp. Checked at 320, 390, and 1280px
  without horizontal overflow. The settled about view passes the WCAG scan.
- Final Cloudflare runtime check (Wrangler 4.147.0): both locales, all four
  English project URLs, privacy, favicons, and demo return HTTP 200 with the
  expected content. An unknown URL returns HTTP 404 and the noindex error page.
  Referenced scripts, styles, and fonts return assets rather than HTML rewrites.
- Privacy pages now use Cloudflare's documented retention criteria and transfer
  safeguards. Removed the unsupported claim that email data is never passed on.
  The English privacy page has no placeholders and passes the automated WCAG scan.

- TypeScript, production build, and smoke checks for all eight prerendered routes,
  clean-URL copies, self-hosted images, sharing assets, sitemap, and bundled demo.
- Pendant geometry checks: finite vertices, nondegenerate triangles, closed
  meshes, outward faces, open centre, and solid main tips. Reusable GLB exported.
- Browser layout checks at 320, 390, 768, 1024, 1280, and 1920 pixels. No horizontal
  overflow. Short laptop hero spacing and mobile image-caption overlap fixed.
- Automated WCAG 2 A/AA and 2.1 AA scans of the German homepage, all four project
  studies, and image dialog: zero detected violations. This is an automated
  scan, not a complete accessibility certification.
- Keyboard dialog opening, Escape, focus restoration, scroll unlock, and
  language switching. Anchor, project, locale, missing-page and metadata checks.
- WebGL context loss shows the poster; restoration rebuilds the reflections
  without WebGL warnings. Offscreen star rendering pauses (zero idle RAFs).
- Instrumented reduced-motion check: no canvas, no Three.js request, no idle
  animation frames, matching poster, preserved prerendered DOM, no hydration
  errors. Rapid preference changes still produce exactly one canvas.
- Prerendered content remains readable without the application JavaScript.
  Failed WebGL initialization also keeps the poster and complete page visible.
- Mobile GFOS Code showcase tour: all five steps work without horizontal
  overflow. It uses fictional data and simulated integrations.
- Repeated anchor, project and locale navigation has no uncaught rejections.
  Native animation skips are handled locally; reduced motion skips transitions.

## Still required before publication

The public address in `src/routes/Legal.tsx` remains unprovided. Cloudflare's
published retention criteria and international-transfer safeguards now replace
the hosting placeholder. No fixed retention period is assumed. The owner confirmed
`vincentmay.com` as the final domain on 4 October 2026. Their Cloudflare dashboard
shows the `portfolio` Pages project connected to `vincentmay/Portfolio`, with
`vincentmay.com`, `www.vincentmay.com`, and `portfolio-hf9.pages.dev` as domains.
Cloudflare Pages is now named in the privacy notice, with its official policy.
`npm run check:release` intentionally fails on the missing legal copy.
The build includes `404.html` so Cloudflare Pages uses its static error handling.
Removed the legacy catch-all `_redirects` rule, which would otherwise override
prerendered routes and error handling. Verify response status after deployment.
Dashboard-injected analytics or optional security features have not been
audited; the application itself includes no analytics.

The owner confirmed that `vincentmay/Blockwright` is private on 4 October 2026.
Its case study identifies the private repository and has no inaccessible public
source link. Project claims were checked against the local sibling checkout.
GitHub CLI is installed at `C:/Program Files/GitHub CLI/gh.exe`, outside PATH,
and is authenticated as `vincentmay`. Private access was verified using it;
the default-branch commit matches the local checkout. The `vimfinity` account
also has working private access to `vimfinity/GFOS-Code`. The earlier remote
access conclusion was based on PATH and connector checks and is superseded.
GFOS Build has been removed, including its invented visual.

The large Three.js chunk is deferred until after paint and never requested in
reduced-motion mode. Vite reports its size warning; no warning threshold was
raised to hide it. Browser checks used a desktop browser with resized viewports
and instrumented preferences, not physical mobile devices or field performance
measurements.
