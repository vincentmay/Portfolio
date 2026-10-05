import { useId } from "react";
import { ACTIVE_MARK } from "../brand/designs.ts";
import { VIEW, renderDesign, type Layer } from "../brand/geometry.ts";
import "./marks.css";

/**
 * One mark, four ways of bringing it to life.
 *
 * Every design in the gallery draws the same pendant from the same geometry —
 * what separates them is how it arrives on screen. These are deliberately not
 * variations on one animation: a line drawing itself, a broadcast tearing, a
 * casting catching light, and a thing coming apart are four different ideas
 * about what the object is.
 */

const layersOf = () => {
  const { back, body, front } = renderDesign(ACTIVE_MARK);
  return { back, body, front, all: [...back, ...body, ...front] };
};

const paint = (layer: Layer, key: string | number, extra?: Record<string, unknown>) =>
  layer.fill ? (
    <path key={key} d={layer.d} fill="currentColor" {...extra} />
  ) : (
    <path
      key={key}
      d={layer.d}
      fill="none"
      stroke="currentColor"
      strokeWidth={layer.width}
      strokeLinecap="round"
      {...extra}
    />
  );

type MarkProps = { className?: string; replay?: boolean };

const frame = (className: string | undefined, children: React.ReactNode) => (
  <svg
    className={className}
    viewBox={`0 0 ${VIEW} ${VIEW}`}
    role="presentation"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

/* ------------------------------------------------------------------ studio */

/**
 * The mark draws itself, then fills.
 *
 * `pathLength` normalises every path to 1 regardless of its real length, so a
 * single dash rule paces the short corner spikes and the long band identically
 * and the whole thing lands together.
 */
export function DrawMark({ className }: MarkProps) {
  const { all, back, body, front } = layersOf();
  return frame(`mark-draw ${className ?? ""}`.trim(), [
    <g key="trace" className="mark-draw-trace">
      {all.map((layer, i) =>
        paint({ ...layer, fill: false, width: layer.fill ? 0.8 : layer.width }, i, {
          pathLength: 1,
          style: { animationDelay: `${0.06 * i}s` },
        }),
      )}
    </g>,
    <g key="solid" className="mark-draw-solid">
      {[...back, ...body, ...front].map((layer, i) => paint(layer, i))}
    </g>,
  ]);
}

/* ---------------------------------------------------------------- terminal */

/** Cut into scanlines that tear sideways, the way a bad signal does. */
export function GlitchMark({ className }: MarkProps) {
  const id = useId().replace(/:/g, "");
  const rows = 10;
  const { all } = layersOf();

  return frame(`mark-glitch ${className ?? ""}`.trim(), [
    <defs key="defs">
      {/* Defined once and referenced per row. The band alone is several hundred
          points, so repeating it ten times would put most of the page's weight
          into one logo. */}
      <g id={`${id}-art`}>{all.map((layer, i) => paint(layer, i))}</g>
      {Array.from({ length: rows }, (_, r) => (
        <clipPath key={r} id={`${id}-${r}`}>
          <rect x="0" y={(r * VIEW) / rows} width={VIEW} height={VIEW / rows + 0.5} />
        </clipPath>
      ))}
    </defs>,
    ...Array.from({ length: rows }, (_, r) => (
      <g
        key={r}
        clipPath={`url(#${id}-${r})`}
        className="mark-glitch-row"
        style={{ animationDelay: `${r * 0.11}s`, ["--row" as string]: r % 3 }}
      >
        <use href={`#${id}-art`} />
      </g>
    )),
  ]);
}

/* ----------------------------------------------------------------- chrome */

/**
 * Polished metal turning under a light.
 *
 * The mark becomes a mask and a banded gradient is swept across it, which is
 * what a highlight travelling over a curved surface actually looks like — far
 * more convincing than animating the fill colour.
 */
export function ChromeMark({ className }: MarkProps) {
  const id = useId().replace(/:/g, "");
  const { all } = layersOf();

  return frame(`mark-chrome ${className ?? ""}`.trim(), [
    <defs key="defs">
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0.35">
        <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
        <stop offset="0.34" stopColor="currentColor" stopOpacity="1" />
        <stop offset="0.42" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="0.52" stopColor="currentColor" stopOpacity="0.55" />
        <stop offset="0.7" stopColor="currentColor" stopOpacity="1" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
      </linearGradient>
      <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW} height={VIEW}>
        <g color="#fff">{all.map((layer, i) => paint(layer, i))}</g>
      </mask>
    </defs>,
    <g key="metal" mask={`url(#${id}-mask)`}>
      <rect
        className="mark-chrome-sheen"
        x={-VIEW}
        y="0"
        width={VIEW * 3}
        height={VIEW}
        fill={`url(#${id}-sheen)`}
      />
    </g>,
  ]);
}

/* ---------------------------------------------------------------- kinetic */

/**
 * The mark comes apart and snaps back.
 *
 * `renderDesign` hands back one layer per primitive — the band, each corner
 * spike, each half of the orbit — so every piece can be thrown on its own
 * vector instead of the whole logo sliding about as one lump.
 */
export function ShatterMark({ className }: MarkProps) {
  const { all } = layersOf();
  const throws = [
    [0, -34, -18],
    [26, -20, 22],
    [-28, 18, -26],
    [18, 30, 14],
    [-22, -26, 30],
  ];

  return frame(`mark-shatter ${className ?? ""}`.trim(), [
    ...all.map((layer, i) => {
      const [dx, dy, rot] = throws[i % throws.length];
      return paint(layer, i, {
        className: "mark-shard",
        style: {
          ["--dx" as string]: `${dx}px`,
          ["--dy" as string]: `${dy}px`,
          ["--rot" as string]: `${rot}deg`,
          animationDelay: `${i * 0.05}s`,
        },
      });
    }),
  ]);
}
