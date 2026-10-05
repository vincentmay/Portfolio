import { useId } from "react";
import { ACTIVE_MARK } from "./designs";
import { renderDesign, type Layer } from "./geometry";

/** A dimensional silver treatment of the same geometry used by the small mark. */
export function Stellar({ className }: { className?: string }) {
  const id = `stellar-${useId()}`;
  const { back, body, front, gapWidth, frontPath } = renderDesign(
    ACTIVE_MARK,
    1,
  );
  const draw = (layers: Layer[], paint: string, edge = false) =>
    layers.map((layer, i) => (
      <path
        key={i}
        d={layer.d}
        fill={layer.fill ? paint : "none"}
        fillRule={layer.evenOdd ? "evenodd" : undefined}
        stroke={layer.fill ? (edge ? "#5b625e" : undefined) : paint}
        strokeWidth={layer.fill ? 0.12 : layer.width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ));
  return (
    <svg
      className={className}
      viewBox="-3 -3 106 106"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${id}-silver`}
          x1="0"
          y1="0"
          x2="1"
          y2="0.85"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#e5e9e5" />
          <stop offset="0.17" stopColor="#59635d" />
          <stop offset="0.28" stopColor="#fafbf8" />
          <stop offset="0.38" stopColor="#bbc5bc" />
          <stop offset="0.44" stopColor="#404b45" />
          <stop offset="0.5" stopColor="#f8faf7" />
          <stop offset="0.56" stopColor="#8a9690" />
          <stop offset="0.64" stopColor="#e6ebe4" />
          <stop offset="0.75" stopColor="#444e49" />
          <stop offset="0.88" stopColor="#f7f9f5" />
          <stop offset="1" stopColor="#919b94" />
        </linearGradient>
        <linearGradient id={`${id}-band`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#47514a" />
          <stop offset="0.28" stopColor="#c6cec6" />
          <stop offset="0.46" stopColor="#fff" />
          <stop offset="0.54" stopColor="#e0e5dc" />
          <stop offset="0.72" stopColor="#737f76" />
          <stop offset="1" stopColor="#e9eee6" />
        </linearGradient>
        <filter
          id={`${id}-surface`}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="1.6"
            specularConstant="0.65"
            specularExponent="22"
            lightingColor="#ffffff"
            result="light"
          >
            <fePointLight x="-35" y="-60" z="80" />
          </feSpecularLighting>
          <feComposite
            in="light"
            in2="SourceAlpha"
            operator="in"
            result="shine"
          />
          <feBlend in="SourceGraphic" in2="shine" mode="screen" />
        </filter>
        <mask
          id={`${id}-gap`}
          maskUnits="userSpaceOnUse"
          x="-3"
          y="-3"
          width="106"
          height="106"
        >
          <rect x="-3" y="-3" width="106" height="106" fill="white" />
          {frontPath && (
            <path
              d={frontPath}
              fill="none"
              stroke="black"
              strokeWidth={gapWidth}
              strokeLinecap="round"
            />
          )}
        </mask>
      </defs>
      <g transform="translate(.45 .65)" opacity=".8">
        {draw(back, "#4a554d")}
        {draw(body, "#4a554d")}
      </g>
      {draw(back, `url(#${id}-band)`)}
      <g mask={`url(#${id}-gap)`} filter={`url(#${id}-surface)`}>
        {draw(body, `url(#${id}-silver)`, true)}
      </g>
      <g filter={`url(#${id}-surface)`}>{draw(front, `url(#${id}-band)`)}</g>
    </svg>
  );
}
