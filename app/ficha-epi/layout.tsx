import { requireSession } from "@/lib/session";

export default async function FichaEpiLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <div className="min-h-screen bg-[#f6f8f7] print:bg-white">{children}</div>;
}
