"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", label: "Painel", icon: PainelIcon },
  { href: "/inventario", label: "Inventário", icon: InventarioIcon },
  { href: "/colaboradores", label: "Colaboradores", icon: ColaboradoresIcon },
  { href: "/solicitacoes", label: "Solicitações", icon: SolicitacoesIcon },
];

export function Sidebar({ empresaNome }: { empresaNome: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-ink-100 bg-white">
      <div className="flex h-16 items-center border-b border-ink-100 px-5">
        <Logo size={28} />
      </div>

      <div className="px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Empresa</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-ink-800">{empresaNome}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-100/60"
              }`}
            >
              <Icon active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 transition hover:bg-ink-100/60"
        >
          <SairIcon />
          Sair
        </button>
      </div>
    </aside>
  );
}

function iconProps(active?: boolean) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: active ? "#00863a" : "#5b6b65",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function PainelIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function InventarioIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M21 8L12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}
function ColaboradoresIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" />
      <path d="M17 8.5a3 3 0 1 1 0-6M20.5 20c0-3-1.8-5.2-4-6" />
    </svg>
  );
}
function SolicitacoesIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 3v3h8V3M8 11h8M8 15h5" />
    </svg>
  );
}
function SairIcon() {
  return (
    <svg {...iconProps(false)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
