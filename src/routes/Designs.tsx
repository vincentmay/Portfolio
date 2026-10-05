import { Link } from "@tanstack/react-router";
import { Mark } from "../brand/Mark.tsx";
import { ChromeMark, DrawMark, GlitchMark, ShatterMark } from "../designs/Marks.tsx";
import { useDocument } from "../app/page.ts";
import "../designs/gallery.css";

/**
 * The five directions, side by side.
 *
 * Each card runs its design's real logo animation rather than a screenshot,
 * because the animation is half of what separates them — a still would make
 * Studio and Chrome look like the same idea in two colours.
 */
const ENTRIES = [
  {
    to: "/en" as const,
    name: "Field",
    idea: "Dark, cinematic. The mark is a hundred thousand particles that reform into a disc, a spiral, an orrery and a burst as you scroll.",
    motion: "Particle morph · WebGL",
    preview: <Mark className="gl-mark" />,
    tone: "field",
  },
  {
    to: "/d/studio" as const,
    name: "Studio",
    idea: "Paper white, one typeface, no ornament. Spacing and a strict left margin do the whole job. After openai.com.",
    motion: "Line draw, then fill",
    preview: <DrawMark className="gl-mark" />,
    tone: "studio",
  },
  {
    to: "/d/terminal" as const,
    name: "Terminal",
    idea: "The portfolio as a readout: fixed width, monospace throughout, leader dots and rules instead of decoration.",
    motion: "Scanline tear",
    preview: <GlitchMark className="gl-mark" />,
    tone: "terminal",
  },
  {
    to: "/d/chrome" as const,
    name: "Chrome",
    idea: "The pendant's own material as a layout. Warm silver, enormous thin type, highlights that travel across the letterforms.",
    motion: "Sheen sweep · slow turn",
    preview: <ChromeMark className="gl-mark" />,
    tone: "chrome",
  },
  {
    to: "/d/kinetic" as const,
    name: "Kinetic",
    idea: "Swiss poster, shouted. A hard grid, one accent against black, type as large as the measure allows.",
    motion: "Shatter and reassemble",
    preview: <ShatterMark className="gl-mark" />,
    tone: "kinetic",
  },
];

export function Designs() {
  useDocument("en", "Five directions — Vincent May");

  return (
    <div className="gallery">
      <header>
        <p className="gl-kicker">Vincent May — UI directions</p>
        <h1>Five designs, five ways the mark behaves.</h1>
        <p className="gl-sub">
          Same content, same pendant, same geometry. Everything else is different — layout,
          palette, typography, and how the logo arrives on screen. Hover a card to provoke its
          animation.
        </p>
      </header>

      <ol className="gl-list">
        {ENTRIES.map((entry, i) => (
          <li key={entry.name} className={`gl-card gl-${entry.tone}`}>
            <Link to={entry.to}>
              <div className="gl-stage">{entry.preview}</div>
              <div className="gl-text">
                <span className="gl-num">{String(i + 1).padStart(2, "0")}</span>
                <h2>{entry.name}</h2>
                <p className="gl-motion">{entry.motion}</p>
                <p>{entry.idea}</p>
                <span className="gl-go">Open →</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
