// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProfileMaterialsTab from "./ProfileMaterialsTab"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setSearchParams: vi.fn(),
  isTeacher: false,
  searchParams: new URLSearchParams("sharedMaterialToken=invalid"),
  toastError: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
  useSearchParams: () => [mocks.searchParams, mocks.setSearchParams],
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: { materials: { materialNotFound: "Not found" } } }),
}))

vi.mock("@/features/courses/components/RoleSwitcher", () => ({
  default: () => ({ isTeacher: mocks.isTeacher }),
  useRoleOverride: () => ({ isTeacher: mocks.isTeacher }),
}))

vi.mock("react-hot-toast", () => ({
  default: { error: mocks.toastError },
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatDate: (value) => String(value) }),
}))

const notFound = { data: { message: "Not found" } }

vi.mock("@/store/api/materialApi", () => ({
  useGetPersonalMaterialsQuery: () => ({ data: null, isLoading: false }),
  useGetFolderTreeQuery: () => ({ data: null, isLoading: false }),
  useRecordMaterialDownloadMutation: () => [vi.fn()],
  useRecordFolderDownloadMutation: () => [vi.fn()],
  useGetMaterialByShareTokenQuery: () => ({
    data: null,
    isError: true,
    error: notFound,
    isFetching: false,
  }),
  useGetFolderByShareTokenQuery: () => ({
    data: null,
    isError: true,
    error: notFound,
    isFetching: false,
  }),
  useGetPublicMaterialsByUserIdQuery: () => ({ data: null, isLoading: false }),
}))

vi.mock("@/shared/components/ui/inputs/SearchInput", () => ({
  default: () => null,
}))
vi.mock("@/shared/components/ui/buttons", () => ({
  IconButton: () => null,
}))
vi.mock("@/shared/components/ChipFilter", () => ({ default: () => null }))
vi.mock("./ProfileFolderItem", () => ({ default: () => null }))
vi.mock("./ProfileFileItem", () => ({ default: () => null }))
vi.mock("./ProfileMaterialsSkeleton", () => ({ default: () => null }))
vi.mock("@/shared/components/ui/FluentCard", () => ({
  default: ({ children }) => <div>{children}</div>,
}))
vi.mock("@/shared/components/ui/indicators", () => ({
  EmptyState: () => null,
}))
vi.mock("@/shared/components/ui/FilePreviewModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/ShareMaterialModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/DeleteFolderModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/PublicMaterialModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/FileDetailModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/MoveMaterialModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/RenameMaterialModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/BulkActionBar", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/components/teaching-material/SaveSharedMaterialModal", () => ({
  default: () => null,
}))
vi.mock("@/features/materials/utils/zipDownloader", () => ({
  downloadFolderAsZip: vi.fn(),
}))
vi.mock("@/features/materials/utils/materialUtils", () => ({
  formatSize: () => "",
  isFolder: () => false,
  flattenFolders: () => [],
  downloadFile: vi.fn(),
}))

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(
      <ProfileMaterialsTab targetAccountId={446} isOwnProfile />,
    )
  })
  return container
}

describe("ISS-73: ProfileMaterialsTab invalid shared token destination", () => {
  beforeEach(() => {
    mocks.navigate.mockClear()
    mocks.setSearchParams.mockClear()
    mocks.toastError.mockClear()
    mocks.isTeacher = false
    mocks.searchParams = new URLSearchParams("sharedMaterialToken=invalid")
  })

  it("keeps Students on their profile instead of the teacher-only materials route", () => {
    render()

    expect(mocks.toastError).toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalledWith(
      "/workspace/materials",
      expect.anything(),
    )
    expect(mocks.setSearchParams).toHaveBeenCalled()
  })

  it("still sends Teachers to /workspace/materials", () => {
    mocks.isTeacher = true

    render()

    expect(mocks.navigate).toHaveBeenCalledWith("/workspace/materials", {
      replace: true,
    })
  })
})
