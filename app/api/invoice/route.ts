import { NextRequest, NextResponse } from "next/server"
import { fetchListing, fetchMe, UUID_REGEX } from "@/lib/garage"
import { renderInvoicePdf } from "@/components/invoice-pdf"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("id")

  if (!listingId || !UUID_REGEX.test(listingId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 })
  }

  try {
    const token = process.env.UPSTREAM_BEARER_TOKEN
    const [listing, user] = await Promise.all([
      fetchListing(listingId),
      token ? fetchMe(token) : Promise.resolve(null),
    ])
    const pdf = await renderInvoicePdf(listing, user)

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="garage-invoice-${listing.secondaryId}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown_error"
    const status =
      reason === "not_found" ? 404 : reason === "invalid_id" ? 400 : 502
    return NextResponse.json({ error: reason }, { status })
  }
}
