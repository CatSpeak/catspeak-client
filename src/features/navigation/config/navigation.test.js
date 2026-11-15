import { describe, expect, it } from "vitest"
import {
  dockNavGroups,
  isNavItemVisible,
  navLinks,
  navSections,
} from "./navigation"

const aiTutorSection = navSections.find((section) => section.key === "aiTutor")
const aiTutorDockItem = dockNavGroups
  .flatMap((group) => group.items)
  .find((item) => item.key === "aiTutor")
const aiTutorNavLink = navLinks.find((item) => item.key === "aiTutor")
const catSpeakSection = navSections.find(
  (section) => section.key === "catSpeak",
)
const catSpeakLevelAssessment = catSpeakSection.items.find(
  (item) => item.key === "levelAssessment",
)
const catSpeakNavLink = navLinks.find((item) => item.key === "catSpeak")
const catSpeakNavLevelAssessment = catSpeakNavLink.subItems.find(
  (item) => item.key === "levelAssessment",
)

const aiTutorEntries = [
  ...aiTutorSection.items,
  aiTutorDockItem,
  aiTutorNavLink,
  catSpeakLevelAssessment,
  catSpeakNavLevelAssessment,
]

describe("AI Tutor navigation visibility", () => {
  it.each(["en", "ja"])("hides every AI Tutor entry in %s", (currentLang) => {
    expect(isNavItemVisible(aiTutorSection, { currentLang })).toBe(false)

    for (const entry of aiTutorEntries) {
      expect(isNavItemVisible(entry, { currentLang })).toBe(false)
    }
  })

  it("shows every AI Tutor entry in zh", () => {
    expect(isNavItemVisible(aiTutorSection, { currentLang: "zh" })).toBe(true)

    for (const entry of aiTutorEntries) {
      expect(isNavItemVisible(entry, { currentLang: "zh" })).toBe(true)
    }
  })
})
