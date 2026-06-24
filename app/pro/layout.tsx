import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

// L'espace /pro n'est jamais indexé par les moteurs de recherche.
export const metadata: Metadata = {
  title: "Espace Pro",
  robots: { index: false, follow: false },
};

export default function ProLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f5f7]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-navy px-4 py-3 text-white">
        <Link href="/pro" className="text-sm font-semibold tracking-wide">
          Agrisem · Espace Pro
        </Link>
        <UserButton />
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
