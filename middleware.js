export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};

export default async function middleware(req) {
  const userAgent = req.headers.get("user-agent") || "";

  const isBot =
    /facebookexternalhit|Facebot|Zalo|Twitterbot|Slackbot|TelegramBot|LinkedInBot|WhatsApp|Discordbot|SkypeUriPreview|Viber/i.test(
      userAgent,
    );

  if (isBot) {
    const backendApiUrl = "https://staging-api.catspeak.com.vn";

    const url = new URL(req.url);
    const destinationUrl = `${backendApiUrl}${url.pathname}${url.search}`;

    return fetch(destinationUrl, {
      headers: {
        "User-Agent": userAgent,
        "X-Forwarded-Host": url.host,
      },
    });
  }

  return;
}
