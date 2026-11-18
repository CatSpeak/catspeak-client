export const getNextFallbackScriptIndex = (
  scripts,
  currentIndex,
  random = Math.random,
) => {
  if (scripts.length < 2) return 0

  const nextIndexes = scripts
    .map((_, index) => index)
    .filter((index) => index !== currentIndex)

  return nextIndexes[Math.floor(random() * nextIndexes.length)]
}
