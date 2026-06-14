/**
 * Suzani / islimi milliy naqsh komponentlari (SVG).
 * Header, footer, hero va kartalarda bezak sifatida ishlatiladi.
 */

type SvgProps = React.SVGProps<SVGSVGElement>;

/** Markaziy suzani gul motivi (rosette) */
export function SuzaniRosette({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} {...props}>
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 45} 50 50)`}>
            <path d="M50 50 C50 30, 42 18, 50 8 C58 18, 50 30, 50 50" />
            <circle cx="50" cy="14" r="3" fill="currentColor" stroke="none" />
          </g>
        ))}
      </g>
      <circle cx="50" cy="50" r="7" fill="currentColor" opacity="0.9" />
      <circle cx="50" cy="50" r="13" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
    </svg>
  );
}

/** Islimi spiral barg motivi (burchaklar uchun) */
export function IslimiVine({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} {...props}>
      <path
        d="M10 110 C10 70, 30 50, 60 50 C40 50, 30 30, 50 12 C55 30, 70 36, 70 50 C90 50, 108 64, 108 100"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="12" r="4" fill="currentColor" />
      <circle cx="108" cy="100" r="4" fill="currentColor" />
      <path d="M60 50 q10 -14 24 -8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Takrorlanuvchi suzani bordyur (gorizontal chiziq) */
export function SuzaniBorder({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 240 24" preserveAspectRatio="xMidYMid meet" className={className} {...props}>
      <defs>
        <pattern id="suzani-strip" width="40" height="24" patternUnits="userSpaceOnUse">
          <path d="M20 4 l6 8 -6 8 -6 -8 z" fill="currentColor" opacity="0.85" />
          <circle cx="2" cy="12" r="2.4" fill="currentColor" opacity="0.5" />
          <circle cx="38" cy="12" r="2.4" fill="currentColor" opacity="0.5" />
          <path d="M10 12 q5 -7 10 0" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.6" />
          <path d="M20 12 q5 7 10 0" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="240" height="24" fill="url(#suzani-strip)" />
    </svg>
  );
}

/** Kichik to'rtburchak bezak (sarlavhalar yonida) */
export function StarMotif({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M12 1l2.4 6.6L21 8l-5 4.6L17.8 21 12 17.2 6.2 21 8 12.6 3 8l6.6-.4z"
        fill="currentColor"
      />
    </svg>
  );
}
