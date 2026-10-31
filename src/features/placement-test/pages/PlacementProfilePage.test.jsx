import { renderToStaticMarkup } from "react-dom/server"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import viCopy from "../i18n/vi"

let PlacementProfilePage

const readResultMock = vi.fn()
const navigateMock = vi.fn()
const cooldownProps = { current: null }
const roadmapProps = { current: null }
const createSessionState = { value: { isLoading: false, error: null } }

vi.mock("../utils/sessionStorage", async (importOriginal) => ({
  ...(await importOriginal()),
  readResult: (...args) => readResultMock(...args),
}))

vi.mock("../api", () => ({
  useGetRetakeStatusQuery: () => ({
    data: {
      currentHskLevel: 2,
      hasHistory: true,
      eligible: false,
      lastTestedAt: Date.now() - 86_400_000,
      eligibleRetakeAt: Date.now() + 12 * 86_400_000,
      daysRemaining: 13,
      daysElapsed: 1,
      progress: 7,
      totalDays: 14,
    },
  }),
  useCreateSessionMutation: () => [vi.fn(), createSessionState.value],
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: viCopy }),
}))

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { accountId: 202, username: "hoangle102003" },
    isAuthenticated: true,
  }),
}))

vi.mock("@/shared/hooks/usePlanFeatures", () => ({
  usePlanFeatures: () => ({ hasFeature: () => true, isLoading: false }),
}))

vi.mock("@/store/api/plansApi", () => ({
  useGetPlacementPermissionQuery: () => ({
    data: { isAllowed: true },
    isLoading: false,
  }),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
  useParams: () => ({ lang: "zh" }),
}))

vi.mock("../components/profile/ProfileCooldownCard", () => ({
  default: (props) => {
    cooldownProps.current = props
    return null
  },
}))

vi.mock("../components/profile/ProfileRoadmapCard", () => ({
  default: (props) => {
    roadmapProps.current = props
    return null
  },
}))

vi.mock("../components/profile/ConfirmRetakeModal", () => ({
  default: () => null,
}))

beforeAll(async () => {
  const map = new Map()
  vi.stubGlobal("localStorage", {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  })
  PlacementProfilePage = (await import("./PlacementProfilePage")).default
})

beforeEach(() => {
  readResultMock.mockReset()
  navigateMock.mockReset()
  cooldownProps.current = null
  roadmapProps.current = null
  createSessionState.value = { isLoading: false, error: null }
})

describe("PlacementProfilePage score sourcing", () => {
  it("shows the server band without inventing a score when no cache belongs to the user", () => {
    readResultMock.mockReturnValue(null)

    const html = renderToStaticMarkup(<PlacementProfilePage />)

    expect(html).toContain("HSK 2")
    expect(html).not.toContain("Điểm:")
    expect(html).not.toContain("70 / 100")
    expect(html).not.toContain("Đánh Giá 4 Kỹ Năng Khẩu Ngữ Đầu Vào")
  })

  it("renders the cached result when it belongs to the signed-in user", () => {
    readResultMock.mockReturnValue({
      band: 2,
      code: "psess_own",
      scoredAt: Date.now(),
      pronunciation: 60,
      vocabulary: 80,
      grammar: 40,
      fluency: 20,
    })

    const html = renderToStaticMarkup(<PlacementProfilePage />)

    expect(html).toContain("Điểm: 50 / 100")
    expect(html).toContain("#psess_own")
    expect(html).toContain("Đánh Giá 4 Kỹ Năng Khẩu Ngữ Đầu Vào")
  })

  it("opens the 5-day learning path when the cooldown CTA is pressed", () => {
    readResultMock.mockReturnValue({
      band: 2,
      code: "psess_own",
      scoredAt: Date.now(),
    })

    renderToStaticMarkup(<PlacementProfilePage />)
    cooldownProps.current.onContinue()

    expect(navigateMock).toHaveBeenCalledWith("/zh/ai-tutor/learning-path")
  })

  it("opens the learning path at the next roadmap day from the roadmap CTA", () => {
    readResultMock.mockReturnValue({
      band: 2,
      code: "psess_own",
      scoredAt: Date.now(),
    })

    renderToStaticMarkup(<PlacementProfilePage />)
    roadmapProps.current.onContinue()

    // progress 7% of the 14-day cooldown -> 0 of 5 roadmap days completed -> Day 1
    expect(navigateMock).toHaveBeenCalledWith(
      "/zh/ai-tutor/learning-path?day=1",
    )
  })

  it("shows the plan gate when the retake is denied by the plan", () => {
    readResultMock.mockReturnValue({
      band: 2,
      code: "psess_own",
      scoredAt: Date.now(),
    })
    createSessionState.value = {
      isLoading: false,
      error: {
        status: 403,
        data: {
          detail: {
            code: "FEATURE_NOT_IN_PLAN",
            errorCode: "AI_PLACEMENT_TEST_FORBIDDEN",
          },
        },
      },
    }

    const html = renderToStaticMarkup(<PlacementProfilePage />)

    expect(html).toContain(viCopy.placementTest.planRequiredTitle)
    expect(html).not.toContain("Đánh Giá 4 Kỹ Năng Khẩu Ngữ Đầu Vào")
  })
})
