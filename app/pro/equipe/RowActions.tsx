"use client";

type Props = {
  role: "admin" | "commercial";
  toggleRole: () => void;
  remove: () => void;
};

export default function RowActions({ role, toggleRole, remove }: Props) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <form action={toggleRole}>
        <button
          type="submit"
          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[#000002] transition-colors hover:border-[#C71121]"
        >
          {role === "admin" ? "Passer commercial" : "Passer admin"}
        </button>
      </form>
      <form
        action={remove}
        onSubmit={(e) => {
          if (!confirm("Retirer définitivement l'accès de ce membre ?")) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#C71121] transition-colors hover:bg-[#C71121]/10"
        >
          Retirer
        </button>
      </form>
    </div>
  );
}
