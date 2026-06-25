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
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/10 bg-white px-4 py-3">
        <Link
          href="/pro"
          className="text-sm font-bold tracking-wide text-[#1c1d1f]"
        >
          <span className="text-[#C71121]">AGRISEM</span> · Espace Pro
        </Link>
        <UserButton />
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
