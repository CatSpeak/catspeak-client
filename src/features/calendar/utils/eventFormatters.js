export const formatTime = (isoString, timeZoneId) => {
  if (!isoString) return ""
  const date = new Date(isoString)
  const options = {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }
  if (timeZoneId) {
    options.timeZone = timeZoneId
  }
  
  try {
    return new Intl.DateTimeFormat(undefined, options).format(date)
  } catch (error) {
    // Fallback if timezone is invalid
    delete options.timeZone
    return new Intl.DateTimeFormat(undefined, options).format(date)
  }
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
