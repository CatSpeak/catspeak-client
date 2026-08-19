/**
 * Returns the absolute path to the community page in the correct language.
 * Reads from localStorage first, falls back to the provided language, then "en".
 *
 * @param {string} [language] - Optional fallback language code (e.g. "vi", "en")
 * @returns {string} e.g. "/en/community"
 */
export const getCommunityPath = (language) => {
  const saved = localStorage.getItem("communityLanguage")
  const lang =
    saved && saved !== "vi"
      ? saved
      : language && language !== "vi"
      ? language
      : "zh"
  return `/${lang || "zh"}/community`
}

/**
 * Returns the absolute path to a user's profile page.
 *
 * @param {number|string} [accountId] - User account ID
 * @returns {string} e.g. "/profile/123" or "/profile"
 */
export const getProfilePath = (accountId) => {
  return accountId ? `/profile/${accountId}` : "/profile"
}

/**
 * Calculates the target URL path when switching community language.
 * Automatically cleans up detail/ID parameters (e.g. /cat-speak/reels/41 -> /cat-speak/reels)
 * because specific item IDs are tied to their original community context.
 *
 * @param {string} pathname - Current window.location.pathname
 * @param {string} currentCommunity - Current community language code (e.g. "en")
 * @param {string} newCode - Target community language code (e.g. "vi")
 * @returns {string} Target path
 */
export const getSwitchCommunityPath = (pathname, currentCommunity, newCode) => {
  const isInsideEcosystem =
    pathname === `/${currentCommunity}` ||
    pathname.startsWith(`/${currentCommunity}/`)

  let targetPath = isInsideEcosystem
    ? pathname.replace(`/${currentCommunity}`, `/${newCode}`)
    : `/${newCode}/community`

  // Strip detail ID when switching community for reels (e.g. /cat-speak/reels/41 -> /cat-speak/reels)
  targetPath = targetPath.replace(/\/cat-speak\/reels\/[^/]+$/, "/cat-speak/reels")
  targetPath = targetPath.replace(/\/workspace\/reels\/[^/]+$/, "/workspace/reels")

  // Strip detail ID for news (e.g. /cat-speak/news/41 -> /cat-speak/news)
  targetPath = targetPath.replace(/\/cat-speak\/news\/[^/]+$/, "/cat-speak/news")
  targetPath = targetPath.replace(/\/cat-speak\/global-news\/[^/]+$/, "/cat-speak/global-news")

  return targetPath
}
