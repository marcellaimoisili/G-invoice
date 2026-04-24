import { NextRequest, NextResponse } from "next/server"
import { fetchListing, UUID_REGEX } from "@/lib/garage"

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("id")

  if (!listingId || !UUID_REGEX.test(listingId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 })
  }

  try {
    const listing = await fetchListing(listingId)
    return NextResponse.json(listing, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown_error"
    const status = reason === "not_found" ? 404 : 502
    return NextResponse.json({ error: reason }, { status })
  }
}
