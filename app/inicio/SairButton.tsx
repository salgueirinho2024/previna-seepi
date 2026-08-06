"use client";

import { signOut } from "next-auth/react";

export function SairButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-medium text-ink-500 transition hover:text-ink-800"
    >
      Sair
    </button>
  );
}
