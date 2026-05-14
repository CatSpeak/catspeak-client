export const formatTime = (isoString) => {
  if (!isoString) return ""
  const date = new Date(isoString)
  const datePart = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  })
  const timePart = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  })
  return `${datePart} ${timePart}`
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
