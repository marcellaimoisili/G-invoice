import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { fetchListing, fetchMe, UUID_REGEX } from "@/lib/garage"
import { renderInvoicePdf } from "@/components/invoice-pdf"

export const runtime = "nodejs"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: { id?: string; to?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }

  const listingId = body.id
  const overrideTo = body.to?.trim() || null

  if (!listingId || !UUID_REGEX.test(listingId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 })
  }
  if (overrideTo !== null && !EMAIL_REGEX.test(overrideTo)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev"
  const token = process.env.UPSTREAM_BEARER_TOKEN

  if (!apiKey) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 500 })
  }

  try {
    const [listing, user] = await Promise.all([
      fetchListing(listingId),
      token ? fetchMe(token) : Promise.resolve(null),
    ])

    const recipient = overrideTo ?? user?.email ?? null

    if (!recipient) {
      return NextResponse.json({ error: "no_email" }, { status: 400 })
    }

    const pdf = await renderInvoicePdf(listing, user)

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to: recipient,
      subject: `Garage invoice #${listing.secondaryId} — ${listing.title}`,
      html: `
        <p>Hi${user?.firstName ? ` ${user.firstName}` : ""},</p>
        <p>Your invoice for <strong>${listing.title}</strong> is attached.</p>
        <p>Total: $${listing.sellingPrice.toLocaleString("en-US")} USD</p>
        <p>— Garage Instant Invoice</p>
      `,
      attachments: [
        {
          filename: `garage-invoice-${listing.secondaryId}.pdf`,
          content: pdf,
        },
      ],
    })

    if (error) {
      return NextResponse.json(
        { error: "send_failed", detail: error.message },
        { status: 502 }
      )
    }

    return NextResponse.json({ to: recipient }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown_error"
    const status =
      reason === "not_found" ? 404 : reason === "invalid_id" ? 400 : 502
    return NextResponse.json({ error: reason }, { status })
  }
}
