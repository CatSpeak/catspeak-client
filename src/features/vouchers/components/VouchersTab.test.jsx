// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it, vi } from "vitest"
import VouchersTab from "./VouchersTab"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  queryArgs: [],
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      vouchers: {
        createVoucher: "Tạo voucher mới",
        allStatuses: "Tất cả trạng thái",
        allDiscountTypes: "Tất cả loại",
      },
    },
  }),
}))

vi.mock("../api/vouchersApi", () => ({
  useGetVouchersQuery: (params) => {
    mocks.queryArgs.push(params)
    return {
      data: { data: [] },
      isLoading: false,
      isFetching: false,
    }
  },
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetCourseDetailQuery: () => ({ data: null }),
}))

vi.mock("./VoucherTable", () => ({ default: () => <div data-testid="table" /> }))
vi.mock("./VoucherTableSkeleton", () => ({ default: () => null }))
vi.mock("./VoucherUsagesModal", () => ({ default: () => null }))
vi.mock("./CourseVoucherNoticeModal", () => ({
  SingleClassVoucherNoticeModal: ({ open }) =>
    open ? <div data-testid="single-class-modal" /> : null,
  NoClassesWarningModal: ({ open }) =>
    open ? <div data-testid="no-classes-modal" /> : null,
}))
vi.mock("@/shared/components/ui/Banner", () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock("@/shared/components/ui/buttons/PillButton", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))
vi.mock("@/shared/components/ui/inputs", () => ({
  SearchInput: () => <input />,
}))
vi.mock("@/shared/components/ui/Dropdown", () => ({
  default: () => <div />,
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(<VouchersTab scope="all" />)
  })
  return container
}

describe("ISS-22: VouchersTab all-instructor scope", () => {
  it("queries all Instructor vouchers without class/course filters", () => {
    render()

    expect(mocks.queryArgs[0]).toMatchObject({
      sponsorType: "Instructor",
      classId: undefined,
      courseId: undefined,
    })
  })

  it("creates a voucher directly at /workspace/vouchers/create without a warning modal", () => {
    const container = render()

    expect(container.querySelector('[data-testid="no-classes-modal"]')).toBeNull()
    expect(
      container.querySelector('[data-testid="single-class-modal"]'),
    ).toBeNull()

    const createButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent.includes("Tạo voucher mới"),
    )

    act(() => {
      createButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mocks.navigate).toHaveBeenCalledWith("/workspace/vouchers/create")
  })
})
