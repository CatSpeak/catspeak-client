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
