/**
 * Returns the absolute path to the community page in the correct language.
 * Reads from localStorage first, falls back to the provided language, then "en".
 *
 * @param {string} [language] - Optional fallback language code (e.g. "vi", "en")
 * @returns {string} e.g. "/en/community"
 */
export const getCommunityPath = (language) => {
  return `/${getCommunityLang(language)}/community`
}

/**
 * Returns a language code valid for community routes (zh/en) — never vi,
 * since the community ecosystem has no Vietnamese community.
 *
 * @param {string} [language] - Optional fallback language code (e.g. "vi", "en")
 * @returns {string} e.g. "en" or "zh"
 */
export const getCommunityLang = (language) => {
  const saved = localStorage.getItem("communityLanguage")
  const lang =
    saved && saved !== "vi"
      ? saved
      : language && language !== "vi"
      ? language
      : "zh"
  return lang || "zh"
}

const CLASS_LANGUAGE_CODE_MAP = {
  en: "en",
  english: "en",
  zh: "zh",
  chinese: "zh",
  ja: "ja",
  japanese: "ja",
}

/**
 * Maps a class language name/code (e.g. "English", "Chinese", "Japanese", "en")
 * to the language code used in the /:lang/meet room URL. The system does not
 * support Vietnamese classes or communities, so Vietnamese is intentionally never
 * returned. Returns undefined when the language cannot be resolved so callers
 * can fall back to their own default.
 *
 * @param {string} [classLanguage]
 * @returns {string|undefined} e.g. "en", "zh", "ja"
 */
export const getClassLanguageCode = (classLanguage) => {
  if (!classLanguage) return undefined
  return CLASS_LANGUAGE_CODE_MAP[String(classLanguage).trim().toLowerCase()]
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
