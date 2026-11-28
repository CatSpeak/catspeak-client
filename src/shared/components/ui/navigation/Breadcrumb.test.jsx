import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import Breadcrumb from "./Breadcrumb"

describe("ISS-75: Breadcrumb links meet AA contrast in light mode", () => {
  const html = renderToStaticMarkup(
    <Breadcrumb
      items={[
        { label: "Workspace", onClick: () => {} },
        { label: "Materials" },
      ]}
    />,
  )

  it("uses the darker #595959 token for links and separators", () => {
    expect(html).toContain("text-[#595959]")
    expect(html).not.toContain("text-[#7b7979]")
  })

  it("keeps the dark-mode #AAAAAA token", () => {
    expect(html).toContain("dark:text-[#AAAAAA]")
  })
})
