import { renderToStaticMarkup } from "react-dom/server"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import viCopy from "../i18n/vi"

let PlacementProfilePage

const readResultMock = vi.fn()
const navigateMock = vi.fn()
const cooldownProps = { current: null }
const roadmapProps = { current: null }
const createSessionState = { value: { isLoading: false, error: null } }
const defaultRetakeStatus = {
  currentHskLevel: 2,
  hasHistory: true,
  eligible: false,
  lastTestedAt: Date.now() - 86_400_000,
  eligibleRetakeAt: Date.now() + 12 * 86_400_000,
  daysRemaining: 13,
  daysElapsed: 1,
  progress: 7,
  totalDays: 14,
}
const retakeStatusState = { value: defaultRetakeStatus }

vi.mock("../utils/sessionStorage", async (importOriginal) => ({
  ...(await importOriginal()),
  readResult: (...args) => readResultMock(...args),
}))

vi.mock("../api", () => ({
  useGetRetakeStatusQuery: () => ({ data: retakeStatusState.value }),
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
  retakeStatusState.value = { ...defaultRetakeStatus }
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

  it("renders the server attempt when the browser cache is gone", () => {
    readResultMock.mockReturnValue(null)
    retakeStatusState.value = {
      ...defaultRetakeStatus,
      lastAttempt: {
        sessionId: "psess_750a5e2bdff2472c",
        code: "psess_750a5e2bdff2472c",
        finalHskLevel: 1,
        turnCount: 5,
        scoredAt: Date.now() - 86_400_000,
        scores: {
          pronunciation: 10,
          vocabulary: 10,
          grammar: 10,
          fluency: 10,
          ahiTotal: 99,
        },
        selfAdjusted: true,
        adjustedFromHskLevel: 1,
      },
    }

    const html = renderToStaticMarkup(<PlacementProfilePage />)

    expect(html).toContain("HSK 2")
    expect(html).toContain("Điểm: 10 / 100")
    expect(html).toContain("#psess_750a5e2bdff2472c")
    expect(html).toContain("Đánh Giá 4 Kỹ Năng Khẩu Ngữ Đầu Vào")
    expect(html).toContain("Cấp độ đã được tự điều chỉnh từ HSK 1 sang HSK 2.")
    expect(html).not.toContain("70 / 100")
    expect(html).not.toContain("99 / 100")
  })

  it("prefers the server attempt when it is newer than the local result", () => {
    readResultMock.mockReturnValue({
      band: 1,
      code: "psess_local",
      scoredAt: new Date(2026, 9, 10, 12).getTime(),
      pronunciation: 30,
      vocabulary: 30,
      grammar: 30,
      fluency: 30,
    })
    retakeStatusState.value = {
      ...defaultRetakeStatus,
      lastAttempt: {
        sessionId: "psess_server_newer",
        code: "psess_server_newer",
        finalHskLevel: 1,
        turnCount: 5,
        scoredAt: new Date(2026, 9, 15, 12).getTime(),
        scores: {
          pronunciation: 40,
          vocabulary: 40,
          grammar: 40,
          fluency: 40,
          ahiTotal: 99,
        },
        selfAdjusted: true,
        adjustedFromHskLevel: 1,
      },
    }

    const html = renderToStaticMarkup(<PlacementProfilePage />)

    expect(html).toContain("#psess_server_newer")
    expect(html).not.toContain("#psess_local")
    expect(html).toContain("Điểm: 40 / 100")
    expect(html).toContain("Ngày thi: 15/10/2026")
    expect(html).toContain("Cấp độ đã được tự điều chỉnh từ HSK 1 sang HSK 2.")
  })

  it("prefers the newer local result over an older server attempt", () => {
    readResultMock.mockReturnValue({
      band: 2,
      code: "psess_local_newer",
      scoredAt: new Date(2026, 9, 20, 12).getTime(),
      pronunciation: 60,
      vocabulary: 60,
      grammar: 60,
      fluency: 60,
    })
    retakeStatusState.value = {
      ...defaultRetakeStatus,
      lastAttempt: {
        sessionId: "psess_server_older",
        code: "psess_server_older",
        finalHskLevel: 1,
        turnCount: 5,
        scoredAt: new Date(2026, 9, 10, 12).getTime(),
        scores: {
          pronunciation: 10,
          vocabulary: 10,
          grammar: 10,
          fluency: 10,
          ahiTotal: 99,
        },
        selfAdjusted: false,
        adjustedFromHskLevel: null,
      },
    }

    const html = renderToStaticMarkup(<PlacementProfilePage />)

    expect(html).toContain("#psess_local_newer")
    expect(html).not.toContain("#psess_server_older")
    expect(html).toContain("Điểm: 60 / 100")
    expect(html).toContain("Ngày thi: 20/10/2026")
  })

  it("does not copy a skill score from a different attempt into a legacy local result", () => {
    readResultMock.mockReturnValue({
      band: 2,
      code: null,
      scoredAt: Date.now(),
      pronunciation: null,
      vocabulary: 10,
      grammar: 10,
      fluency: 10,
    })
    retakeStatusState.value = {
      ...defaultRetakeStatus,
      lastAttempt: {
        sessionId: "psess_server",
        code: "psess_server",
        finalHskLevel: 1,
        turnCount: 5,
        scoredAt: Date.now() - 86_400_000,
        scores: {
          pronunciation: 80,
          vocabulary: 20,
          grammar: 20,
          fluency: 20,
          ahiTotal: 99,
        },
        selfAdjusted: false,
        adjustedFromHskLevel: null,
      },
    }

    const html = renderToStaticMarkup(<PlacementProfilePage />)

    // The local attempt wins on scoredAt. Its missing code cannot be borrowed
    // from the different server attempt, and its null pronunciation stays null.
    expect(html).not.toContain("psess_server")
    expect(html).toContain("Chưa đo được")
    expect(html).not.toContain("80 / 100")
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

  it("names the roadmap after the current level, not the next target band", () => {
    readResultMock.mockReturnValue({
      band: 2,
      code: "psess_own",
      scoredAt: Date.now(),
    })

    renderToStaticMarkup(<PlacementProfilePage />)

    // Oracle: the 5-day module names its cycle "Lộ trình HSK {currentLevel}"
    // (CycleProgressBar.jsx:34). The profile card used the next target band,
    // so after adjusting to HSK 2 it read "Lên HSK 3" while the module read
    // "HSK 1" (user report 2026-10-31).
    expect(roadmapProps.current.band).toBe(2)
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
