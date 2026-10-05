import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
const ids = ["gfos-code", "blockwright", "city-signal"];
const paths = [
  "/",
  "/en",
  "/legal-notice",
  "/privacy",
  ...ids.map((id) => `/en/work/${id}`),
];
for (const path of paths) {
  const filename = path === "/" ? "dist/index.html" : `dist${path}/index.html`;
  const html = await readFile(filename, "utf8");
  assert.doesNotMatch(html, /GFOS Build|gfos-build|build-study/, `${path}: no retired project or invented interface`);
  assert.match(html, /<h1[^>]*>/, `${path}: prerendered heading`);
  assert.match(html, /<main[^>]*>/, `${path}: main landmark`);
  assert.equal([...html.matchAll(/<main\b/g)].length, 1, `${path}: one page body`);
  const projectNames = {
    "gfos-code": "GFOS Code",
    blockwright: "Blockwright",
    "city-signal": "POVLINE",
  };
  const id = ids.find((id) => path.endsWith(`/work/${id}`));
  if (id)
    assert.ok(
      html.includes(`<h1>${projectNames[id]}`),
      `${path}: correct project heading`,
    );
  assert.ok(html.includes('<html lang="en">'), `${path}: English document language`);
  if (path === "/legal-notice" || path === "/privacy") {
    assert.match(html, /noindex,follow/, `${path}: keep operator details out of search results`);
    assert.match(html, /href="mailto:contact@vincentmay.com"/, `${path}: working contact link`);
  }
  assert.ok(!html.includes('hreflang='), `${path}: no language alternates`);
  assert.ok(!html.includes('language-link'), `${path}: no language switcher`);
  assert.doesNotMatch(html, /href="\/(?:de(?:\/|"|#)|impressum|datenschutz)/, `${path}: no German links`);
  if (path !== "/")
    assert.equal(
      await readFile(`dist${path}.html`, "utf8"),
      html,
      `${path}: clean URL content`,
    );
  assert.ok(
    html.includes(`https://vincentmay.com${path}`),
    `${path}: canonical URL`,
  );
  assert.ok(
    !html.includes("/src/assets/"),
    `${path}: no development asset paths`,
  );
  for (const match of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    assert.ok(match[1].startsWith("/"), "Images should be self-hosted");
    assert.ok(
      (await stat(`dist${match[1]}`)).isFile(),
      `${path}: image ${match[1]}`,
    );
  }
  console.log(`PASS ${path}`);
}
const demo = await readFile("dist/demos/gfos-code/index.html", "utf8");
assert.match(demo, /noindex,nofollow/);
assert.match(demo, /connect-src 'none'/);
for (const m of demo.matchAll(/(?:src|href)="\.\/([^"]+)"/g))
  assert.ok((await stat(`dist/demos/gfos-code/${m[1]}`)).isFile());
for (const m of demo.matchAll(/<img[^>]+src="([^"]+)"/g))
  assert.ok((await stat(`dist${m[1]}`)).isFile(), `Walkthrough image ${m[1]}`);
for (const asset of [
  "og.png",
  "favicon.svg",
  "favicon.ico",
  "apple-touch-icon.png",
  "robots.txt",
  "sitemap.xml",
])
  assert.ok((await stat(`dist/${asset}`)).isFile());
console.log("PASS screenshot walkthrough, social assets, and search metadata");
const missing = await readFile("dist/404.html", "utf8");
assert.equal(await stat("dist/_redirects").then(() => true, e => { if (e.code === "ENOENT") return false; throw e; }), false, "No catch-all rewrite overriding prerendered routes or 404");
assert.match(missing, /This one went missing/);
assert.match(missing, /noindex,follow/);
assert.ok(!(await readFile("dist/sitemap.xml", "utf8")).includes("/404"));
assert.doesNotMatch(await readFile("dist/sitemap.xml", "utf8"), /\/(?:legal-notice|privacy)</, "Legal pages stay accessible through footer links, outside the search sitemap");
assert.doesNotMatch(await readFile("dist/sitemap.xml", "utf8"), /\/(?:de(?:\/|<)|impressum|datenschutz)/, "Sitemap contains no German routes");
for (const path of ["de", "impressum", "datenschutz"]) {
  for (const filename of [`dist/${path}`, `dist/${path}.html`]) {
    assert.equal(await stat(filename).then(() => true, e => { if (e.code === "ENOENT") return false; throw e; }), false, `${filename}: removed German output`);
  }
}
console.log("PASS prerendered Cloudflare 404 fallback");

assert.doesNotMatch(await readFile("dist/sitemap.xml", "utf8"), /gfos-build/);
for (const filename of ["dist/en/work/gfos-build", "dist/en/work/gfos-build.html"]) {
  assert.equal(await stat(filename).then(() => true, e => { if (e.code === "ENOENT") return false; throw e; }), false, `${filename}: no retired project output`);
}
console.log("PASS GFOS Build removed from pages, sitemap, and output");
