/**
 * Shared helpers for rendering an event's location on every detail surface.
 * A location value is either an http(s) URL (open in a new tab) or a plain
 * address (open on Google Maps / focus the map).
 */

/** True when the value is a URL or a Google Maps link without a scheme. */
export function isUrl(value) {
  const v = (value || "").trim();
  if (!v) return false;
  if (/^https?:\/\//i.test(v)) return true;
  if (/^www\./i.test(v)) return true;
  if (/maps\.app\.goo\.gl/i.test(v)) return true;
  if (/google\.com\/maps/i.test(v)) return true;
  return false;
}

/** Prefix a scheme-less value so window.open receives a valid URL. */
export function normalizeUrl(value) {
  const v = (value || "").trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** Google Maps search URL for a plain-text address. */
export function googleMapsSearchUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    (address || "").trim(),
  )}`;
}

/** Open a URL in a new tab. */
export function openInNewTab(url) {
  const target = normalizeUrl(url);
  if (!target) return;
  window.open(target, "_blank", "noopener,noreferrer");
}

/**
 * Compose the best address query from an event-like object,
 * mirroring how MapView geocodes markers.
 */
export function buildAddressQuery(ev) {
  if (!ev) return "";
  const parts = [];
  const base = (ev.location || ev.address || "").trim();
  if (base) parts.push(base);
  if (ev.cityName && ev.cityName.trim()) parts.push(ev.cityName.trim());
  if (ev.countryName && ev.countryName.trim()) parts.push(ev.countryName.trim());
  return parts.join(", ");
}

/**
 * Resolve where a location link should point when there is no map to focus:
 * URL → itself, plain address → Google Maps search.
 */
export function getAddressHref(ev) {
  if (!ev) return "";
  const location = (ev.location || "").trim();
  if (isUrl(location)) return normalizeUrl(location);
  return googleMapsSearchUrl(buildAddressQuery(ev));
}
