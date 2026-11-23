import { describe, expect, it } from "vitest"
import { isSocialPreviewBot } from "../botDetector.js"

describe("isSocialPreviewBot", () => {
  it.each([
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Meta-ExternalAgent/1.1",
    "Twitterbot/1.0",
    "Bytespider; spider-feedback@bytedance.com",
    "ZaloBot/1.0",
    "TelegramBot (like TwitterBot)",
    "WhatsApp/2.23.20.0",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Discordbot/2.0",
    "LinkedInBot/1.0",
    "SkypeUriPreview Preview/0.5",
    "MicrosoftPreview/1.0",
    "PinterestBot/1.0",
    "Linespider/1.0",
    "kakaotalk-scrap/1.0",
    "redditbot/1.0",
    "Mastodon/4.0",
    "Bluesky/1.0",
    "Iframely/1.3.1",
    "ia_archiver",
  ])("detects %s", (userAgent) => {
    expect(isSocialPreviewBot(userAgent)).toBe(true)
  })

  it.each([
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 ZaloTheme/light Zalo/24.08",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) FBAN/FBIOS;FBAV/400.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Line/14.0.0",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/17.0 Safari/605.1.15",
    "",
  ])("does not treat %s as a preview bot", (userAgent) => {
    expect(isSocialPreviewBot(userAgent)).toBe(false)
  })

  it("handles missing user agents", () => {
    expect(isSocialPreviewBot(undefined)).toBe(false)
    expect(isSocialPreviewBot(null)).toBe(false)
  })

  it("keeps real in-app browsers on the SPA even when a bot token is present", () => {
    expect(isSocialPreviewBot("Mozilla/5.0 FBAN/FBIOS facebookexternalhit/1.1")).toBe(false)
  })
})
