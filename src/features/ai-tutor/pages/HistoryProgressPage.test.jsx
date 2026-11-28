import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      aiTutor: {
        historyProgress: {
          title: "Lịch sử & Tiến độ",
          badge: "Sắp ra mắt",
          comingSoonDesc: "Tính năng thống kê đang được hoàn thiện.",
          learningPathCta: "Lộ trình 5 ngày",
          speakingRoomCta: "Phòng luyện nói",
          vocabularyCta: "Sổ từ vựng",
        },
      },
    },
  }),
}))

import HistoryProgressPage from "./HistoryProgressPage"

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={["/zh/ai-tutor/history-progress"]}>
      <Routes>
        <Route
          path="/:lang/ai-tutor/history-progress"
          element={<HistoryProgressPage />}
        />
      </Routes>
    </MemoryRouter>,
  )

describe("ISS-35: history-progress route renders a polished coming-soon card", () => {
  it("shows the localized title, badge and description", () => {
    const html = renderPage()

    expect(html).toContain("Lịch sử &amp; Tiến độ")
    expect(html).toContain("Sắp ra mắt")
    expect(html).toContain("Tính năng thống kê đang được hoàn thiện.")
  })

  it("offers working CTAs to the three AI Tutor destinations", () => {
    const html = renderPage()

    expect(html).toContain('href="/zh/ai-tutor/learning-path"')
    expect(html).toContain('href="/zh/ai-tutor/speaking-room"')
    expect(html).toContain('href="/zh/ai-tutor/vocabulary-notebook"')
    expect(html).toContain("whitespace-nowrap")
    expect(html).toContain("dark:bg-[#1A1A1A]")
  })
})
