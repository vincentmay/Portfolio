/**
 * Renders the field states to PNG contact sheets so the shapes can be judged by
 * eye without a browser. Development aid only — nothing here ships.
 *
 *   node scripts/preview.mjs            all states, plus the morph strips
 *   node scripts/preview.mjs mark disc  just those
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { SHAPE_NAMES, buildField } from "../src/field/shapes.ts";
import { png, render, sheet } from "./lib/raster.mjs";

const OUT = new URL("../.preview/", import.meta.url);
const SIZE = 520;
const COUNT = 90_000;
const YAW = 0.35;

mkdirSync(OUT, { recursive: true });

const wanted = process.argv.slice(2).filter((a) => SHAPE_NAMES.includes(a));
const names = wanted.length ? wanted : SHAPE_NAMES;

const field = buildField(COUNT);
console.log(`field: ${COUNT} particles`);

const stills = names.map((name) => {
  const pixels = render(field.positions[SHAPE_NAMES.indexOf(name)], COUNT, { yaw: YAW, width: SIZE });
  writeFileSync(new URL(`state-${name}.png`, OUT), png(SIZE, SIZE, pixels));
  console.log(`  state-${name}.png`);
  return pixels;
});

const row = sheet(stills, SIZE);
writeFileSync(new URL("states.png", OUT), png(row.width, row.height, row.pixels));
console.log(`  states.png (${names.join(" → ")})`);

if (!wanted.length) {
  // The same blend the vertex shader does, including the outward throw that
  // peaks in the middle of a transition.
  for (let i = 0; i < SHAPE_NAMES.length - 1; i++) {
    const a = field.positions[i];
    const b = field.positions[i + 1];
    const frames = [0.25, 0.5, 0.75].map((t) => {
      const mixed = new Float32Array(a.length);
      const push = 4 * t * (1 - t);
      for (let p = 0; p < COUNT; p++) {
        const o = p * 3;
        const spread = 1 + push * 0.09;
        const throwOut = push * (0.09 + 0.4 * field.seeds[p * 8 + 6]);
        for (let k = 0; k < 3; k++) {
          const dir = field.seeds[p * 8 + 1 + k] * 2 - 1;
          mixed[o + k] = (a[o + k] * (1 - t) + b[o + k] * t) * spread + dir * throwOut;
        }
      }
      return render(mixed, COUNT, { yaw: YAW, width: SIZE });
    });
    const strip = sheet(frames, SIZE);
    const name = `morph-${SHAPE_NAMES[i]}-${SHAPE_NAMES[i + 1]}.png`;
    writeFileSync(new URL(name, OUT), png(strip.width, strip.height, strip.pixels));
    console.log(`  ${name}`);
  }
}
