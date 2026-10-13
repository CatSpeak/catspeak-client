import { getAddressHref, isUrl, normalizeUrl } from "@/shared/utils/locationLink"
import { useMapFocus } from "../context/MapFocusContext"

/**
 * Renders an event location that behaves consistently across detail surfaces:
 * a URL opens in a new tab, a plain address on a map screen focuses the map,
 * and elsewhere opens Google Maps.
 */
const LocationLink = ({ ev, className = "", children }) => {
  const { hasMap, focusEventOnMap } = useMapFocus()
  const locationStr = ev?.location?.trim() || ""

  if (isUrl(locationStr)) {
    return (
      <a
        href={normalizeUrl(locationStr)}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    )
  }

  if (hasMap) {
    return (
      <button
        type="button"
        onClick={() => focusEventOnMap(ev)}
        className={className}
      >
        {children}
      </button>
    )
  }

  return (
    <a
      href={getAddressHref(ev)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  )
}

export default LocationLink
