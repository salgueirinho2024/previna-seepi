import { requireSession } from "@/lib/session";

export default async function FichaEpiLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <div className="min-h-screen bg-page print:bg-white print:text-black">{children}</div>;
}
