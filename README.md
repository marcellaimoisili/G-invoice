# G-invoice

A small Next.js app that turns a marketplace listing URL into a styled PDF invoice — downloadable or delivered by email.

Paste a listing URL, click **Get PDF invoice**, then choose **Download** (saves a PDF locally) or **Email** (sends the PDF as an attachment via Resend). The "Bill To" block auto-populates from the signed-in user when an upstream profile token is configured, and falls back to an inline email input when it isn't.

## Features

- One-page Letter-size PDF: logo, itemized pricing, description, 4-up photo grid, reference footer
- Auto-populated **Bill To** when an upstream profile token is available; otherwise blank fallback "fill-in" line
- Email delivery with PDF attached (via Resend). Inline email input appears on the fallback path — no `window.prompt`, no hard error
- Defense-in-depth validation: client rejects malformed URLs before fetching; server re-validates the UUID before hitting upstream
- Appraised value only appears on the invoice when it beats the selling price
## Running locally

```bash
pnpm install
pnpm dev
```

Runs at `http://localhost:3000`.



## Architecture

- **`lib/garage.ts`** — domain layer. URL → UUID parser (`extractListingId`), listing fetcher (`fetchListing`), profile fetcher (`fetchMe`), plus trimmed `Listing` and `UserProfile` types. Single source of truth for anything that talks to upstream.
- **`components/invoice-pdf.tsx`** — `@react-pdf/renderer` document + `renderInvoicePdf()` helper returning a `Buffer`. Logo rendered via inline `<Svg>` + `<Path>` (no raster fallback needed).
- **`app/api/invoice/route.ts`** — `GET /api/invoice?id=<uuid>`. Fetches listing + profile in parallel, renders the PDF, streams back as `application/pdf`.
- **`app/api/invoice/email/route.ts`** — `POST /api/invoice/email` with body `{ id, to? }`. Same enrichment; sends via Resend with the PDF as an attachment. Accepts an optional recipient override for the fallback flow.
- **`components/invoice-form.tsx`** — single-card UI. Form screen → result screen with Download + Email actions. Email button has four states (`idle` / `sending` / `sent` / `error`) plus a `needs_email` state that surfaces an inline email input when upstream doesn't return one.

### Validation — defense in depth

The client (`extractListingId`) rejects malformed URLs before a fetch. The server re-validates the UUID shape before any upstream call. Client-side check is UX; server-side check is security.

## What I'd add with more time

- **Seller address lookup.** Each listing carries an `addressId`. Hitting the matching `/addresses/:id` endpoint (or the equivalent) would give a full street address so "Ship From" shows more than just state.
- **Cleaner auth model.** Current wiring is the simplest for demo purposes: a single bearer token in env — fast demo of what a logged in user would see, but couples every invoice to that user (until the token expires, at which point email would not be prefilled and the fallback invoice text for user "BILL TO" section is an empty fill-in line with "Recipient to complete").
- **Rate limiting + retry.** Upstream API lives on a free-tier host — a 429 or cold-start 502 is plausible. Vercel rate-limit middleware plus exponential-backoff retry on 5xx is the right hardening.
- **Tests.** `extractListingId` has enough edge cases (trailing slash, uppercase UUIDs, query strings, non-https, other hostnames) to deserve a Vitest table. Route tests would mock the upstream fetch and Resend.
- **PDF accessibility/render.** Some description responses have weird chars, I'd properly scrub these. Tag structure (`<Document>` metadata, logical reading order) is missing — optimized for visual output today.
- **Templated email body.** The HTML body is inline in the route handler. Extracting to a tiny template file would make copy tweaks a non-code change.
- **Long-description overflow handling.** PDF layout currently assumes descriptions fit in the remaining vertical space on the one page. Very long descriptions could push the price table onto a second page. Might want to truncate at a safe character cap with a "see full listing" link note, or something.

## Time budget

~3 hours getting data (fetch/routing logic) to PDF working → visual polish matching the source site → email button and graceful error flows.
