import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import CycleProgressBar from "./CycleProgressBar"

const render = (streak) =>
  renderToStaticMarkup(
    <CycleProgressBar
      cycleNumber={1}
      hskLevel="HSK2"
      completedSessions={0}
      totalSessions={5}
      streak={streak}
    />,
  )

describe("CycleProgressBar streak", () => {
  // Oracle: the server owns the streak (LearningPathDtos.cs:27). The client
  // used to replace a missing/zero value with a hard-coded 5, so a fresh
  // 0/5 cycle reported "Streak 5 ngày" (user report 2026-10-31).
  it("renders the server streak instead of a hard-coded 5", () => {
    expect(render(0)).toContain("0 ngày")
    expect(render(0)).not.toContain("5 ngày")
  })

  it("renders a real consecutive-day streak", () => {
    expect(render(3)).toContain("3 ngày")
  })

  it("names the path with the same HSK spacing as the profile card", () => {
    expect(render(0)).toContain("Lộ trình HSK 2")
  })
})
