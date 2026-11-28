// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import TeacherCard from "./TeacherCard"

const teacher = {
  id: 1,
  name: "Teacher One",
  avatarUrl: "",
  rating: 4.8,
  reviewCount: 12,
  totalStudents: 40,
  activeClassCount: 2,
}

const t = {
  teacherReviews: "{{count}} đánh giá",
  teacherNoReviews: "Chưa có đánh giá",
  teacherStudents: "{{count}} học viên",
  teacherOpenClasses: "{{count}} lớp đang mở",
  viewProfile: "Xem trang cá nhân",
  verifiedTeacher: "Đã xác minh",
}

const renderCard = (viewMode) => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <TeacherCard teacher={teacher} t={t} viewMode={viewMode} />
    </MemoryRouter>,
  )
  const container = document.createElement("div")
  container.innerHTML = html
  return container.firstElementChild
}

describe("ISS-47: TeacherCard layout modes", () => {
  it("renders a horizontal row for list mode", () => {
    const card = renderCard("list")

    expect(card.className).toContain("md:flex-row")
    expect(card.className).toContain("items-center")
    expect(card.textContent).toContain("Teacher One")
    expect(card.textContent).toContain("Xem trang cá nhân")
  })

  it("keeps the vertical grid layout by default", () => {
    const card = renderCard("grid")

    expect(card.className).toContain("flex-col items-center")
    expect(card.className).not.toContain("md:flex-row")
    expect(card.textContent).toContain("Teacher One")
  })
})
