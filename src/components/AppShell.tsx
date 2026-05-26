import Link from "next/link";
import { LinkButton } from "./ui/Button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-white text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="ARBETSpoolen"
              className="h-[52px] w-auto"
            />
          </Link>

          <nav className="flex items-center gap-2">
            <LinkButton href="/register?role=job_seeker" variant="outline" size="sm" className="hidden sm:inline-flex">
              För arbetssökare
            </LinkButton>
            <LinkButton href="/register?role=employer" variant="outline" size="sm" className="hidden sm:inline-flex">
              För arbetsgivare
            </LinkButton>
            <LinkButton href="/employer/directory" variant="ghost" size="sm" className="hidden md:inline-flex">
              Hitta kompetens
            </LinkButton>
            <LinkButton href="/login" variant="primary" size="sm">
              Logga in
            </LinkButton>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-[var(--surface)]">{children}</main>

      <footer className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--muted)]">
          <div>© {new Date().getFullYear()} ARBETSpoolen · Sverige</div>
          <div>Byggd med Next.js · Supabase · Stripe</div>
        </div>
      </footer>
    </div>
  );
}
