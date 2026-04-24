import {
  Document,
  Page,
  View,
  Text,
  Image,
  Svg,
  Path,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"
import type { Listing, UserProfile } from "@/lib/garage"

const GARAGE_ORANGE = "#F97315"
const INK = "#0a0a0a"
const MUTED = "#737373"
const HAIRLINE = "#e5e5e5"

const LOGO_PATHS = [
  "M47.1968 187C34.531 187 24.6983 184.5 17.6988 179.5C10.6993 174.5 5.86627 167.583 3.19978 158.75C0.533297 149.75 -0.466635 139.333 0.199987 127.5C1.03326 115.667 2.86647 102.917 5.69962 89.25C11.8659 60.25 20.3653 38.1667 31.1979 23C42.1972 7.66667 57.1961 0 76.1949 0C95.8602 0 109.109 5.75 115.942 17.25C122.942 28.75 124.775 45.9167 121.442 68.75H79.9446C81.4445 58.4167 81.7778 50.9167 80.9445 46.25C80.1113 41.5833 77.5281 39.25 73.1951 39.25C68.1954 39.25 63.9457 43.5833 60.4459 52.25C57.1128 60.75 53.5297 74.1667 49.6967 92.5C47.6968 102.333 46.0302 111.5 44.697 120C43.3637 128.333 43.1138 135.083 43.947 140.25C44.947 145.417 47.7801 148 52.4465 148C55.9462 148 58.946 146.25 61.4459 142.75C64.1124 139.25 66.3622 133.167 68.1954 124.5L69.1953 118.75H57.1962L64.1957 85.25L118.442 85.5L109.443 127.5C106.609 141.667 102.11 153.167 95.9435 162C89.7773 170.667 82.5278 177 74.195 181C65.8622 185 56.8628 187 47.1968 187Z",
  "M102.554 184.75L168.05 2.5H230.046L220.546 184.75H177.299L180.049 154.75H155.301L145.802 184.75H102.554ZM166.3 119.75H183.049L187.799 79L191.548 44H189.799L179.049 78.5L166.3 119.75Z",
  "M229.854 184.75L267.852 2.5H317.349C335.014 2.5 347.513 6.5 354.846 14.5C362.179 22.3333 365.679 32.6667 365.345 45.5C364.845 58.1667 361.762 69.4167 356.096 79.25C350.43 89.0833 343.013 95.6667 333.847 99L333.597 100.75C340.43 103.25 344.43 107.5 345.597 113.5C346.763 119.5 346.263 127.417 344.097 137.25L338.097 166.5C337.431 169.833 336.931 173.333 336.597 177C336.264 180.5 336.014 183.083 335.847 184.75H291.1C290.934 182.417 290.934 179.917 291.1 177.25C291.267 174.417 291.684 171.667 292.35 169L298.1 142C299.1 137 299.516 132.583 299.35 128.75C299.183 124.75 297.1 122.75 293.1 122.75H287.101L274.351 184.75H229.854ZM294.6 87.75H299.6C304.933 87.75 309.349 84.75 312.849 78.75C316.515 72.75 318.515 64.8333 318.848 55C319.015 50 318.015 46.5833 315.849 44.75C313.682 42.75 310.682 41.75 306.849 41.75H304.099L294.6 87.75Z",
  "M343.993 184.75L409.489 2.5H471.485L461.985 184.75H418.738L421.488 154.75H396.74L387.24 184.75H343.993ZM407.739 119.75H424.488L429.237 79L432.987 44H431.237L420.488 78.5L407.739 119.75Z",
  "M523.483 187C510.817 187 500.985 184.5 493.985 179.5C486.986 174.5 482.153 167.583 479.486 158.75C476.82 149.75 475.82 139.333 476.486 127.5C477.32 115.667 479.153 102.917 481.986 89.25C488.152 60.25 496.652 38.1667 507.484 23C518.483 7.66667 533.482 0 552.481 0C572.146 0 585.396 5.75 592.228 17.25C599.228 28.75 601.061 45.9167 597.728 68.75H556.231C557.731 58.4167 558.064 50.9167 557.231 46.25C556.398 41.5833 553.814 39.25 549.481 39.25C544.482 39.25 540.232 43.5833 536.732 52.25C533.399 60.75 529.816 74.1667 525.983 92.5C523.983 102.333 522.317 111.5 520.983 120C519.65 128.333 519.4 135.083 520.233 140.25C521.233 145.417 524.066 148 528.733 148C532.233 148 535.232 146.25 537.732 142.75C540.399 139.25 542.648 133.167 544.482 124.5L545.482 118.75H533.482L540.482 85.25L594.728 85.5L585.729 127.5C582.896 141.667 578.396 153.167 572.23 162C566.064 170.667 558.814 177 550.481 181C542.148 185 533.149 187 523.483 187Z",
  "M587.008 184.75L625.006 2.5H707L699.251 41.75H660.253L653.754 73.5H688.751L681.002 110H646.254L638.755 145.5H677.252L669.253 184.75H587.008Z",
]

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 36,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: INK,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  brandSub: {
    fontSize: 7,
    color: MUTED,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  invoiceMeta: { alignItems: "flex-end" },
  invoiceLabel: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 1.5,
  },
  invoiceNumber: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
    color: INK,
  },
  invoiceDate: { fontSize: 8, color: MUTED, marginTop: 2 },
  accentBar: {
    height: 1.5,
    backgroundColor: GARAGE_ORANGE,
    marginBottom: 12,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
    marginVertical: 10,
  },
  addressRow: { flexDirection: "row", marginBottom: 4 },
  addressBlock: { flex: 1, paddingRight: 14 },
  sectionLabel: {
    fontSize: 7,
    color: MUTED,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  addressLine: { fontSize: 9, lineHeight: 1.45 },
  hint: { fontSize: 7, color: "#a3a3a3", marginTop: 2 },
  itemTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  itemMeta: { fontSize: 8, color: MUTED, marginBottom: 8 },
  thumbRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 10,
  },
  thumb: {
    width: 122,
    height: 122,
    objectFit: "cover",
  },
  descriptionLine: { fontSize: 9, lineHeight: 1.35 },
  priceTable: { alignSelf: "flex-end", width: 220, marginTop: 8 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  priceLabel: { fontSize: 9, color: "#525252" },
  priceValue: { fontSize: 9 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.5,
    borderTopColor: GARAGE_ORANGE,
    marginTop: 4,
    paddingTop: 6,
  },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK },
  totalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: GARAGE_ORANGE,
  },
  appraisedNote: {
    alignSelf: "flex-end",
    width: 220,
    marginTop: 4,
    fontSize: 7,
    color: MUTED,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 20,
    fontSize: 7,
    color: "#a3a3a3",
    textAlign: "center",
  },
})

export function InvoiceDocument({
  listing,
  user,
}: {
  listing: Listing
  user?: UserProfile | null
}) {
  const showAppraisedNote =
    listing.appraisedPrice !== null &&
    listing.appraisedPrice !== listing.sellingPrice

  const descriptionLines = listing.description
    .split("\n")
    .map((line) => line.replace(/\\$/, "").trim())

  const itemMetaParts = [listing.category, listing.brand, listing.year]
    .filter((part) => part !== null && part !== undefined && part !== "")
    .join("  •  ")

  const billToName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : ""

  return (
    <Document title={`Garage Invoice #${listing.secondaryId}`} author="Garage">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Svg width={82} height={22} viewBox="0 0 707 187">
              {LOGO_PATHS.map((d, i) => (
                <Path key={i} d={d} fill={GARAGE_ORANGE} />
              ))}
            </Svg>
            <Text style={styles.brandSub}>shopgarage.com</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{listing.secondaryId}</Text>
            <Text style={styles.invoiceDate}>{formatDate(new Date())}</Text>
          </View>
        </View>

        <View style={styles.accentBar} />

        <View style={styles.addressRow}>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionLabel}>BILL FROM</Text>
            <Text style={styles.addressLine}>Garage, Inc.</Text>
            <Text style={styles.addressLine}>support@shopgarage.com</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionLabel}>SHIP FROM</Text>
            <Text style={styles.addressLine}>{listing.state ?? "—"}</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionLabel}>BILL TO</Text>
            {user && billToName ? (
              <>
                <Text style={styles.addressLine}>{billToName}</Text>
                {user.entity ? (
                  <Text style={styles.addressLine}>{user.entity}</Text>
                ) : null}
                {user.email ? (
                  <Text style={styles.addressLine}>{user.email}</Text>
                ) : null}
                {user.addressState ? (
                  <Text style={styles.addressLine}>{user.addressState}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.addressLine}>______________________</Text>
                <Text style={styles.hint}>Recipient to complete</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>ITEM</Text>
        <Text style={styles.itemTitle}>{listing.title}</Text>
        {itemMetaParts.length > 0 ? (
          <Text style={styles.itemMeta}>{itemMetaParts}</Text>
        ) : null}

        {listing.images.length > 0 ? (
          <View style={styles.thumbRow}>
            {listing.images.slice(0, 4).map((url) => (
              <Image key={url} src={url} style={styles.thumb} />
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>DESCRIPTION</Text>
        <View style={{ marginBottom: 8 }}>
          {descriptionLines.map((line, index) => (
            <Text key={index} style={styles.descriptionLine}>
              {line.length > 0 ? line : " "}
            </Text>
          ))}
        </View>

        <View style={styles.priceTable}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Vehicle subtotal</Text>
            <Text style={styles.priceValue}>
              {formatUSD(listing.sellingPrice)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total (USD)</Text>
            <Text style={styles.totalValue}>
              {formatUSD(listing.sellingPrice)}
            </Text>
          </View>
        </View>

        {showAppraisedNote ? (
          <Text style={styles.appraisedNote}>
            Appraised value: {formatUSD(listing.appraisedPrice!)}
          </Text>
        ) : null}

        <Text style={styles.footer}>
          Reference: {listing.id}  ·  This document is a price quote, not a binding contract.
        </Text>
      </Page>
    </Document>
  )
}

export async function renderInvoicePdf(
  listing: Listing,
  user?: UserProfile | null
): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument listing={listing} user={user} />)
}
