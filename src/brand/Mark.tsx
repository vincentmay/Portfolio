import { useId } from "react";
import { pendantMark } from "./pendant-mark";

const VIEW = 100;
type Layer = { d: string; fill?: boolean; evenOdd?: boolean; width?: number };
const draw = (layer: Layer, i: number) =>
  layer.fill ? (
    <path key={i} d={layer.d} fill="currentColor" fillRule={layer.evenOdd ? "evenodd" : undefined} />
  ) : (
    <path
      key={i}
      d={layer.d}
      fill="none"
      stroke="currentColor"
      strokeWidth={layer.width}
      strokeLinecap="round"
    />
  );

/**
 * The mark, drawn. When the design has a band, it is split into two arcs so the
 * far half disappears behind the star and the near half crosses in front of it;
 * the mask cuts a sliver of darkness either side of the crossing, which is what
 * sells the wrap at any size.
 */
export function Mark({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const maskId = `mark-stellar-${useId()}`;
  const { back, body, front, gapWidth, frontPath } = pendantMark;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {frontPath && (
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW} height={VIEW}>
            <rect width={VIEW} height={VIEW} fill="#fff" />
            <path
              d={frontPath}
              fill="none"
              stroke="#000"
              strokeWidth={gapWidth}
              strokeLinecap="round"
            />
          </mask>
        </defs>
      )}
      {back.map(draw)}
      <g mask={frontPath ? `url(#${maskId})` : undefined}>{body.map(draw)}</g>
      {front.map(draw)}
    </svg>
  );
}
