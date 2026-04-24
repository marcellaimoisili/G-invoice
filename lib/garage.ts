const GARAGE_API_BASE = "https://garage-backend.onrender.com"
const GARAGE_HOSTNAMES = new Set(["www.shopgarage.com", "shopgarage.com"])

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const UUID_AT_END = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

export function extractListingId(input: string): string | null {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(input.trim())
  } catch {
    return null
  }

  if (parsedUrl.protocol !== "https:") return null
  if (!GARAGE_HOSTNAMES.has(parsedUrl.hostname)) return null

  const pathAfterListing = parsedUrl.pathname.split("/listing/")[1]
  if (!pathAfterListing) return null

  const match = pathAfterListing.match(UUID_AT_END)
  return match ? match[1] : null
}

export type Listing = {
  id: string
  secondaryId: number
  title: string
  description: string
  sellingPrice: number
  appraisedPrice: number | null
  brand: string | null
  year: number | null
  state: string | null
  category: string | null
  images: string[]
}

type GarageListingResponse = {
  id: string
  secondaryId: number
  listingTitle: string
  listingDescription: string
  sellingPrice: number
  appraisedPrice: number | null
  itemBrand: string | null
  itemAge: number | null
  address?: { state?: string | null } | null
  category?: { name?: string | null } | null
  listingImages?: { order: number; url: string }[]
}

export async function fetchListing(id: string): Promise<Listing> {
  if (!UUID_REGEX.test(id)) throw new Error("invalid_id")

  const response = await fetch(`${GARAGE_API_BASE}/listings/${id}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  })

  if (response.status === 404) throw new Error("not_found")
  if (!response.ok) throw new Error("upstream_error")

  const raw = (await response.json()) as GarageListingResponse

  const images = (raw.listingImages ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((image) => image.url)

  return {
    id: raw.id,
    secondaryId: raw.secondaryId,
    title: raw.listingTitle,
    description: raw.listingDescription,
    sellingPrice: raw.sellingPrice,
    appraisedPrice: raw.appraisedPrice ?? null,
    brand: raw.itemBrand ?? null,
    year: raw.itemAge ?? null,
    state: raw.address?.state ?? null,
    category: raw.category?.name ?? null,
    images,
  }
}
