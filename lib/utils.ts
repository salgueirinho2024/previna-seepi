export function formatBRL(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysUntil(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const MOTIVOS_SOLICITACAO = [
  "Primeira entrega",
  "Troca periódica",
  "Gerenciamento",
  "Dano / Perda",
  "Substituição",
] as const;

export const MOTIVOS_DEVOLUCAO = [
  "Desligamento",
  "Recolhimento",
  "Troca de item",
  "Item danificado",
  "Outro",
] as const;

/** Classifica um item entregue de acordo com a data de próxima troca. */
export function trocaStatus(proximaTroca: Date | string, diasAviso: number): "vencida" | "atencao" | "ok" {
  const dias = daysUntil(proximaTroca);
  if (dias < 0) return "vencida";
  if (dias <= diasAviso) return "atencao";
  return "ok";
}

export function statusBadgeClasses(status: string) {
  switch (status) {
    case "entregue":
      return "bg-brand-100 text-brand-800";
    case "aprovada":
      return "bg-amber-500/10 text-amber-600";
    case "cancelada":
      return "bg-red-100 text-red-700";
    default:
      return "bg-ink-100 text-ink-700";
  }
}

export function statusLabel(status: string) {
  switch (status) {
    case "entregue":
      return "Entregue";
    case "aprovada":
      return "Aprovada";
    case "cancelada":
      return "Cancelada";
    default:
      return "Pendente";
  }
}
