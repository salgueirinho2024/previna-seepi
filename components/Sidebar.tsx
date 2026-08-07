"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  icon: (props: { active?: boolean }) => React.ReactNode;
  /** Caminho usado para decidir se o item está ativo, quando o href tem querystring. */
  match?: string;
};

const NAV_EPI: NavItem[] = [
  { href: "/dashboard", label: "Painel", icon: PainelIcon },
  { href: "/inventario", label: "Inventário", icon: InventarioIcon },
  { href: "/colaboradores", label: "Colaboradores", icon: ColaboradoresIcon },
  { href: "/setores", label: "Setores", icon: SetoresIcon },
  { href: "/solicitacoes", label: "Entregas", icon: SolicitacoesIcon },
  { href: "/devolucoes", label: "Devoluções", icon: DevolucoesIcon },
  { href: "/relatorios", label: "Relatórios", icon: RelatoriosIcon },
  { href: "/configuracoes", label: "Configurações", icon: ConfiguracoesIcon },
];

const NAV_TREINAMENTOS: NavItem[] = [
  { href: "/treinamentos", label: "Painel", icon: PainelIcon },
  { href: "/colaboradores?modulo=treinamentos", label: "Colaboradores", icon: ColaboradoresIcon, match: "/colaboradores" },
  { href: "/setores?modulo=treinamentos", label: "Setores", icon: SetoresIcon, match: "/setores" },
  { href: "/treinamentos/catalogo", label: "Catálogo", icon: TreinamentosIcon },
  { href: "/treinamentos/registrar", label: "Registrar", icon: SolicitacoesIcon },
  { href: "/treinamentos/relatorios", label: "Relatórios", icon: RelatoriosIcon },
  { href: "/treinamentos/configuracoes", label: "Configurações", icon: ConfiguracoesIcon },
];

/** Páginas de dados compartilhados (Colaboradores/Setores) que podem ser acessadas
 * tanto pelo módulo de EPI quanto pelo de Treinamentos. O parâmetro ?modulo=treinamentos
 * na URL é o que diz ao menu lateral qual conjunto de itens mostrar nessas páginas. */
const PAGINAS_COMPARTILHADAS = ["/colaboradores", "/setores"];

export function Sidebar({
  empresaNome,
  userName,
  userImage,
}: {
  empresaNome: string;
  userName?: string;
  userImage?: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const emUmaPaginaCompartilhada = PAGINAS_COMPARTILHADAS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isTreinamentos =
    pathname.startsWith("/treinamentos") ||
    (emUmaPaginaCompartilhada && searchParams.get("modulo") === "treinamentos");

  const NAV = isTreinamentos ? NAV_TREINAMENTOS : NAV_EPI;
  const moduloLabel = isTreinamentos ? "Treinamentos" : "Gestão de EPI";

  // Match mais específico primeiro, pra "/treinamentos" (Painel) não "vencer"
  // sobre "/treinamentos/catalogo" (Catálogo) na hora de decidir o item ativo.
  const melhorMatch = [...NAV]
    .map((item) => item.match ?? item.href.split("?")[0])
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <>
      {/* Mobile top bar — visible below lg, replaced by the static sidebar on desktop */}
      <header className="flex h-14 items-center justify-between border-b border-ink-100 bg-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100/60"
        >
          <MenuIcon />
        </button>
        <Logo size={24} />
        <div className="h-9 w-9" />
      </header>

      {/* Backdrop, only rendered while the drawer is open on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-ink-100 bg-surface transition-transform duration-200 ease-in-out lg:static lg:z-0 lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
          <Logo size={28} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100/60 lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Empresa</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink-800">{empresaNome}</p>
          <p className="mt-2.5 text-xs font-medium uppercase tracking-wide text-ink-300">Módulo</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-brand-700 dark:text-brand-400">{moduloLabel}</p>
          <Link
            href="/inicio"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline dark:text-brand-400"
          >
            <ModulosIcon />
            Trocar de módulo
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const hrefSemQuery = item.href.split("?")[0];
            const active = melhorMatch === (item.match ?? hrefSemQuery);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
          {userName && (
            <Link
              href="/configuracoes"
              onClick={() => setOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-ink-100/60 ${
                pathname === "/configuracoes" ? "bg-brand-50 text-brand-700" : "text-ink-700"
              }`}
            >
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userImage}
                  alt={userName}
                  className="h-8 w-8 shrink-0 rounded-full border border-ink-100 object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {userName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="truncate text-sm font-medium">{userName}</span>
            </Link>
          )}
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 transition hover:bg-ink-100/60"
          >
            <SairIcon />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function iconProps(active?: boolean) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: active ? "rgb(var(--brand-700))" : "rgb(var(--ink-500))",
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
function ModulosIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function SetoresIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
function TreinamentosIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}
function DevolucoesIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M4 12a8 8 0 1 1 2.5 5.8" />
      <path d="M4 20v-5h5" />
    </svg>
  );
}
function RelatoriosIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
    </svg>
  );
}
function ConfiguracoesIcon({ active }: { active?: boolean }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
