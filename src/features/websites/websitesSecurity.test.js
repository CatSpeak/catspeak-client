// @vitest-environment node
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { describe, expect, it } from "vitest"

const ROOT = fileURLToPath(new URL("../../..", import.meta.url))

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"))
}

function extractResources() {
  const src = fs.readFileSync(
    path.join(ROOT, "src/features/websites/api/websiteApi.js"),
    "utf8",
  )
  const resources = new Map()
  for (const m of src.matchAll(
    /id:\s*"([^"]+)",\s*lang:\s*"[^"]+",\s*url:\s*"([^"]+)",\s*embeddable:\s*(true|false)/g,
  )) {
    resources.set(m[1], { url: m[2], embeddable: m[3] === "true" })
  }
  return resources
}

function cspRules(vercel) {
  return vercel.headers
    .flatMap((rule) =>
      rule.headers
        .filter((h) => h.key === "Content-Security-Policy")
        .map((h) => ({ source: rule.source, value: h.value })),
    )
}

function directive(csp, name) {
  const part = csp
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name} `))
  return part ? part.slice(name.length).trim() : ""
}

describe("ISS-03 / ISS-46: CSP and resource icon consistency", () => {
  const vercel = readJson("vercel.json")
  const rules = cspRules(vercel)
  const resources = extractResources()

  it("sends exactly one CSP per route family (no overlapping duplicates)", () => {
    expect(rules).toHaveLength(2)

    const [defaultRule, resourceRule] = rules
    expect(defaultRule.source).toBe("/((?!resources/[^/]+$).*)")
    expect(resourceRule.source).toBe("/resources/:id")

    const defaultRegex = new RegExp(`^${defaultRule.source}$`)
    expect(defaultRegex.test("/resources")).toBe(true)
    expect(defaultRegex.test("/resources/ef-set")).toBe(false)
  })

  it("keeps script-src strict (no unsafe-inline / unsafe-eval) and allows Cloudflare Insights", () => {
    for (const { value } of rules) {
      const scriptSrc = directive(value, "script-src")
      expect(scriptSrc).not.toContain("'unsafe-inline'")
      expect(scriptSrc).not.toContain("'unsafe-eval'")
      expect(scriptSrc).toContain("https://static.cloudflareinsights.com")
      expect(directive(value, "connect-src")).toContain(
        "https://cloudflareinsights.com",
      )
    }
  })

  it("never uses a frame-src wildcard and keeps the default frame-src to 3 origins", () => {
    for (const { value } of rules) {
      const frameSrc = directive(value, "frame-src")
      expect(frameSrc).not.toMatch(/(^|\s)https:(\s|$)/)
    }

    const defaultFrameSrc = directive(rules[0].value, "frame-src")
    expect(defaultFrameSrc).toBe(
      "'self' https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com",
    )
  })

  it("opens frame-src on /resources/:id only for embeddable:true origins", () => {
    const resourceFrameSrc = directive(rules[1].value, "frame-src")
    for (const [id, resource] of resources) {
      const origin = new URL(resource.url).origin
      if (resource.embeddable) {
        expect(resourceFrameSrc, `${id} (${origin})`).toContain(origin)
      }
    }
  })

  it("self-hosts every card image and never stores SVG or remote URLs", () => {
    const data = fs.readFileSync(
      path.join(ROOT, "src/features/websites/config/websitesData.js"),
      "utf8",
    )
    const imgs = [...data.matchAll(/img:\s*"([^"]*)"/g)].map((m) => m[1])
    expect(imgs.length).toBeGreaterThan(0)

    for (const img of imgs) {
      expect(img.startsWith("/website-icons/")).toBe(true)
      expect(img.toLowerCase().endsWith(".svg")).toBe(false)
      expect(img.startsWith("http")).toBe(false)
    }
  })

  it("stores only raster icons within the size budget with valid magic bytes", () => {
    const iconDir = path.join(ROOT, "public/website-icons")
    const data = fs.readFileSync(
      path.join(ROOT, "src/features/websites/config/websitesData.js"),
      "utf8",
    )
    const files = [...data.matchAll(/img:\s*"\/website-icons\/([^"]+)"/g)].map(
      (m) => m[1],
    )

    for (const file of files) {
      const full = path.join(iconDir, file)
      expect(fs.existsSync(full), file).toBe(true)
      const buf = fs.readFileSync(full)
      expect(buf.length).toBeLessThanOrEqual(256 * 1024)

      const isPng =
        buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
      const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
      const isWebp =
        buf.toString("ascii", 0, 4) === "RIFF" &&
        buf.toString("ascii", 8, 12) === "WEBP"
      const isIco =
        buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00

      expect(isPng || isJpg || isWebp || isIco, file).toBe(true)
    }
  })
})
