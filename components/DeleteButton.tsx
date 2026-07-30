"use client";

export function DeleteButton({
  action,
  confirmText = "Tem certeza que deseja excluir? Essa ação não pode ser desfeita.",
  label = "Excluir",
}: {
  action: () => Promise<void>;
  confirmText?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn-danger">
        {label}
      </button>
    </form>
  );
}
