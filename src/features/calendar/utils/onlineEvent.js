export const isValidMeetingUrl = (value) => {
  try {
    const url = new URL(String(value).trim())
    return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}
