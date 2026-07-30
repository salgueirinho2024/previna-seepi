"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  empresaNome: z.string().min(2, "Informe o nome da empresa"),
  cnpj: z.string().optional(),
  nome: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

export type RegisterState = { error?: string; success?: boolean };

export async function registerEmpresa(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = schema.safeParse({
    empresaNome: formData.get("empresaNome"),
    cnpj: formData.get("cnpj") || undefined,
    nome: formData.get("nome"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { empresaNome, cnpj, nome, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.empresa.create({
    data: {
      nome: empresaNome,
      cnpj: cnpj || undefined,
      users: {
        create: {
          name: nome,
          email: email.toLowerCase().trim(),
          passwordHash,
          role: "admin",
        },
      },
      unidades: {
        create: { nome: "Matriz" },
      },
    },
  });

  return { success: true };
}
