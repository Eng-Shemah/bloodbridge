/** A drawn blood-drop shape (not an icon font) so the hero animation can scale/rotate it smoothly. */
export function BloodDrop({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="dropGrad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.75" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d="M50 4C50 4 10 62 10 90a40 40 0 0 0 80 0C90 62 50 4 50 4Z" fill="url(#dropGrad)" />
      <ellipse cx="37" cy="78" rx="7" ry="13" fill="white" opacity="0.28" />
    </svg>
  );
}
