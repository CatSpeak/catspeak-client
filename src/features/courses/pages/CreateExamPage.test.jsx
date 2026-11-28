// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CreateExamPage from "./CreateExamPage"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const previewDict = {
  bannerText: "Bạn đang xem trước bài kiểm tra",
  backToEdit: "Quay lại chỉnh sửa",
  confirmPublish: "Xác nhận đăng",
  progress: "Tiến độ",
  unnamedExam: "Bài kiểm tra chưa đặt tên",
  emptyQuestions: "Chưa có câu hỏi",
  points: "điểm",
  previewLabel: "Xem trước",
}

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: "26" }),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/workspace/courses/class/26/create-exam" }),
  useSearchParams: () => [new URLSearchParams(""), vi.fn()],
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    language: "vi",
    t: {
      courses: {
        createExam: { previewLabel: "Xem trước", preview: previewDict },
      },
    },
  }),
}))

vi.mock("@/shared/context/SidebarContext", () => ({
  useSidebar: () => ({ isDesktopExpanded: true }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({
    userTimeZone: "Asia/Ho_Chi_Minh",
    formatDateTime: () => "01/01/2026",
    formatDate: () => "01/01/2026",
    formatTime: () => "10:00",
  }),
}))

vi.mock("react-hot-toast", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock("@/store/api/coursesApi", () => ({
  useGetClassDetailQuery: () => ({
    currentData: { id: 26, name: "Lớp 26" },
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useGetTeacherQuizDetailQuery: () => ({
    currentData: undefined,
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useCreateTeacherQuizMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateTeacherQuizMutation: () => [vi.fn(), { isLoading: false }],
  usePublishTeacherQuizMutation: () => [vi.fn(), { isLoading: false }],
  useDownloadQuizTemplateMutation: () => [vi.fn(), { isLoading: false }],
  useImportTeacherQuestionsPreviewMutation: () => [
    vi.fn(),
    { isLoading: false },
  ],
}))

vi.mock("@/shared/components/ui/indicators", () => ({
  LoadingSpinner: () => null,
}))
vi.mock("@/shared/components/ui/navigation/Breadcrumb", () => ({
  default: () => null,
}))
vi.mock("@/shared/components/ui/inputs", () => ({
  DatePicker: () => null,
  Switch: () => null,
}))
vi.mock("@/shared/components/ui/RenderHTML", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/buttons", () => ({
  IconButton: ({ children, ...props }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}))
vi.mock("@tinymce/tinymce-react", () => ({ Editor: () => null }))
vi.mock("@/features/courses/components/grading/TeacherQuizDetailView", () => ({
  default: () => null,
}))
vi.mock(
  "@/features/courses/components/grading/ImportExcelInstructionModal",
  () => ({ default: () => null }),
)
vi.mock("@/features/courses/components/grading/QuestionCard", () => ({
  default: () => null,
}))

const renderPage = () => renderToStaticMarkup(<CreateExamPage />)

describe("ISS-67: CreateExamPage preview visuals", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("renders the editor without invalid Tailwind classes", () => {
    const html = renderPage()
    expect(html).not.toContain("bg-red-650")
    expect(html).not.toContain("text-gray-750")
    expect(html).not.toContain("text-gray-450")
  })

  it("renders a visible #990011 dot and a 16px gap under the preview banner", async () => {
    const ReactDOM = await import("react-dom/client")
    const { act } = await import("react")
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)

    await act(async () => {
      root.render(<CreateExamPage />)
    })

    const previewButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.getAttribute("title") === "Xem trước",
    )
    expect(previewButton).toBeTruthy()

    await act(async () => {
      previewButton.dispatchEvent(new window.MouseEvent("click", { bubbles: true }))
    })

    const html = container.innerHTML
    expect(html).toContain("bg-[#990011]")
    expect(html).not.toContain("bg-red-650")
    expect(html).toMatch(/mx-6 mt-4/)

    await act(async () => root.unmount())
    container.remove()
  })
})
