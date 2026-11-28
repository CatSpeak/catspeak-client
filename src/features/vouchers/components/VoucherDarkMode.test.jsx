// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import VoucherStatusBadge from "./VoucherStatusBadge"
import VoucherUsagesTable from "./detail/VoucherUsagesTable"
import CannotEditVoucher from "./CannotEditVoucher"
import CourseStatusPill from "@/features/courses/components/CourseStatusPill"

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: { vouchers: {} } }),
}))

vi.mock("@/shared/components/ui/inputs/SearchInput", () => ({
  default: () => <input />,
}))
vi.mock("@/shared/components/ui/Dropdown", () => ({ default: () => <div /> }))
vi.mock("@/shared/components/ui/buttons/IconButton", () => ({
  default: ({ children }) => <button type="button">{children}</button>,
}))
vi.mock("./detail/TransferInfoModal", () => ({ default: () => null }))

describe("ISS-63: voucher surfaces have dark variants", () => {
  it("VoucherStatusBadge fallback keeps contrast in dark mode", () => {
    const html = renderToStaticMarkup(<VoucherStatusBadge status="Unknown" />)

    expect(html).toContain("dark:bg-[#272727]")
    expect(html).toContain("dark:text-neutral-300")
    expect(html).toContain("dark:border-[#3F3F3F]")
  })

  it("VoucherUsagesTable uses a dark row hover instead of white", () => {
    const html = renderToStaticMarkup(
      <VoucherUsagesTable
        usages={[
          {
            id: 1,
            userName: "Nguyen Van A",
            className: "IELTS 6.5",
            discountAmount: 100000,
            status: "Success",
            usedAt: "2026-01-01T00:00:00Z",
          },
        ]}
        isLoading={false}
        totalItemsCount={1}
      />,
    )

    expect(html).toContain("hover:bg-slate-50/60 dark:hover:bg-[#242424]")
  })

  it("CannotEditVoucher heading is readable in dark mode", () => {
    const html = renderToStaticMarkup(
      <CannotEditVoucher voucher={{ code: "GV-ABC123", status: "Active" }} />,
    )

    expect(html).toContain("text-primary dark:text-white")
  })
})

describe("CourseStatusPill dark polish", () => {
  it("uses an opaque dark emerald background for TEACHING", () => {
    const html = renderToStaticMarkup(<CourseStatusPill status="TEACHING" />)

    expect(html).toContain("dark:bg-emerald-950/85")
    expect(html).toContain("dark:text-emerald-400")
  })
})
