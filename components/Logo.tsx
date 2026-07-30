import Image from "next/image";

export function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Previna-Se"
        width={size}
        height={size}
        priority
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      {withText && (
        <span className="text-lg font-bold tracking-tight text-ink-900">
          Previna<span className="text-brand-500">-Se</span>
        </span>
      )}
    </div>
  );
}
