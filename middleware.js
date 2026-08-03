export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
}

/* global process */
const BOT_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|Bytespider|Zalo|TelegramBot|WhatsApp|Viber|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Applebot|PinterestBot|ia_archiver/i

export default async function middleware(req) {
  const userAgent = req.headers.get("user-agent") || ""

  if (BOT_REGEX.test(userAgent)) {
    const url = new URL(req.url)

    const backendApiUrl = process.env.VITE_API_BASE_URL

    const destinationUrl = new URL(
      `${url.pathname}${url.search}`,
      backendApiUrl,
    ).toString()

    return fetch(destinationUrl, {
      headers: {
        "User-Agent": userAgent,
        "X-Forwarded-Host": url.host,
      },
    })
  }
}
