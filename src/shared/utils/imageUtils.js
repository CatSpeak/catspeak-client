export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "https://api.catspeak.com.vn"

export const getImageUrl = (url, fallback) => {
  if (!url) return fallback || undefined
  if (url.startsWith("http")) return url
  return `${IMAGE_BASE_URL}${url}`
}
