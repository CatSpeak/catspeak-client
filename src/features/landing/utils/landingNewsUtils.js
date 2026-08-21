export const isPostNew = (createDate) => {
  if (!createDate) return false
  const postDate = new Date(createDate)
  const now = new Date()
  const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}

export const formatNewsDate = (dateString, currentLang = "vi") => {
  if (!dateString) return ""
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  try {
    return new Intl.DateTimeFormat(
      currentLang === "vi" ? "vi-VN" : currentLang === "zh" ? "zh-CN" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(d)
  } catch {
    return d.toLocaleDateString()
  }
}
