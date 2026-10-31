import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import viCopy from "../i18n/vi"

let PlacementResultPage

const adjustMock = vi.fn()
const changeLevelMock = vi.fn()
const skillsProps = { current: null }
const modalProps = { current: null }
const readResultMock = vi.fn()
const toastMock = { success: vi.fn(), info: vi.fn(), error: vi.fn() }

vi.mock("../api", () => ({
  useAdjustLevelMutation: () => [adjustMock, { isLoading: false }],
}))

vi.mock("@/features/learning-path/api/learningPathApi", () => ({
  useChangeLevelMutation: () => [changeLevelMock, { isLoading: false }],
}))

vi.mock("../utils/sessionStorage", async (importOriginal) => ({
  ...(await importOriginal()),
  readResult: (...args) => readResultMock(...args),
  readActiveSession: () => null,
}))

vi.mock("@/components/ui/toast", () => ({ toast: toastMock }))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: viCopy }),
}))

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: { accountId: 202, username: "hoangle102003" } }),
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

vi.mock("../components/result/ResultSkillsCard", () => ({
  default: (props) => {
    skillsProps.current = props
    return null
  },
}))

vi.mock("../components/result/AdjustLevelModal", () => ({
  default: (props) => {
    modalProps.current = props
    return null
  },
}))

const result = {
  sessionId: "psess_adjust",
  band: 1,
  selfAdjusted: false,
  scoredAt: Date.now(),
  pronunciation: 80,
  vocabulary: 80,
  grammar: 80,
  fluency: 80,
}

beforeEach(async () => {
  vi.clearAllMocks()
  skillsProps.current = null
  modalProps.current = null
  readResultMock.mockReturnValue(result)
  adjustMock.mockReturnValue({
    unwrap: () =>
      Promise.resolve({ result: { ...result, band: 2, selfAdjusted: true }, band: 2 }),
  })
  changeLevelMock.mockReturnValue({
    unwrap: () => Promise.resolve({ newLevel: "HSK2" }),
  })
  PlacementResultPage = (await import("./PlacementResultPage")).default
})

describe("PlacementResultPage level adjustment", () => {
  // Oracle: the adjust modal promises "lộ trình 5 ngày sẽ được tạo mới theo
  // cấp độ này" (i18n/vi.js:389). The page only called the placement API, so
  // the learning path stayed on the old HSK level (user report 2026-10-31).
  it("recreates the learning path at the adjusted level", async () => {
    renderToStaticMarkup(<PlacementResultPage />)

    skillsProps.current.onAdjust()
    await modalProps.current.onConfirm(2)

    expect(adjustMock).toHaveBeenCalledWith({
      sessionId: "psess_adjust",
      level: 2,
    })
    expect(changeLevelMock).toHaveBeenCalledWith({ newLevel: "HSK2" })
  })
})
