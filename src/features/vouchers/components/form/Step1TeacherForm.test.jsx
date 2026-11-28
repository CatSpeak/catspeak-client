// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import Step1TeacherForm from "./Step1TeacherForm"
import { INITIAL_VOUCHER_FORM } from "../../hooks/useVoucherFormState"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

const teacherClasses = [
  { id: 26, name: "Lớp IELTS 6.5", price: 3000000, courseId: 3 },
]
const teacherCourses = [
  { id: 3, name: "IELTS Intensive", price: 5000000 },
  { id: 4, name: "Course without classes", price: 0 },
]

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

  it("resets lowestTuition when switching scope, changing class or clearing selection", async () => {
    const ReactDOM = await import("react-dom/client")
    const { act } = await import("react")
    const onChangeSpy = vi.fn()

    const Wrapper = () => {
      const [form, setForm] = React.useState({
        ...INITIAL_VOUCHER_FORM,
        lowestTuition: 3000000,
        classIds: [26],
      })
      const handleChange = (field, value) => {
        onChangeSpy(field, value)
        setForm((prev) => ({ ...prev, [field]: value }))
      }
      return (
        <MemoryRouter initialEntries={["/workspace/vouchers/create"]}>
          <Step1TeacherForm
            form={form}
            errors={{}}
            onChange={handleChange}
            onBlur={() => {}}
            onAutoGenerateCode={() => {}}
            isGeneratingCode={false}
            teacherClasses={teacherClasses}
            teacherCourses={teacherCourses}
          />
        </MemoryRouter>
      )
    }

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(<Wrapper />)
    })

    const classSelect = container.querySelector('select[aria-label="Chọn lớp học"]')
    expect(classSelect).toBeTruthy()

    // Re-selecting a class always writes the real tuition.
    await act(async () => {
      classSelect.value = "26"
      classSelect.dispatchEvent(new window.Event("change", { bubbles: true }))
    })
    expect(onChangeSpy).toHaveBeenCalledWith("lowestTuition", 3000000)

    // Clearing back to the placeholder clears the selection and the tuition.
    onChangeSpy.mockClear()
    await act(async () => {
      classSelect.value = ""
      classSelect.dispatchEvent(new window.Event("change", { bubbles: true }))
    })
    expect(onChangeSpy).toHaveBeenCalledWith("classIds", [])
    expect(onChangeSpy).toHaveBeenCalledWith("lowestTuition", 0)

    // Switching scope resets the tuition before the new scope is chosen.
    onChangeSpy.mockClear()
    const courseScopeButton = Array.from(
      container.querySelectorAll("button"),
    ).find((btn) => btn.textContent.includes("Áp dụng cho Khóa học"))
    await act(async () => {
      courseScopeButton.dispatchEvent(new window.MouseEvent("click", { bubbles: true }))
    })
    expect(onChangeSpy).toHaveBeenCalledWith("lowestTuition", 0)

    // A course with no matching classes still writes 0 (no guard drops it).
    const courseSelect = container.querySelector(
      'select[aria-label="Chọn khóa học"]',
    )
    expect(courseSelect).toBeTruthy()
    onChangeSpy.mockClear()
    await act(async () => {
      courseSelect.value = "4"
      courseSelect.dispatchEvent(new window.Event("change", { bubbles: true }))
    })
    expect(onChangeSpy).toHaveBeenCalledWith("lowestTuition", 0)

    await act(async () => root.unmount())
    container.remove()
  })
})
