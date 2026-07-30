import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { empresa: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          empresaId: user.empresaId,
          empresaNome: user.empresa.nome,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.empresaId = (user as any).empresaId;
        token.empresaNome = (user as any).empresaNome;
      }
      // Allows the client to call the `update()` session hook after the
      // profile is edited in "Minha Conta" so the sidebar/name refresh
      // without requiring a full logout/login. The photo itself is NEVER
      // stored here — it lives only in the database and is fetched fresh
      // wherever it's shown (it can be several hundred KB, and this token
      // is serialized into a cookie sent on every request, so putting an
      // image in it breaks with "header too large" errors).
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).name = token.name;
        (session.user as any).role = token.role;
        (session.user as any).empresaId = token.empresaId;
        (session.user as any).empresaNome = token.empresaNome;
      }
      return session;
    },
  },
};
