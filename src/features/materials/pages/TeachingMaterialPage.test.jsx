// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import TeachingMaterialPage from "./TeachingMaterialPage"

const api = vi.hoisted(() => ({
  personalMaterials: vi.fn(() => ({ data: [], isLoading: false })),
  bookmarkedMaterials: vi.fn(() => ({ data: [], isLoading: false })),
  recordDownload: vi.fn(() => [vi.fn()]),
  folderTree: vi.fn(() => ({ data: [] })),
  bookmarkFolder: vi.fn(() => [vi.fn()]),
  bookmarkMaterial: vi.fn(() => [vi.fn()]),
  deletionImpact: vi.fn(() => ({ data: null, isFetching: false })),
  personalMaterialById: vi.fn(() => ({ data: null })),
}))

vi.mock("@/store/api/materialApi", () => ({
  useGetPersonalMaterialsQuery: api.personalMaterials,
  useGetBookmarkedMaterialsQuery: api.bookmarkedMaterials,
  useRecordMaterialDownloadMutation: api.recordDownload,
  useGetFolderTreeQuery: api.folderTree,
  useBookmarkFolderMutation: api.bookmarkFolder,
  useBookmarkMaterialMutation: api.bookmarkMaterial,
  useGetDeletionImpactQuery: api.deletionImpact,
  useGetPersonalMaterialByIdQuery: api.personalMaterialById,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      materials: {
        home: "Trang chủ",
        title: "Tài liệu của tôi",
        folder: "Thư mục",
        createFolder: "Tạo thư mục mới",
        uploadMaterial: "Tải lên tài liệu",
        searchPlaceholder: "Tìm kiếm tài liệu...",
        filter: "Lọc",
        sortBy: "Sắp xếp",
        loading: "Đang tải...",
        emptyFolder: "Thư mục trống",
        uploadPrompt: "Tải lên tài liệu đầu tiên",
        folders: "Thư mục",
        files: "Tệp",
        searchResults: "Kết quả tìm kiếm",
        zeroResults: "Không có kết quả",
        sortOptions: {
          nameAsc: "Tên A-Z",
          nameDesc: "Tên Z-A",
          newest: "Mới nhất",
          oldest: "Cũ nhất",
          sizeAsc: "Kích thước tăng",
          sizeDesc: "Kích thước giảm",
        },
      },
    },
  }),
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatDate: () => "01/01/2026" }),
}))

vi.mock("@/shared/hooks/useContextMenu", () => ({
  useContextMenu: () => ({
    isOpen: false,
    position: { x: 0, y: 0 },
    handleContextMenu: vi.fn(),
    closeContextMenu: vi.fn(),
  }),
}))

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("../utils/materialUtils", () => ({
  downloadFile: vi.fn(),
  formatSize: () => "1 KB",
}))
vi.mock("../utils/zipDownloader", () => ({
  downloadFolderAsZip: vi.fn(),
  downloadMultipleItemsAsZip: vi.fn(),
}))

const stub = vi.hoisted(() => () => null)
vi.mock("../components/teaching-material/FolderItem", () => ({ default: stub }))
vi.mock("../components/teaching-material/FileItem", () => ({ default: stub }))
vi.mock("../components/teaching-material/EmptySearchState", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/CreateFolderModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/UploadMaterialModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/ShareMaterialModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/DeleteFolderModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/FileDetailModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/FilterMaterialModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/MoveMaterialModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/RenameMaterialModal", () => ({
  default: stub,
}))
vi.mock("../components/teaching-material/BulkActionBar", () => ({
  default: stub,
}))
vi.mock("@/shared/components/ui/FilePreviewModal", () => ({ default: stub }))
vi.mock("@/shared/components/ui/Dropdown", () => ({ default: stub }))
vi.mock("@/shared/components/ui/ContextMenu", () => ({ default: stub }))

const renderPage = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={["/workspace/materials/14"]}>
      <Routes>
        <Route
          path="/workspace/materials/:folderId"
          element={<TeachingMaterialPage />}
        />
      </Routes>
    </MemoryRouter>,
  )

describe("ISS-19/ISS-20: TeachingMaterialPage header actions and folder fetch", () => {
  beforeEach(() => {
    api.personalMaterialById.mockClear()
  })

  it("renders both header action buttons on every breakpoint (no md:hidden)", () => {
    const html = renderPage()

    expect(html).toContain("Tạo thư mục mới")
    expect(html).toContain("Tải lên tài liệu")
    // The header actions container must not be hidden on md+ anymore.
    expect(html).toContain("md:w-auto md:flex-none")
    expect(html).not.toContain("flex w-full flex-row gap-2 md:hidden")
  })

  it("never requests GET /personal-materials/14 for a folder", () => {
    renderPage()
    expect(api.personalMaterialById).not.toHaveBeenCalled()
  })
})
