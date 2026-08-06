import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  // The photo is only ever read from the database, never from the session
  // cookie — putting a base64 image inside the NextAuth JWT bloats the
  // cookie and causes "header too large" errors on every request.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  return (
    <div className="flex min-h-screen flex-col bg-page lg:flex-row">
      <Sidebar
        empresaNome={session.user.empresaNome}
        userName={session.user.name}
        userImage={user?.image}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
