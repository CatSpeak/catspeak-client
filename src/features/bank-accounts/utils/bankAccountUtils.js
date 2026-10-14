/**
 * Formats account number into clean space-separated 4-digit chunks.
 * Example: "1028681234" -> "1028 6812 34"
 *
 * @param {string|number} num
 * @returns {string}
 */
export const formatAccountNumber = (num) => {
  if (!num) return ""
  return String(num).replace(/(.{4})/g, "$1 ").trim()
}

/**
 * Strips non-digit characters from string input for numeric fields.
 *
 * @param {string} val
 * @returns {string}
 */
export const sanitizeNumericInput = (val) => {
  if (typeof val !== "string") return ""
  return val.replace(/\D/g, "")
}

/**
 * Sanitizes bank account number by removing non-alphanumeric characters
 * and capping at 34 characters.
 *
 * @param {string} val
 * @returns {string}
 */
export const sanitizeAccountNumber = (val) => {
  if (typeof val !== "string") return ""
  return val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 34)
}

/**
 * Checks if account number is valid (6-34 alphanumeric characters).
 *
 * @param {string} val
 * @returns {boolean}
 */
export const isValidAccountNumber = (val) => {
  if (typeof val !== "string") return false
  return /^[a-zA-Z0-9]{6,34}$/.test(val)
}

/**
 * Normalizes account holder name: replaces đ/Đ, strips diacritics,
 * normalizes whitespace, and converts to uppercase ASCII.
 *
 * @param {string} val
 * @returns {string}
 */
export const normalizeAccountHolderName = (val) => {
  if (!val || typeof val !== "string") return ""
  return val
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase()
    .trim()
}

/**
 * Checks if account holder name is valid (2-70 characters after normalization).
 *
 * @param {string} val
 * @returns {boolean}
 */
export const isValidAccountHolderName = (val) => {
  const normalized = normalizeAccountHolderName(val)
  return normalized.length >= 2 && normalized.length <= 70
}

