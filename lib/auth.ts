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
          image: user.image,
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
        token.image = (user as any).image ?? null;
        token.empresaId = (user as any).empresaId;
        token.empresaNome = (user as any).empresaNome;
      }
      // Allows the client to call the `update()` session hook after the
      // profile is edited in "Minha Conta" so the sidebar/avatar refresh
      // without requiring a full logout/login.
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (typeof session.image !== "undefined") token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).name = token.name;
        (session.user as any).role = token.role;
        (session.user as any).image = token.image ?? null;
        (session.user as any).empresaId = token.empresaId;
        (session.user as any).empresaNome = token.empresaNome;
      }
      return session;
    },
  },
};
