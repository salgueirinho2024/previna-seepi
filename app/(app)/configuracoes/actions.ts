"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

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
