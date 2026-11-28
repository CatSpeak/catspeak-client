// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { BasicInfoSection } from "./BasicInfoSection"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      vouchers: {
        form: {
          basicInfo: "Thông tin cơ bản",
          codeLabel: "Mã voucher",
          codePlaceholder: "Nhập mã",
          autoGenerate: "Tạo ngẫu nhiên",
          titleLabel: "Tên chương trình",
          titlePlaceholder: "VD: Khuyến mãi",
          descLabel: "Mô tả",
          descPlaceholder: "Mô tả cho voucher này",
        },
        errors: { sensitiveKeyword: "Nội dung chứa từ khóa nhạy cảm" },
      },
    },
  }),
}))

const baseForm = {
  code: "GV-ABC",
  title: "Khuyến mãi",
  description: "",
}

describe("ISS-29: BasicInfoSection fixes", () => {
  it("shows the description validation error", () => {
    const html = renderToStaticMarkup(
      <BasicInfoSection
        form={baseForm}
        errors={{ description: "Mô tả không hợp lệ" }}
        onChange={() => {}}
        onBlur={() => {}}
        onAutoGenerateCode={() => {}}
        isGeneratingCode={false}
      />,
    )

    expect(html).toContain("Mô tả không hợp lệ")
  })

  it("keeps '-' and '_' when normalising the voucher code", async () => {
    const ReactDOM = await import("react-dom/client")
    const { act } = await import("react")
    const onChange = vi.fn()
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(
        <BasicInfoSection
          form={baseForm}
          errors={{}}
          onChange={onChange}
          onBlur={() => {}}
          onAutoGenerateCode={() => {}}
          isGeneratingCode={false}
        />,
      )
    })

    const input = container.querySelector("input")
    expect(input).toBeTruthy()

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set
      setter.call(input, "ab-c_d")
      input.dispatchEvent(new window.Event("input", { bubbles: true }))
    })

    expect(onChange).toHaveBeenCalledWith("code", "GV-AB-C_D")
    await act(async () => root.unmount())
    container.remove()
  })
})
