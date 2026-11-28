import { readFileSync } from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

const read = (file) =>
  readFileSync(
    path.resolve(
      globalThis.process.cwd(),
      "src/features/landing/components",
      file,
    ),
    "utf8",
  )

const RED_DARK = "dark:text-[#FF7A8A]"

describe("ISS-70: landing brand reds and muted labels meet AA in dark mode", () => {
  it("adds a dark brand-red accent to every section heading", () => {
    for (const file of [
      "HeroSection.jsx",
      "LeadingTeamSection.jsx",
      "ResponseSection.jsx",
      "AchievementsSection.jsx",
      "NewsSection.jsx",
      "PartnerSection.jsx",
      "FAQSection.jsx",
    ]) {
      expect(read(file), file).toContain(RED_DARK)
    }
  })

  it("lifts muted #999 labels to #595959 in light mode", () => {
    for (const file of [
      "AchievementsSection.jsx",
      "CoreFeaturesSection.jsx",
      "LearningBarriersSection.jsx",
    ]) {
      const source = read(file)
      expect(source, file).not.toContain("text-[#999]")
      expect(source, file).toContain("text-[#595959]")
    }
  })

  it("keeps the achievement category badge readable on a dark card", () => {
    const source = read("AchievementsSection.jsx")

    expect(source).toContain("text-[#8A4F00]")
    expect(source).toContain("dark:bg-[#382e1e]")
    expect(source).toContain("dark:text-amber-300")
  })

  it("gives the hero summary labels a readable light-mode grey", () => {
    const source = read("HeroSection.jsx")

    expect(source).not.toContain("text-[#777]")
    expect(source).toContain("text-[#595959] dark:text-gray-400")
  })
})
