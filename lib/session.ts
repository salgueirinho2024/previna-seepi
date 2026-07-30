import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Every data query in the app MUST be scoped by empresaId (tenant id).
 * Call this at the top of any page/server-action that touches the database.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.empresaId) {
    redirect("/login");
  }
  return session!;
}
