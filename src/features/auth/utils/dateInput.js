// Return an API date only when every part represents a real calendar date.
// Keep incomplete/invalid input out of the registration payload.
export const parseDateInput = (text) => {
  const input = String(text ?? "").trim()
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input)
    || /^(\d{2})(\d{2})(\d{4})$/.exec(input)
  if (!match) return ""

  const [, dayText, monthText, yearText] = match
  const day = Number(dayText)
  const month = Number(monthText)
  const year = Number(yearText)
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return ""
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  if (day > daysInMonth) return ""
  return `${yearText}-${monthText}-${dayText}`
}

export const formatDateInput = (isoDate) => {
  if (!isoDate) return ""
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

export const maskDateInput = (text, selectionStart = text.length) => {
  const digits = text.replace(/\D/g, "").slice(0, 8)
  const digitsBeforeCaret = Math.min(
    text.slice(0, selectionStart).replace(/\D/g, "").length,
    digits.length,
  )

  let value = digits.slice(0, 2)
  if (digits.length >= 2) {
    value += "/" + digits.slice(2, 4)
  }
  if (digits.length >= 4) {
    value += "/" + digits.slice(4)
  }

  const caret = digitsBeforeCaret
    + (digitsBeforeCaret >= 2 && digits.length >= 2 ? 1 : 0)
    + (digitsBeforeCaret >= 4 && digits.length >= 4 ? 1 : 0)

  return { value, caret }
}

export const shouldShowDateFormatError = (text, isFocused, hasBlurred) =>
  Boolean(text.trim())
  && !parseDateInput(text)
  && (text.replace(/\D/g, "").length === 8 || (!isFocused && hasBlurred))
