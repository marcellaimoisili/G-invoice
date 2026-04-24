import { GarageLogo } from "@/components/garage-logo"
import { InvoiceForm } from "@/components/invoice-form"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center bg-background">
      {/* ── Header bar ──────────────────────────────── */}
      <header className="flex w-full items-center border-b border-neutral-200 bg-card px-6 py-4">
        <GarageLogo />
      </header>

      {/* ── Centered form card ──────────────────────── */}
      <main className="flex flex-1 w-full items-start justify-center px-4 pt-16 sm:pt-24">
        <div className="w-full max-w-lg overflow-hidden rounded-lg bg-card shadow-lg ring-1 ring-neutral-950/10">
          <InvoiceForm />
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="w-full py-8 text-center text-xs font-light text-neutral-400">
        <p>&copy; {new Date().getFullYear()} Garage</p>
      </footer>
    </div>
  )
}
