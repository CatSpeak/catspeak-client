export const getFeatureSuffix = (featureCode, t) => {
  return t?.billing?.planCard?.suffixes?.[featureCode] || ""
}

export const getGridClasses = (count) => {
  if (count === 1) return "max-w-lg mx-auto w-full flex justify-center"
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto w-full items-stretch justify-center"
  if (count === 3) return "grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-7xl mx-auto w-full items-stretch justify-center"
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full items-stretch justify-center"
}
