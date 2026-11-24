export const DANGEROUS_UPLOAD_EXTENSIONS = new Set([
  "svg",
  "svgz",
  "html",
  "htm",
  "xhtml",
  "js",
  "mjs",
  "cjs",
  "jsx",
  "ts",
  "tsx",
  "exe",
  "msi",
  "bat",
  "cmd",
  "ps1",
  "sh",
  "com",
  "scr",
  "pif",
  "vbs",
])

export const SAFE_RASTER_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"]
export const SAFE_RASTER_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
])

export const DEFAULT_ASSIGNMENT_ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "zip",
  "png",
  "jpg",
  "jpeg",
  "webp",
]

export function getNormalizedExtension(fileName) {
  if (typeof fileName !== "string") return ""
  const idx = fileName.lastIndexOf(".")
  if (idx === -1 || idx === fileName.length - 1) return ""
  return fileName.slice(idx + 1).trim().toLowerCase()
}

/**
 * Validate a File against disallowed active types (SVG/HTML/executables),
 * allowed extensions, optional MIME allowlist, and maximum size in bytes.
 *
 * @param {File} file
 * @param {object} [options]
 * @returns {{ valid: boolean, reason?: "empty"|"size"|"type", extension?: string }}
 */
export function validateUploadFile(
  file,
  {
    allowedExtensions = null,
    allowedMimeTypes = null,
    maxBytes = null,
    allowEmpty = false,
  } = {},
) {
  if (!file || typeof file.name !== "string") {
    return { valid: false, reason: "type" }
  }

  const size = Number(file.size)
  if (!Number.isFinite(size) || (!allowEmpty && size <= 0)) {
    return { valid: false, reason: "empty" }
  }
  if (maxBytes && size > maxBytes) {
    return { valid: false, reason: "size" }
  }

  const ext = getNormalizedExtension(file.name)
  if (!ext || DANGEROUS_UPLOAD_EXTENSIONS.has(ext)) {
    return { valid: false, reason: "type", extension: ext }
  }

  if (Array.isArray(allowedExtensions) && allowedExtensions.length > 0) {
    const normalizedAllowed = new Set(
      allowedExtensions.map((item) => String(item).replace(/^\./, "").trim().toLowerCase()),
    )
    if (!normalizedAllowed.has(ext)) {
      return { valid: false, reason: "type", extension: ext }
    }
  }

  if (allowedMimeTypes && file.type) {
    const mime = file.type.toLowerCase()
    const allowedSet =
      allowedMimeTypes instanceof Set ? allowedMimeTypes : new Set(allowedMimeTypes)
    if (!allowedSet.has(mime)) {
      return { valid: false, reason: "type", extension: ext }
    }
  }

  return { valid: true, extension: ext }
}
