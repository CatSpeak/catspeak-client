/**
 * Seeded pseudo-random number generator (Park-Miller LCG).
 * Returns a function that produces stable random values [0, 1) for a given seed.
 */
export function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Simple string hash for extra seed entropy.
 * Produces a non-negative integer from a string.
 */
export function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.trunc(h * 31 + s.charCodeAt(i))
  return Math.abs(h)
}

/**
 * Estimate the rendered height of a danmaku pill based on character count.
 * Assumes ~30 chars per line at 280px max-width, ~24px per line + 16px vertical padding.
 */
export function estimatePillHeight(charLen) {
  const lines = Math.ceil(charLen / 30) || 1
  return lines * 24 + 16
}

/**
 * Generate an array of danmaku items with stable random positions and speeds.
 *
 * @param {Array} combinedStories - Stories with isOwn flag
 * @param {number} stageHeight - Current height of the danmaku stage in px
 * @returns {Array} Items augmented with _idx, _top, _duration, _delay
 */
export function generateDanmakuItems(combinedStories) {
  if (!combinedStories || combinedStories.length === 0) return []

  // Ensure plenty of items for a full-feeling screen
  const targetCount = 30
  let items = [...combinedStories]
  while (items.length < targetCount) {
    items = [...items, ...combinedStories]
  }

  return items.map((story, idx) => {
    const contentHash = hashStr(story.storyContent || "")
    const rand = seededRandom(idx * 7919 + contentHash * 13 + idx * idx + 31)

    const charLen = story.storyContent?.length || 0
    
    // Instead of precise pixels dependent on container height, use percentage
    // Random between 0 and 85% to ensure it doesn't overflow bottom
    const topPercent = (rand() * 85).toFixed(2)

    const lengthFactor = 1 + charLen / 250 // longer text → slower
    const duration = (8 + rand() * 12) * lengthFactor // base 8–20s, scaled by length
    const delay = -(rand() * duration) // negative delay to spread across timeline

    return {
      ...story,
      _idx: idx,
      _top: `${topPercent}%`,
      _duration: duration,
      _delay: delay,
    }
  })
}
