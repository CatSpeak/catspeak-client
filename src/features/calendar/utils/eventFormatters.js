export const formatTime = (isoString) => {
  if (!isoString) return ""
  const date = new Date(isoString)
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

export const FREQUENCY_LABEL = {
  DAILY: "Hàng ngày",
  WEEKLY: "Hàng tuần",
  MONTHLY: "Hàng tháng",
  YEARLY: "Hàng năm",
}

export const formatLocation = (location, cityName, countryName) => {
  if (location && location.trim()) {
    return location.trim()
  }
  
  const parts = []
  if (cityName && cityName.trim()) parts.push(cityName.trim())
  if (countryName && countryName.trim()) parts.push(countryName.trim())
  
  return parts.join(", ")
}
