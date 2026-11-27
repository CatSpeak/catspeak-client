import { resolveProtectedMediaFetchUrl } from "./authenticatedMedia"

export const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || "https://api.catspeak.com.vn";

export const getImageUrl = (url, fallback) => {
  if (!url) return fallback || undefined;
  // CS-07: Post media is served by the Social API gateway; resolve the
  // relative `/api/Post/...` path instead of letting it 404 on the web origin.
  if (url.toLowerCase().startsWith("/api/post/")) {
    return resolveProtectedMediaFetchUrl(url);
  }
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/api/") ||
    url.startsWith("/media/")
  ) {
    return url;
  }
  return `${IMAGE_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
