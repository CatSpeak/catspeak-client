import { renderToStaticMarkup } from "react-dom/server"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import viCopy from "../i18n/vi"

let PlacementTestPage

// The plan gate must follow the same source the AI API enforces
// (GET /api/v1/Plans/placement-permission, see
// catspeak-ai/.../api/routes/placement.py:90-103), not the my-usage feature list.
const permissionState = { data: { isAllowed: true }, isLoading: false }
const createSessionState = { isLoading: false, error: null }
const legacyFeatureAllowed = { value: true }

vi.mock("@/store/api/plansApi", () => ({
  useGetPlacementPermissionQuery: () => permissionState,
  useGetMyUsageQuery: () => ({ data: null, isLoading: false }),
}))

vi.mock("@/shared/hooks/usePlanFeatures", () => ({
  usePlanFeatures: () => ({
    hasFeature: () => legacyFeatureAllowed.value,
    isLoading: false,
  }),
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: viCopy }),
}))

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { accountId: 202 },
    isAuthenticated: true,
  }),
}))

vi.mock("../api", () => ({
  useGetRetakeStatusQuery: () => ({ data: null, isLoading: false }),
  useCreateSessionMutation: () => [vi.fn(), createSessionState],
}))

vi.mock("../hooks/useMicrophonePermission", () => ({
  default: () => ({ requesting: false, request: vi.fn() }),
}))

vi.mock("../hooks/useSessionResume", () => ({
  default: () => ({ loaded: true, lifecycle: null, creating: false }),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

beforeAll(async () => {
  const map = new Map()
  vi.stubGlobal("localStorage", {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  })
  PlacementTestPage = (await import("./PlacementTestPage")).default
})

beforeEach(() => {
  permissionState.data = { isAllowed: true }
  permissionState.isLoading = false
  createSessionState.error = null
  legacyFeatureAllowed.value = true
})

describe("PlacementTestPage plan access", () => {
  it("blocks entry from the enforced placement permission before mic consent", () => {
    // Reported context: my-usage says the feature is available, the enforced
    // permission says it is not.
    permissionState.data = { isAllowed: false }
    legacyFeatureAllowed.value = true

    const html = renderToStaticMarkup(<PlacementTestPage />)

    expect(html).toContain(viCopy.placementTest.planRequiredTitle)
    expect(html).toContain(viCopy.placementTest.planRequiredSubtext)
    expect(html).not.toContain(viCopy.placementTest.consent.heading)
  })

  it("shows the plan gate with the upgrade action when start-session is denied by the plan", () => {
    createSessionState.error = {
      status: 403,
      data: {
        detail: {
          code: "FEATURE_NOT_IN_PLAN",
          errorCode: "AI_PLACEMENT_TEST_FORBIDDEN",
          error_code: "FEATURE_NOT_IN_PLAN",
          message:
            "Tính năng Đánh giá trình độ (Placement Test) không khả dụng trong gói hiện tại. Vui lòng nâng cấp gói để sử dụng!",
        },
      },
    }

    const html = renderToStaticMarkup(<PlacementTestPage />)

    expect(html).toContain(viCopy.placementTest.planRequiredTitle)
    expect(html).toContain("Upgrade to Pro")
  })
})
