export function PortraitOrbit() {
  return (
    <svg
      className="portrait-orbit"
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="200"
        cy="206"
        rx="198"
        ry="115"
        transform="rotate(-34 200 206)"
      />
      <ellipse
        className="portrait-orbit-secondary"
        cx="200"
        cy="206"
        rx="164"
        ry="153"
        transform="rotate(24 200 206)"
      />
      <circle cx="45" cy="303" r="3" />
    </svg>
  );
}
