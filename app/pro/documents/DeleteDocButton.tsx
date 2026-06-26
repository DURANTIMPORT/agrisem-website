"use client";

export default function DeleteDocButton({ remove }: { remove: () => void }) {
  return (
    <form
      action={remove}
      onSubmit={(e) => {
        if (!confirm("Supprimer définitivement ce document ?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#C71121] transition-colors hover:bg-[#C71121]/10"
      >
        Supprimer
      </button>
    </form>
  );
}
