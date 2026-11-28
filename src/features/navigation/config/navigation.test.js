import { describe, expect, it } from "vitest"
import {
  dockNavGroups,
  isNavItemVisible,
  navLinks,
  navSections,
  TEACHER_ONLY_TABS,
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
].filter(Boolean)

describe("AI Tutor navigation visibility", () => {  it.each(["en", "ja"])("hides every AI Tutor entry in %s", (currentLang) => {
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

const getWorkspaceGroup = (groups, key) =>
  groups.find((group) => group.key === key)

const workspaceSection = navSections.find((section) => section.key === "workspace")
const workspaceNavLink = navLinks.find((item) => item.key === "workspace")
const teachingSectionGroup = getWorkspaceGroup(
  workspaceSection.groups,
  "teaching",
)
const teachingNavGroup = getWorkspaceGroup(workspaceNavLink.groups, "teaching")

const dashboardStudentItem = getWorkspaceGroup(
  workspaceSection.groups,
  "general",
).items.find((item) => item.key === "dashboard")

describe("ISS-12/ISS-61: workspace navigation and teacher-only tabs", () => {
  it("no longer hides the dashboard tab from Students", () => {
    expect(TEACHER_ONLY_TABS).not.toContain("dashboard")
    expect(
      isNavItemVisible(dashboardStudentItem, {
        isAuthenticated: true,
        activeRole: "Student",
        isStudent: true,
        isTeacher: false,
      }),
    ).toBe(true)
  })

  it("still hides teacher-only tabs from Students", () => {
    for (const key of ["myCourses", "analytics", "schedule", "teachingTasks"]) {
      expect(TEACHER_ONLY_TABS).toContain(key)
    }
    expect(
      isNavItemVisible(
        { key: "teachingTasks", path: "/workspace/teaching-tasks" },
        { isStudent: true, isTeacher: false },
      ),
    ).toBe(false)
  })

  it.each([
    ["navSections", teachingSectionGroup],
    ["navLinks", teachingNavGroup],
  ])("exposes teachingTasks and schedule in %s", (_name, group) => {
    const keys = group.items.map((item) => item.key)

    expect(keys).toEqual([
      "dashboard",
      "myCourses",
      "teachingTasks",
      "schedule",
      "manageMaterials",
      "analytics",
    ])
    expect(group.items.find((item) => item.key === "teachingTasks").path).toBe(
      "/workspace/teaching-tasks",
    )
    expect(group.items.find((item) => item.key === "schedule").path).toBe(
      "/workspace/schedule",
    )
  })
})
