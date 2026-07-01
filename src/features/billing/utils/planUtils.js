export const getFeatureSuffix = (featureCode, t) => {
  return t?.billing?.planCard?.suffixes?.[featureCode] || ""
}

export const getGridClasses = (count) => {
  if (count === 1) return "max-w-sm mx-auto"
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
  if (count === 3) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
  return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full mx-auto"
}
