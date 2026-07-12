type LogoPlaceholderProps = {
  className?: string;
  label?: string;
};

/** Neutral hand-off surface. It deliberately contains no logo geometry. */
export function LogoPlaceholder({ className = "", label }: LogoPlaceholderProps) {
  return (
    <span
      className={`logo-placeholder ${className}`.trim()}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
    >
      {label ? <span>{label}</span> : null}
    </span>
  );
}
