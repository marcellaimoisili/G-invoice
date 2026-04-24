import Image from "next/image"

/**
 * Garage wordmark logo — renders the official orange SVG wordmark.
 */
export function GarageLogo() {
  return (
    <Image
      src="/garage-logo.svg"
      alt="Garage"
      width={120}
      height={32}
      priority
    />
  )
}
