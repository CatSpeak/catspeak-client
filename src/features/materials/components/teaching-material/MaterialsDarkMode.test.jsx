// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FolderItem from "./FolderItem"
import FileItem from "./FileItem"
import FileDetailModal from "./FileDetailModal"
import UploadMaterialModal from "./UploadMaterialModal"

const mocks = vi.hoisted(() => ({
  updateSettings: vi.fn(),
  recordDownload: vi.fn(),
  generateShareToken: vi.fn(),
  recordView: vi.fn(),
  startTask: vi.fn(),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      materials: {
        download: "Tải xuống",
        share: "Chia sẻ",
        rename: "Đổi tên",
        move: "Di chuyển",
        unfavorite: "Bỏ yêu thích",
        addToFavorites: "Yêu thích",
        delete: "Xóa",
        detailsAndSettings: "Chi tiết",
        public: "Công khai",
        detailsAndSettingsHeader: "Chi tiết và cài đặt",
        fileInfo: "Thông tin tệp",
        type: "Loại",
        file: "Tệp",
        size: "Kích thước",
        uploadDate: "Ngày tải lên",
        publicShare: "Chia sẻ công khai",
        publicShareDesc: "Mô tả",
        shareLink: "Liên kết chia sẻ",
        noLink: "Chưa có liên kết",
        copiedLink: "Đã sao chép",
        copy: "Sao chép",
        allowDownload: "Cho phép tải",
        allowDownloadDescShort: "Mô tả",
        statistics: "Thống kê",
        views: "Lượt xem",
        downloads: "Lượt tải",
        updateShareStatusSuccess: "OK",
        updateShareStatusError: "Lỗi",
        updateDownloadPermSuccess: "OK",
        updateDownloadPermError: "Lỗi",
        uploadMaterialTitle: "Tải lên tài liệu",
        dragDropFileOr: "Kéo thả tệp hoặc ",
        selectFile: "chọn tệp",
        supportedFormats: "Định dạng hỗ trợ",
        uploadLimits: "Giới hạn",
        uploadListTitle: "Tệp ({{count}})",
        saveToFolder: "Lưu vào thư mục",
        publicShareOnUpload: "Chia sẻ công khai",
        rootFolderDefault: "Thư mục gốc",
        cancel: "Hủy",
        upload: "Tải lên",
        fileExceedsSizeLimit: "Quá lớn {{name}}",
        fileUnsupportedFormat: "Sai định dạng {{name}}",
        someFilesSkipped: "Bỏ qua",
        maxFilesExceeded: "Tối đa",
        cannotReadFile: "Không đọc được {{name}}",
        noValidFilesToUpload: "Không có tệp",
        uploadSuccessCount: "OK {{count}}",
        uploadError: "Lỗi",
        ready: "Sẵn sàng",
        complete: "Hoàn tất",
        uploadErrorStatus: "Lỗi",
        failed: "Thất bại",
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/Dropdown", () => ({
  default: ({ trigger }) => (
    <div data-testid="dropdown-trigger">
      {typeof trigger === "function" ? trigger(false, null, () => {}) : null}
    </div>
  ),
}))

vi.mock("@/shared/components/ui/FilePreview", () => ({ default: () => null }))

vi.mock("@/shared/components/ui/Modal", () => ({
  default: ({ open, children, footer }) =>
    open ? (
      <div data-testid="modal-root">
        {children}
        {footer}
      </div>
    ) : null,
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatDate: () => "01/01/2026" }),
}))

vi.mock("@/shared/hooks/useGlobalTask", () => ({
  useGlobalTask: () => ({ startTask: mocks.startTask, tasks: [] }),
}))

vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
}))

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("@/store/api/materialApi", () => ({
  useUpdateMaterialSettingsMutation: () => [
    mocks.updateSettings,
    { isLoading: false },
  ],
  useRecordMaterialDownloadMutation: () => [mocks.recordDownload],
  useGenerateMaterialShareTokenMutation: () => [
    mocks.generateShareToken,
    { isLoading: false },
  ],
  useRecordMaterialViewMutation: () => [mocks.recordView],
  useGetFolderTreeQuery: () => ({ data: [], isLoading: false }),
  materialApi: { util: { invalidateTags: vi.fn() } },
}))

let container
let root

const mount = (element) => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(element)
  })
  return container
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  mocks.recordView.mockResolvedValue(undefined)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  document.body.innerHTML = ""
})

describe("ISS-24: teaching materials support dark mode", () => {
  it("renders the FolderItem card with dark surfaces and keeps onClick", () => {
    const onClick = vi.fn()
    const view = mount(
      <FolderItem
        title="Bài giảng"
        totalItems="3 tài liệu"
        updatedAt="01/01/2026"
        onClick={onClick}
      />,
    )

    const card = view.firstElementChild
    expect(card.className).toContain("dark:bg-[#1A1A1A]")
    expect(card.className).toContain("dark:border-[#3F3F3F]")
    expect(card.className).toContain("dark:hover:bg-[#2B1719]")

    act(() => {
      card.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("renders the selected FolderItem with the dark selected palette", () => {
    const view = mount(
      <FolderItem title="Bài giảng" isSelected onClick={vi.fn()} />,
    )

    const card = view.firstElementChild
    expect(card.className).toContain("dark:bg-[#3A161A]")
    expect(card.className).toContain("dark:border-[#FF7A8A]")
  })

  it("renders the FileItem card, thumbnail and public badge with dark classes", () => {
    const view = mount(
      <FileItem
        title="Bài 1.pdf"
        size="1 KB"
        date="01/01/2026"
        isPublic
        layout="grid"
        onClick={vi.fn()}
      />,
    )

    const card = view.firstElementChild
    expect(card.className).toContain("dark:bg-[#1A1A1A]")
    expect(card.className).toContain("dark:border-[#3F3F3F]")

    expect(view.innerHTML).toContain("dark:bg-[#242424]")

    const badge = [...view.querySelectorAll("span")].find(
      (node) => node.textContent === "Công khai",
    )
    expect(badge).toBeTruthy()
    expect(badge.className).toContain("dark:bg-amber-950/60")
    expect(badge.className).toContain("dark:text-amber-300")
  })

  it("renders the FileItem list layout with dark classes", () => {
    const view = mount(
      <FileItem
        title="Bài 1.pdf"
        size="1 KB"
        date="01/01/2026"
        isPublic
        layout="list"
        onClick={vi.fn()}
      />,
    )

    const card = view.firstElementChild
    expect(card.className).toContain("dark:bg-[#1A1A1A]")
    expect(view.innerHTML).toContain("dark:bg-[#242424]")
  })

  it("renders FileDetailModal with dark surface and border classes", () => {
    const view = mount(
      <FileDetailModal
        open
        onClose={vi.fn()}
        item={{
          id: 1,
          fileName: "Bài 1.pdf",
          fileSize: 1024,
          fileUrl: "https://example.com/bai-1.pdf",
          isPublic: true,
          allowDownload: true,
          viewCount: 2,
          downloadCount: 1,
        }}
      />,
    )

    const html = view.innerHTML
    expect(html).toContain("dark:bg-[#1A1A1A]")
    expect(html).toContain("dark:border-[#3F3F3F]")
    expect(html).toContain("dark:text-white")
  })

  it("renders UploadMaterialModal with dark drop zone and surface classes", () => {
    const view = mount(
      <UploadMaterialModal open onClose={vi.fn()} currentFolderId="" />,
    )

    const html = view.innerHTML
    expect(html).toContain("dark:bg-[#242424]")
    expect(html).toContain("dark:border-[#3F3F3F]")
    expect(html).toContain("dark:text-white")
  })
})
