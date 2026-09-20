export function pick(source, ...keys) {
  if (!source) return undefined
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key]
  }
  return undefined
}

export function safeParseArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== "string") return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [value]
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

export function normalizeLanguagesTeach(raw) {
  return safeParseArray(raw).map((item) => {
    if (item && typeof item === "object") {
      const years = Number(item.yearsExperience)
      return {
        language: item.language || "",
        level: item.level || "",
        yearsExperience: Number.isFinite(years)
          ? Math.max(0, Math.min(50, Math.trunc(years)))
          : 0,
      }
    }
    return { language: String(item), level: "", yearsExperience: 0 }
  })
}

export function fileNameFromUrl(url) {
  if (!url || typeof url !== "string") return ""
  try {
    const clean = url.split("?")[0]
    return decodeURIComponent(clean.substring(clean.lastIndexOf("/") + 1)) || ""
  } catch {
    return ""
  }
}

export function maskAccountNumber(accountNumber) {
  const value = String(accountNumber || "")
  if (!value) return ""
  if (value.length <= 4) return value
  return `•••• ${value.slice(-4)}`
}

export function formatUtcDate(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${day}/${month}/${date.getUTCFullYear()}`
}

export function formatBytes(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return ""
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function requestStatus(request) {
  const raw = pick(request, "status", "Status")
  if (typeof raw === "number") {
    return (
      { 0: "Pending", 1: "Approved", 2: "Rejected", 3: "Cancelled" }[raw] ||
      "Pending"
    )
  }
  const normalized = String(raw || "")
    .trim()
    .toLowerCase()
  if (normalized === "approved") return "Approved"
  if (normalized === "rejected") return "Rejected"
  if (normalized === "cancelled" || normalized === "canceled")
    return "Cancelled"
  return "Pending"
}
