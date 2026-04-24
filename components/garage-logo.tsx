/**
* Garage wordmark logo — renders the official orange SVG wordmark.
 */
export function GarageLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/garage-logo.svg"
      alt="Garage logo"
      className="h-[22px] lg:h-6 shrink-0"
    />
  )
}
