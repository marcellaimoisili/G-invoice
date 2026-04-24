import { NextRequest, NextResponse } from "next/server"

/**
 * ────────────────────────────────────────────────────────────
 *  GET /api/invoice?id=<listing-uuid>
 *
 *  This route should:
 *
 *  1. Accept a listing UUID via the `id` query parameter.
 *
 *  2. Fetch the listing data from Garage's API.
 *     - The take-home hints that their API accepts a field
 *       called `id` which is the UUID found after /listing
 *       in any listing URL.
 *     - You'll need to discover the exact endpoint. Check
 *       the network tab on shopgarage.com to find the
 *       listing detail API route.
 *
 *  3. Extract relevant fields for the invoice:
 *     - Title / vehicle name
 *     - Description
 *     - Price
 *     - Specs (mileage, engine, year, etc.)
 *     - Images (optional, for a richer invoice)
 *
 *  4. Generate a PDF invoice programmatically.
 *     Recommended libraries:
 *       - @react-pdf/renderer  (React-based, great for Next.js)
 *       - jspdf                (lightweight, runs on server/client)
 *       - puppeteer / playwright (render HTML to PDF server-side)
 *       - pdfkit               (Node.js streaming PDF generation)
 *
 *  5. Return the PDF as a downloadable response with the
 *     correct Content-Type and Content-Disposition headers.
 *
 * ────────────────────────────────────────────────────────────
 */

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const listingId = searchParams.get("id")

  // ── Validate the listing ID ──────────────────────────────
  if (!listingId) {
    return NextResponse.json(
      { error: "Missing required query parameter: id" },
      { status: 400 }
    )
  }

  // ── Step 1: Fetch listing data from Garage's API ─────────
  // TODO: Replace this placeholder with a real fetch call.
  //
  // Example (you'll need to confirm the actual endpoint):
  //
  //   const garageRes = await fetch(
  //     `https://www.shopgarage.com/api/listing?id=${listingId}`,
  //     { headers: { "Content-Type": "application/json" } }
  //   )
  //
  //   if (!garageRes.ok) {
  //     return NextResponse.json(
  //       { error: "Failed to fetch listing from Garage" },
  //       { status: garageRes.status }
  //     )
  //   }
  //
  //   const listing = await garageRes.json()

  // ── Step 2: Generate the PDF ─────────────────────────────
  // TODO: Use your preferred PDF library to create the invoice.
  //
  // The invoice should include at minimum:
  //   - Garage branding / logo
  //   - Invoice date
  //   - Vehicle title
  //   - Vehicle description
  //   - Price (formatted as currency)
  //   - Key specs table
  //   - Optional: vehicle image(s)
  //
  // Example with @react-pdf/renderer (server-side):
  //
  //   import { renderToBuffer } from "@react-pdf/renderer"
  //   import { InvoiceDocument } from "@/components/invoice-pdf"
  //
  //   const pdfBuffer = await renderToBuffer(
  //     <InvoiceDocument listing={listing} />
  //   )

  // ── Step 3: Return the PDF as a download ─────────────────
  // TODO: Uncomment and update once PDF generation is wired up.
  //
  //   return new NextResponse(pdfBuffer, {
  //     status: 200,
  //     headers: {
  //       "Content-Type": "application/pdf",
  //       "Content-Disposition": `attachment; filename="garage-invoice-${listingId}.pdf"`,
  //     },
  //   })

  // ── MOCK PATHS ───────────────────────────────────────────────────────────────
  // Uncomment ONE of the blocks below to test each UI state while you implement.
  //
  // ── Mock success (replace with real PDF response once Step 3 is wired up) ──
  return NextResponse.json({ listingId }, { status: 200 })
  //
  // ── Mock failure (uncomment to test the failed screen + support contact rows)
  // return NextResponse.json(
  //   { error: "Mock failure — replace with real implementation." },
  //   { status: 500 }
  // )
  // ─────────────────────────────────────────────────────────────────────────────
}
