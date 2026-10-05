import { readFile } from "node:fs/promises";

// Run after `npm run check`. Technical checks must not hide unfinished public copy.
const pages = ["legal-notice", "privacy"];
let unfinished = false;
for (const page of pages) {
  const html = await readFile(`dist/${page}/index.html`, "utf8");
  const markers = html.match(/\[[^\]]+\]/g) ?? [];
  for (const marker of markers) {
    unfinished = true;
    console.error(`BLOCKED /${page}: ${marker}`);
  }
}
if (unfinished) {
  console.error("Complete the marked public address in src/routes/Legal.tsx, then rebuild.");
  process.exitCode = 1;
} else console.log("PASS legal copy contains no publication placeholders. Confirm domain and hosting configuration before deployment.");
