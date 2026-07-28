export const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || "https://api.catspeak.com.vn";

export const getImageUrl = (url, fallback) => {
  if (!url) return fallback || undefined;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return `${IMAGE_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
