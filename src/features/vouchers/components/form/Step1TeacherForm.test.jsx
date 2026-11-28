// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import Step1TeacherForm from "./Step1TeacherForm"
import { INITIAL_VOUCHER_FORM } from "../../hooks/useVoucherFormState"
vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

const teacherClasses = [
  { id: 26, name: "Lớp IELTS 6.5", price: 3000000, courseId: 3 },
]
const teacherCourses = [{ id: 3, name: "IELTS Intensive", price: 5000000 }]

const renderForm = (url) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <Step1TeacherForm
        form={{ ...INITIAL_VOUCHER_FORM, code: "GV-ABC123", title: "Voucher" }}
        errors={{}}
        onChange={() => {}}
        onBlur={() => {}}
        onAutoGenerateCode={() => {}}
        isGeneratingCode={false}
        teacherClasses={teacherClasses}
        teacherCourses={teacherCourses}
      />
    </MemoryRouter>,
  )

describe("ISS-29: scope selector visibility", () => {
  it("shows the scope picker on a bare /workspace/vouchers/create URL", () => {
    const html = renderForm("/workspace/vouchers/create")

    expect(html).toContain("Phạm vi áp dụng")
    expect(html).toContain("Áp dụng cho Lớp học")
    expect(html).toContain("Áp dụng cho Khóa học")
  })

  it("hides the scope picker when opened from a class tab", () => {
    const html = renderForm("/workspace/vouchers/create?classId=26")

    expect(html).not.toContain("Phạm vi áp dụng")
  })

  it("hides the scope picker when opened from a course tab", () => {
    const html = renderForm("/workspace/vouchers/create?courseId=3")

    expect(html).not.toContain("Phạm vi áp dụng")
  })

  it("hides the scope picker while editing an existing voucher", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/workspace/vouchers/create"]}>
        <Step1TeacherForm
          form={{ ...INITIAL_VOUCHER_FORM }}
          errors={{}}
          onChange={() => {}}
          onBlur={() => {}}
          onAutoGenerateCode={() => {}}
          isGeneratingCode={false}
          teacherClasses={teacherClasses}
          teacherCourses={teacherCourses}
          isEditing
        />
      </MemoryRouter>,
    )

    expect(html).not.toContain("Phạm vi áp dụng")
  })
})
