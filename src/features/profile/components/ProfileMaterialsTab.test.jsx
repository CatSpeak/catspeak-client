// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProfileMaterialsTab from "./ProfileMaterialsTab"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setSearchParams: vi.fn(),
  isTeacher: false,
  isTeacherProfile: false,
  personalCalls: [],
  treeCalls: [],
  searchParams: new URLSearchParams("sharedMaterialToken=invalid"),
  toastError: vi.fn(),
  materialResult: {
    data: null,
    isError: true,
    error: { data: { message: "Not found" } },
    isFetching: false,
  },
  folderResult: {
    data: null,
    isError: true,
    error: { data: { message: "Not found" } },
    isFetching: false,
  },
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
  default: () => ({
    isTeacher: mocks.isTeacher,
    isTeacherProfile: mocks.isTeacherProfile,
  }),
  useRoleOverride: () => ({
    isTeacher: mocks.isTeacher,
    isTeacherProfile: mocks.isTeacherProfile,
  }),
}))

vi.mock("react-hot-toast", () => ({
  default: { error: mocks.toastError },
}))

vi.mock("@/shared/hooks/useTimezone", () => ({
  useTimezone: () => ({ formatDate: (value) => String(value) }),
}))

vi.mock("@/store/api/materialApi", () => ({
  useGetPersonalMaterialsQuery: (...args) => {
    mocks.personalCalls.push(args[1])
    return { data: null, isLoading: false }
  },
  useGetFolderTreeQuery: (...args) => {
    mocks.treeCalls.push(args[1])
    return { data: null, isLoading: false }
  },
  useRecordMaterialDownloadMutation: () => [vi.fn()],
  useRecordFolderDownloadMutation: () => [vi.fn()],
  useGetMaterialByShareTokenQuery: () => mocks.materialResult,
  useGetFolderByShareTokenQuery: () => mocks.folderResult,
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
    mocks.isTeacherProfile = false
    mocks.personalCalls = []
    mocks.treeCalls = []
    mocks.searchParams = new URLSearchParams("sharedMaterialToken=invalid")
    mocks.materialResult = {
      data: null,
      isError: true,
      error: { data: { message: "Not found" } },
      isFetching: false,
    }
    mocks.folderResult = {
      data: null,
      isError: true,
      error: { data: { message: "Not found" } },
      isFetching: false,
    }
  })

  it("keeps Students on their profile instead of the teacher-only materials route", () => {
    render()

    expect(mocks.toastError).toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalledWith(
      "/workspace/materials",
      expect.anything(),
    )
    expect(mocks.setSearchParams).toHaveBeenCalled()
    // R1-1: the router-owned params object must not be mutated in place.
    expect(mocks.searchParams.get("sharedMaterialToken")).toBe("invalid")
    const cleaned = mocks.setSearchParams.mock.calls[0][0]
    expect(cleaned.get("sharedMaterialToken")).toBeNull()
  })

  it("still sends Teachers to /workspace/materials", () => {
    mocks.isTeacher = true

    render()

    expect(mocks.navigate).toHaveBeenCalledWith("/workspace/materials", {
      replace: true,
    })
  })

  it("keeps the documents tab when redirecting to the real owner profile", () => {
    mocks.materialResult = {
      data: { data: { owner: { id: 999 }, name: "Shared file" } },
      isError: false,
      error: null,
      isFetching: false,
    }

    render()

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/workspace/profile/999?tab=documents&sharedMaterialToken=invalid",
      { replace: true },
    )
  })
})

describe("ISS-15: personal material queries stay teacher-only", () => {
  beforeEach(() => {
    mocks.isTeacher = false
    mocks.isTeacherProfile = false
    mocks.personalCalls = []
    mocks.treeCalls = []
    mocks.searchParams = new URLSearchParams()
    mocks.materialResult = {
      data: null,
      isError: false,
      error: null,
      isFetching: false,
    }
    mocks.folderResult = {
      data: null,
      isError: false,
      error: null,
      isFetching: false,
    }
  })

  it("skips both endpoints for a Student owner (no 422 TEACHER_PROFILE_REQUIRED)", () => {
    render()

    expect(mocks.personalCalls.at(-1)).toMatchObject({ skip: true })
    expect(mocks.treeCalls.at(-1)).toMatchObject({ skip: true })
  })

  it("calls both endpoints for an approved Teacher owner", () => {
    mocks.isTeacher = true
    mocks.isTeacherProfile = true

    render()

    expect(mocks.personalCalls.at(-1)).toMatchObject({ skip: false })
    expect(mocks.treeCalls.at(-1)).toMatchObject({ skip: false })
  })
})
