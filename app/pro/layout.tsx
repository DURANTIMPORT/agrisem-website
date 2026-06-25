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
    <div className="flex min-h-screen flex-col bg-[#f2f3f4]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-t-4 border-[#C71121] bg-[#000002] px-4 py-3">
        <Link href="/pro" className="text-sm font-bold tracking-wide text-white">
          <span className="text-[#C71121]">AGRISEM</span>
          <span className="text-white/50"> · Espace Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-white/60 transition-colors hover:text-[#C71121]"
          >
            ← Site Agrisem
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
