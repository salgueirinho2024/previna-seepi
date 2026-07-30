"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // 1.5MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const schema = z.object({
  diasAvisoTroca: z.coerce.number().int().min(1, "Informe ao menos 1 dia"),
});

export type ConfiguracoesFormState = { error?: string; success?: boolean };

export async function updateConfiguracoes(
  _prev: ConfiguracoesFormState,
  formData: FormData
): Promise<ConfiguracoesFormState> {
  const session = await requireSession();

  const parsed = schema.safeParse({
    diasAvisoTroca: formData.get("diasAvisoTroca"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.empresa.update({
    where: { id: session.user.empresaId },
    data: { diasAvisoTroca: parsed.data.diasAvisoTroca },
  });

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  return { success: true };
}

const accountSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome"),
    email: z.string().email("E-mail inválido"),
    removeImage: z.coerce.boolean().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.newPassword || data.newPassword.length >= 6, {
    message: "A nova senha deve ter ao menos 6 caracteres",
    path: ["newPassword"],
  })
  .refine((data) => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: "A confirmação de senha não confere",
    path: ["confirmPassword"],
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Informe sua senha atual para definir uma nova senha",
    path: ["currentPassword"],
  });

export type AccountFormState = {
  error?: string;
  success?: boolean;
  name?: string;
  image?: string | null;
};

export async function updateAccount(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const session = await requireSession();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    removeImage: formData.get("removeImage") === "true",
    currentPassword: formData.get("currentPassword") || undefined,
    newPassword: formData.get("newPassword") || undefined,
    confirmPassword: formData.get("confirmPassword") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { name, email, removeImage, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  const emailNormalized = email.toLowerCase().trim();
  if (emailNormalized !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: emailNormalized } });
    if (existing) return { error: "Já existe uma conta com esse e-mail." };
  }

  let passwordHash: string | undefined;
  if (newPassword) {
    const valid = await bcrypt.compare(currentPassword ?? "", user.passwordHash);
    if (!valid) return { error: "Senha atual incorreta." };
    passwordHash = await bcrypt.hash(newPassword, 10);
  }

  let image: string | null | undefined = undefined;
  const file = formData.get("image");
  if (removeImage) {
    image = null;
  } else if (file instanceof File && file.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { error: "Envie uma imagem PNG, JPEG ou WEBP." };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: "A imagem deve ter no máximo 1,5MB." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    image = `data:${file.type};base64,${buffer.toString("base64")}`;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email: emailNormalized,
      ...(passwordHash ? { passwordHash } : {}),
      ...(image !== undefined ? { image } : {}),
    },
  });

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");

  return { success: true, name: updated.name, image: updated.image };
}
