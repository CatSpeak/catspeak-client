export const isPostNew = (createDate) => {
  if (!createDate) return false
  const postDate = new Date(createDate)
  const now = new Date()
  const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}

