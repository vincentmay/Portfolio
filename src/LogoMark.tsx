import { useId } from "react";

type LogoMarkProps = {
  className?: string;
  title?: string;
};

/**
 * The mark: a four-point north star with a tilted orbit ring. The star is a
 * solid concave-edged shape so it stays legible at 20px. The ring is a full
 * ellipse behind the star plus its lower half redrawn in front; a transparent
 * gap masked out of the star along that front arc keeps the crossing readable
 * in a single color on any background. Geometry mirrors src/logoParticles.ts —
 * change both together.
 */
export const LOGO_STAR_PATH =
  "M50.5 3Q52 41 94 42.5Q52.5 47 49.5 97Q47.5 47.5 6 45.5Q47.5 41 50.5 3Z";

const RING_FRONT_ARC = "M14 44A36 15 0 0 0 86 44";

export function LogoMark({ className = "", title }: LogoMarkProps) {
  const maskId = useId();

  return (
    <svg
      className={`logo-mark ${className}`.trim()}
      viewBox="0 0 100 100"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="#fff" />
          <g transform="rotate(-30 50 44)">
            <path
              d={RING_FRONT_ARC}
              fill="none"
              stroke="#000"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        </mask>
      </defs>
      <g transform="rotate(-30 50 44)" fill="none" stroke="currentColor">
        <ellipse cx="50" cy="44" rx="36" ry="15" strokeWidth="5.5" />
      </g>
      <path d={LOGO_STAR_PATH} fill="currentColor" mask={`url(#${maskId})`} />
      <g
        transform="rotate(-30 50 44)"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        <path d={RING_FRONT_ARC} strokeWidth="5.5" />
      </g>
    </svg>
  );
}
