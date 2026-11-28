// @vitest-environment happy-dom
import React, { act, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import CreateBulletinBoardModal from "./CreateBulletinBoardModal"

const mocks = vi.hoisted(() => ({
  theme: { isDark: true, resolvedTheme: "dark" },
  editorProps: null,
  mounts: 0,
}))

vi.mock("@/shared/context/ThemeContext", () => ({
  useTheme: () => mocks.theme,
}))

vi.mock("@tinymce/tinymce-react", () => ({
  Editor: (props) => {
    mocks.editorProps = props
    useEffect(() => {
      mocks.mounts += 1
    }, [])
    return <div data-testid="tinymce-editor" />
  },
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      courses: {
        lectureHall: {
          modals: { createBoard: {} },
          createPost: {},
        },
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/Modal", () => ({
  default: ({ open, children }) => (open ? <div>{children}</div> : null),
}))

let container
let root

const render = () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<CreateBulletinBoardModal open onClose={vi.fn()} onSubmit={vi.fn()} />)
  })
  return container
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  mocks.theme = { isDark: true, resolvedTheme: "dark" }
  mocks.editorProps = null
  mocks.mounts = 0
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  document.body.innerHTML = ""
})

describe("ISS-64: CreateBulletinBoardModal follows the live theme", () => {
  it("initializes TinyMCE with oxide-dark in dark mode", () => {
    render()

    expect(mocks.editorProps.init.skin).toBe("oxide-dark")
    expect(mocks.editorProps.init.content_css).toBe("dark")
  })

  it("re-mounts the editor with the light skin when the theme changes", () => {
    render()
    expect(mocks.mounts).toBe(1)
    expect(mocks.editorProps.init.skin).toBe("oxide-dark")

    mocks.theme = { isDark: false, resolvedTheme: "light" }
    act(() => {
      root.render(
        <CreateBulletinBoardModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
      )
    })

    expect(mocks.mounts).toBe(2)
    expect(mocks.editorProps.init.skin).toBe("oxide")
    expect(mocks.editorProps.init.content_css).toBe("default")
  })
})
