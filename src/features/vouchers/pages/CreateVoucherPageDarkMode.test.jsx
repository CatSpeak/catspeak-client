// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CreateVoucherPage from "./CreateVoucherPage"

const api = vi.hoisted(() => ({
  voucher: vi.fn(),
  formState: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: "1" }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))

vi.mock("../api/vouchersApi", () => ({
  useGetVoucherByIdQuery: api.voucher,
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetAllCoursesQuery: () => ({ data: { data: [] } }),
  useGetAllClassesQuery: () => ({ data: { data: [] } }),
}))

vi.mock("../hooks/useVoucherFormState", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useVoucherFormState: api.formState,
  }
})

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      vouchers: {
        back: "Quay lại",
        notFound: "Không tìm thấy thông tin voucher",
        notFoundDesc: "Voucher không tồn tại hoặc bạn không có quyền truy cập.",
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/PageTitle", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/navigation", () => ({ StepPills: () => null }))
vi.mock("@/shared/components/ui/navigation/Breadcrumb", () => ({
  default: () => null,
}))
vi.mock("@/shared/components/ui/containers/FloatingActionDock", () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock("../components/form/Step1TeacherForm", () => ({
  default: () => <div data-testid="step1-form" />,
}))
vi.mock("../components/form/Step2TeacherDeposit", () => ({
  default: () => <div data-testid="step2-form" />,
}))
vi.mock("../components/form/VoucherFormSkeleton", () => ({
  default: () => null,
}))
vi.mock("../components/PendingDepositConfirmation", () => ({ default: () => null }))
vi.mock("../components/detail/TransferInfoModal", () => ({ default: () => null }))

const renderPage = () => renderToStaticMarkup(<CreateVoucherPage />)

describe("ISS-63: CreateVoucherPage unwraps the voucher detail envelope", () => {
  beforeEach(() => {
    api.formState.mockClear()
    api.formState.mockReturnValue({
      form: { courseIds: [], classIds: [] },
      errors: {},
      currentVoucherId: "1",
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleNextStep: () => true,
      handleSaveDraft: vi.fn(),
      saveVoucher: vi.fn(),
      handleAutoGenerateCode: vi.fn(),
      estimatedDeposit: 0,
      isSubmitting: false,
      isSavingDraft: false,
      isGeneratingCode: false,
    })
  })

  it("opens the edit form for a Draft wrapped in { data }", () => {
    api.voucher.mockReturnValue({
      data: { data: { id: 1, code: "GV-ABC123", status: "Draft" } },
      isLoading: false,
      isError: false,
    })

    const html = renderPage()

    expect(html).toContain('data-testid="step1-form"')
    expect(html).not.toContain("Không thể chỉnh sửa voucher")
    expect(api.formState).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Draft" }),
      "1",
    )
  })

  it("blocks editing for a non-draft wrapped in { data }", () => {
    api.voucher.mockReturnValue({
      data: { data: { id: 1, code: "GV-ABC123", status: "Active" } },
      isLoading: false,
      isError: false,
    })

    const html = renderPage()

    expect(html).toContain("Không thể chỉnh sửa voucher")
    expect(html).not.toContain('data-testid="step1-form"')
  })

  it("uses the shared PillButton on the 403/404 error screen", () => {
    api.voucher.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    const html = renderPage()

    expect(html).toContain("Quay lại")
    expect(html).toContain("h-12")
    expect(html).not.toContain("bg-slate-900 dark:bg-neutral-800")
  })
})
