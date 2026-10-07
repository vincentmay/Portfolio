import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";

// Search engines and visitors without JavaScript receive the complete portfolio.
// The same React routes are hydrated by the client, with no separate content model.
const vite = await createServer({
  server: { middlewareMode: true, watch: null },
  appType: "custom",
  logLevel: "error",
});
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
try {
  const { router } = await vite.ssrLoadModule("/src/app/router.tsx");
  const { work, words } = await vite.ssrLoadModule("/src/portfolio.ts");
  const { legalDescription } = await vite.ssrLoadModule("/src/routes/Legal.tsx");
  const template = (await readFile("dist/index.html", "utf8"))
    .replace(
      /<div id="root"[^>]*>[\s\S]*?<\/div>(?=\s*<\/body>)/,
      '<div id="root"></div>',
    );
  const assets = await readdir("dist/assets");
  const portrait = assets.find((name) =>
    name.startsWith("vincent-may-about-cutout-v3-"),
  );
  const paths = [
    "/",
    "/en",
    "/legal-notice",
    "/privacy",
    ...work.map((p) => `/en/work/${p.id}`),
  ];
  for (const path of [...paths, "/404"]) {
    const notFound = path === "/404";
    const locale = "en";
    const project = work.find((p) => path.endsWith(`/work/${p.id}`));
    const legalName = {
      "/legal-notice": "Legal notice / Impressum",
      "/privacy": "Privacy",
    }[path];
    const title = notFound ? "Page not found — Vincent May" : project
      ? project.seo.title[locale]
      : legalName
        ? `${legalName} — Vincent May`
        : words[locale].metaTitle;
    const legalPage = path === "/privacy" ? "privacy" : "imprint";
    const description = notFound ? "This page could not be found. Explore Vincent May’s selected projects." : project?.seo.description[locale] ?? (legalName ? legalDescription[locale][legalPage] : words[locale].metaDescription);
    const canonical = `https://vincentmay.com${path === "/en" ? "/" : path}`;
    router.update({ history: createMemoryHistory({ initialEntries: [path] }) });
    await router.load();
    let markup = renderToString(createElement(RouterProvider, { router }));
    if (portrait)
      markup = markup.replaceAll(
        "/src/assets/vincent-may-about-cutout-v3.webp",
        `/assets/${portrait}`,
      );
    if (!markup.includes("<h1")) throw new Error(`Missing content at ${path}`);
    let html = template
      .replace(
        '<div id="root"></div>',
        `<div id="root" data-route="${path}">${markup}</div>`,
      )
      .replace(/<html lang="[^"]+">/, `<html lang="${locale}">`)
      .replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*/,
        `$1${escape(description)}`,
      )
      .replace(
        /(<meta property="og:title" content=")[^"]*/,
        `$1${escape(title)}`,
      )
      .replace(
        /(<meta\s+property="og:description"\s+content=")[^"]*/,
        `$1${escape(description)}`,
      )
      .replace(
        /(<meta property="og:url" content=")[^"]*/,
        `$1${canonical}`,
      )
      .replace(
        /(<link rel="canonical" href=")[^"]*/,
        `$1${canonical}`,
      )
      .replace(
        /(<meta property="og:locale" content=")[^"]*/,
        "$1en_GB",
      );
    if (notFound || legalName) html = html.replace("</head>", '<meta name="robots" content="noindex,follow" /></head>');
    const directory = path === "/" ? "dist" : join("dist", path.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, "index.html"), html);
    // Serve clean URLs in file-based hosts and Vite preview as well as hosts
    // that resolve directory indexes. Both files have the same canonical URL.
    if (path !== "/") await writeFile(`${directory}.html`, html);
  }
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.filter((path) => path !== "/en" && path !== "/legal-notice" && path !== "/privacy").map((path) => `<url><loc>https://vincentmay.com${path}</loc></url>`).join("")}</urlset>\n`,
  );
  console.log(`Prerendered ${paths.length} pages, Cloudflare 404 fallback, and sitemap.`);
} finally {
  await vite.close();
}
