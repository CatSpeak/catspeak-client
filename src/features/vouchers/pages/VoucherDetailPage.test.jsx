// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import VoucherDetailPage from "./VoucherDetailPage"

const api = vi.hoisted(() => ({
  voucher: vi.fn(),
  usages: vi.fn(() => ({ data: [], isLoading: false })),
  stopVoucher: vi.fn(() => [vi.fn(), { isLoading: false }]),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: "1" }),
  useNavigate: () => vi.fn(),
}))

vi.mock("../api/vouchersApi", () => ({
  useGetVoucherByIdQuery: api.voucher,
  useGetVoucherUsagesQuery: api.usages,
  useStopVoucherMutation: api.stopVoucher,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      vouchers: {
        notFound: "Không tìm thấy thông tin voucher",
        notFoundDesc: "Voucher không tồn tại hoặc bạn không có quyền truy cập.",
        back: "Quay lại",
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/PageTitle", () => ({ default: () => null }))
vi.mock("../components/VoucherStatusBadge", () => ({ default: () => null }))
vi.mock("../components/detail/VoucherConfigCard", () => ({ default: () => null }))
vi.mock("../components/detail/VoucherStatsCard", () => ({ default: () => null }))
vi.mock("../components/detail/VoucherRefundCard", () => ({ default: () => null }))
vi.mock("../components/detail/VoucherUsagesTable", () => ({ default: () => null }))
vi.mock("../components/detail/VoucherDetailSkeleton", () => ({
  default: () => null,
}))
vi.mock("../components/detail/StopVoucherModal", () => ({ default: () => null }))

const renderPage = () => renderToStaticMarkup(<VoucherDetailPage />)

describe("ISS-21: VoucherDetailPage usage query and null guard", () => {
  beforeEach(() => {
    api.usages.mockClear()
    api.voucher.mockReturnValue({
      data: { id: 1, code: "GV-ABC123", status: "Active" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  it("queries usages with { id } instead of { voucherId }", () => {
    renderPage()

    expect(api.usages).toHaveBeenCalledWith(
      { id: "1", page: 1, pageSize: 20 },
      { skip: false },
    )
  })

  it("skips the usage query when the voucher request failed", () => {
    api.voucher.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    renderPage()

    expect(api.usages).toHaveBeenCalledWith(expect.anything(), { skip: true })
  })

  it("renders the not-found state when the API returns data: null", () => {
    api.voucher.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const html = renderPage()
    expect(html).toContain("Không tìm thấy thông tin voucher")
    expect(html).not.toContain("GV-ABC123")
  })
})
