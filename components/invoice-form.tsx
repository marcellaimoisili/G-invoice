"use client"

import { useState } from "react"
import { Loader2, ChevronLeft, FileText, ArrowUpRight, CalendarDays, Phone, Mail } from "lucide-react"
import { extractListingId } from "@/lib/garage"

/**
 * Source classes extracted verbatim from shopgarage.com/listing/...
 *
 * Input wrapper (from the freight calculator dialog):
 *   "flex items-center border border-neutral-200 rounded-lg bg-white
 *    h-12 w-full hover:border-neutral-300 focus-within:border-neutral-300
 *    focus-within:ring-2 focus-within:ring-neutral-100 transition-colors"
 *
 * Input inner element:
 *   placeholder:text-neutral-400 text-base/normal font-normal
 *   text-neutral-900 w-full h-full px-3 bg-transparent outline-none
 *
 * Label above input:
 *   "text-sm text-neutral-500 mb-1.5 block"
 *
 * Button (verbatim from source, HTML-entity decoded):
 *   "transition-hoseflow border whitespace-nowrap touch-manipulation
 *    flex items-center justify-center select-none
 *    [&>svg]:size-[18px] [&>svg]:pointer-events-none
 *    disabled:opacity-50 disabled:pointer-events-none
 *    text-white bg-orange-500 border-orange-500
 *    hover:bg-orange-600 hover:border-orange-600
 *    [&>svg]:stroke-white active:scale-[0.99] cursor-pointer
 *    h-12 px-6 font-medium text-base/normal rounded-lg w-full
 *    [&>svg]:stroke-2"
 */

type Screen = "form" | "result"

export function InvoiceForm() {
  const [screen, setScreen] = useState<Screen>("form")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: string } | null>(null)

  function handleBack() {
    setScreen("form")
    setError(null)
    setResult(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    // Hard prefix check — any URL that doesn't start with this goes straight to failed screen
    if (!url.trim().startsWith("https://www.shopgarage.com/listing/")) {
      setError("invalid_url")
      setScreen("result")
      return
    }

    const listingId = extractListingId(url)
    if (!listingId) {
      setError("invalid_url")
      setScreen("result")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/invoice?id=${listingId}`)
      if (!res.ok) throw new Error("api_error")

      // TODO: when the route returns a real PDF blob, replace the lines below:
      //   const blob = await res.blob()
      //   const href = URL.createObjectURL(blob)
      //   Object.assign(document.createElement("a"), {
      //     href,
      //     download: `garage-${listingId}.pdf`,
      //   }).click()
      //   URL.revokeObjectURL(href)

      setResult({ id: listingId })
      setScreen("result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setScreen("result")
    } finally {
      setLoading(false)
    }
  }

  // ── Screen 1: Form ────────────────────────────────────────────────
  if (screen === "form") {
    return (
      <>
        {/* Card header — Screen 1 */}
        <div className="border-b border-neutral-200 px-4 py-5 sm:px-6">
          <p className="text-center text-xl font-medium text-foreground">
            Instant invoice
          </p>
        </div>

        {/* Card body */}
        <form onSubmit={handleSubmit} className="px-4 py-6 sm:px-6">
          {/* Label */}
          <label className="mb-1.5 block text-sm text-neutral-500">
            Garage listing URL
          </label>

          {/* Input wrapper — matches Garage's freight calculator input chrome */}
          <div
            className={[
              "flex h-12 w-full items-center rounded-lg border bg-white transition-colors",
              error
                ? "border-red-400 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                : "border-neutral-200 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:ring-2 focus-within:ring-neutral-100",
            ].join(" ")}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              placeholder="https://www.shopgarage.com/listing/..."
              className="h-full w-full bg-transparent px-3 text-base/normal font-normal text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>

          {/* Inline validation error */}
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}

          {/* ── Button — verbatim from Garage source HTML (HTML entities decoded) ── */}
          <button
            type="submit"
            tabIndex={0}
            disabled={loading || !url.trim()}
            className="mt-4 border whitespace-nowrap touch-manipulation flex items-center justify-center select-none [&>svg]:size-[18px] [&>svg]:pointer-events-none disabled:opacity-50 disabled:pointer-events-none text-white bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600 [&>svg]:stroke-white active:scale-[0.99] cursor-pointer h-12 px-6 font-medium text-base/normal rounded-lg w-full [&>svg]:stroke-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Generating&hellip;
              </>
            ) : (
              "Get PDF invoice"
            )}
          </button>
        </form>
      </>
    )
  }

  // ── Screen 2: Result ──────────────────────────────────────────────
  return (
    <>
      {/* Card header — Screen 2: back arrow + centered title */}
      <div className="relative flex items-center border-b border-neutral-200 px-4 py-5 sm:px-6">
        <button
          type="button"
          onClick={handleBack}
          className="absolute left-4 flex items-center justify-center text-neutral-900 hover:text-neutral-600 transition-colors sm:left-6"
          aria-label="Back"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <p className="w-full text-center text-xl font-medium text-foreground">
          {result ? "Invoice generated" : "Invoice failed"}
        </p>
      </div>

      {/* Card body */}
      <div className="flex flex-col items-center px-4 py-10 sm:px-6">
        {/* Icon */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 text-neutral-400">
          <FileText size={26} strokeWidth={1.5} />
        </div>

        {result ? (
          <>
            {/* Success */}
            <p className="mb-1 text-center text-sm text-emerald-600">
              Invoice generated successfully!
            </p>

            {/* Action buttons */}
            <div className="mt-6 flex w-full gap-2">
              {/* TODO: wire onClick to trigger the PDF blob download */}
              <button
                type="button"
                className="flex h-12 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.99] transition-colors cursor-pointer"
              >
                Download
              </button>

              {/* TODO: wire onClick to open email input / call email API */}
              <button
                type="button"
                className="flex h-12 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.99] transition-colors cursor-pointer"
              >
                Email
              </button>
            </div>
          </>
        ) : (
          /* Error */
          <>
            <p className="mb-6 text-center text-sm text-red-500">
              {error === "invalid_url"
                ? "That doesn't look like a valid Garage listing URL."
                : "Invoice generation failed, please try again later."}
            </p>

            {/* Support rows — styled after Garage's contact card */}
            <div className="w-full divide-y divide-neutral-200 rounded-lg border border-neutral-200 overflow-hidden">
              {[
                {
                  label: "Help center",
                  href: "https://support.shopgarage.com",
                  icon: <ArrowUpRight size={16} strokeWidth={1.5} />,
                },
                {
                  label: "Book a call",
                  href: "https://calendly.com/shopgarage",
                  icon: <CalendarDays size={16} strokeWidth={1.5} />,
                },
                {
                  label: "(201) 293-7164",
                  href: "tel:2012937164",
                  icon: <Phone size={16} strokeWidth={1.5} />,
                },
                {
                  label: "support@shopgarage.com",
                  href: "mailto:support@shopgarage.com",
                  icon: <Mail size={16} strokeWidth={1.5} />,
                },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
                >
                  <span>{label}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500">
                    {icon}
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
