import Link from "next/link";
import { requireSession } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SairButton } from "./SairButton";

const MODULOS = [
  {
    nome: "Gestão de EPI",
    descricao: "Inventário, entregas, devoluções e ficha de EPI dos colaboradores.",
    href: "/dashboard",
    disponivel: true,
    icon: EpiIcon,
  },
  {
    nome: "Treinamentos",
    descricao: "Controle de treinamentos obrigatórios, vencimentos e certificados.",
    href: "#",
    disponivel: false,
    icon: TreinamentoIcon,
  },
  {
    nome: "Documentos de SST",
    descricao: "PGR, PCMSO, LTCAT e demais documentos com vencimento e histórico.",
    href: "#",
    disponivel: false,
    icon: DocumentoIcon,
  },
];

export default async function InicioPage() {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-page">
      <header className="flex items-center justify-between border-b border-ink-100 px-6 py-4 lg:px-10">
        <Logo size={30} />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SairButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-300">
          {session.user.empresaNome}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900">O que você quer acessar?</h1>
        <p className="mt-1 text-sm text-ink-500">Escolha um módulo para continuar.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((modulo) => (
            <ModuloCard key={modulo.nome} {...modulo} />
          ))}
        </div>
      </main>
    </div>
  );
}

function ModuloCard({
  nome,
  descricao,
  href,
  disponivel,
  icon: Icon,
}: {
  nome: string;
  descricao: string;
  href: string;
  disponivel: boolean;
  icon: (props: { className?: string }) => React.ReactNode;
}) {
  const content = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink-900">{nome}</h2>
      <p className="mt-1.5 text-sm text-ink-500">{descricao}</p>
      {!disponivel && (
        <span className="mt-4 inline-flex w-fit items-center rounded-full bg-ink-100/60 px-2.5 py-1 text-xs font-medium text-ink-500">
          Em breve
        </span>
      )}
    </>
  );

  if (!disponivel) {
    return (
      <div className="card flex cursor-not-allowed flex-col p-6 opacity-60">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="card flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {content}
    </Link>
  );
}

function EpiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function TreinamentoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
    </svg>
  );
}
function DocumentoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}
