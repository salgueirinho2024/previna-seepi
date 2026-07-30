import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary shrink-0">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "brand";
}) {
  const valueTone =
    tone === "warning"
      ? "text-amber-600"
      : tone === "danger"
      ? "text-red-600"
      : tone === "brand"
      ? "text-brand-600"
      : "text-ink-900";

  return (
    <div className="card p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueTone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-300">{hint}</p>}
    </div>
  );
}

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-100 py-16 text-center">
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-ink-300">{subtitle}</p>}
    </div>
  );
}
