// Real in-app browsers must never be treated as crawlers: they render the SPA.
const IN_APP_BROWSER_GUARD = /\b(FBAN|FBAV|FB_IAB|Instagram|ZaloTheme|Zalo\/|Line\/)/i

const EXPLICIT_SOCIAL_BOT_REGEX =
  /facebookexternalhit|Facebot|meta-externalagent|Twitterbot|Bytespider|ZaloBot|Zalo-OpenAPI|zalo-bot|TelegramBot|WhatsApp|Viber|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|MicrosoftPreview|Applebot|PinterestBot|Pinterest\/|Linespider|Line-Poker|kakaotalk-scrap|redditbot|Snapchat|Mastodon|Bluesky|Embedly|vkShare|Iframely|ia_archiver/i

export function isSocialPreviewBot(userAgent) {
  if (!userAgent || typeof userAgent !== "string") return false
  if (IN_APP_BROWSER_GUARD.test(userAgent)) return false
  return EXPLICIT_SOCIAL_BOT_REGEX.test(userAgent)
}
