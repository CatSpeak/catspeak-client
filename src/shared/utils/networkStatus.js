/**
 * true khi trình duyệt báo mất mạng. Lỗi request lúc này là do đường truyền của
 * người học, không phải máy chủ không khả dụng.
 */
export const isBrowserOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false
