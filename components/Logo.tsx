export function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 46 L32 96 L50 96 L50 46 Z" fill="#95ebc0" />
        <path
          d="M28 40 h20 a18 18 0 0 1 0 36 h-8 v20 h-18 z"
          fill="#00c853"
        />
        <path
          d="M40 12 c-14 2 -24 13 -24 26 h34 c0 -6 -2 -20 -10 -26 z"
          fill="#f0c419"
          stroke="#1c2b26"
          strokeWidth="2.5"
        />
        <path
          d="M40 12 c8 2 14 12 14 26 h10 c0 -14 -8 -25 -20 -28 z"
          fill="#dd8b06"
          stroke="#1c2b26"
          strokeWidth="2.5"
        />
        <rect x="20" y="34" width="8" height="8" rx="1.5" fill="#f0c419" stroke="#1c2b26" strokeWidth="2" />
        <rect x="46" y="34" width="8" height="8" rx="1.5" fill="#f0c419" stroke="#1c2b26" strokeWidth="2" />
      </svg>
      {withText && (
        <span className="text-lg font-bold tracking-tight text-ink-900">
          Previna<span className="text-brand-500">-Se</span>
        </span>
      )}
    </div>
  );
}
