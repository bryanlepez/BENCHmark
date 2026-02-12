import Link from "next/link";
import { ReactNode } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold tracking-tight">BENCHmark</p>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded border border-line px-3 py-1 text-sm hover:bg-black hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded border border-line px-3 py-1 text-sm hover:bg-black hover:text-white"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">{children}</main>
    </div>
  );
}
