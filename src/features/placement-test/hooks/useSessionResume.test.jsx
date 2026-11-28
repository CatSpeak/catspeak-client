import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useSessionResume from "./useSessionResume"

const authState = { user: { accountId: 202 }, isAuthenticated: true }
const activeSessionResult = {
  data: null,
  isSuccess: false,
  isError: false,
}
const activeCalls = []

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => authState,
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => vi.fn(),
}))

vi.mock("../api", () => ({
  useGetActiveSessionQuery: (...args) => {
    activeCalls.push(args[1])
    return activeSessionResult
  },
  useCreateSessionMutation: () => [vi.fn(), { isLoading: false }],
  useResumeSessionMutation: () => [vi.fn()],
  useCancelSessionMutation: () => [vi.fn(), { isLoading: false }],
}))

const Probe = ({ onValue }) => {
  onValue(useSessionResume())
  return null
}

const run = () => {
  let value = null
  renderToStaticMarkup(<Probe onValue={(next) => (value = next)} />)
  return value
}

beforeEach(() => {
  authState.user = { accountId: 202 }
  authState.isAuthenticated = true
  activeCalls.length = 0
  activeSessionResult.isSuccess = false
  activeSessionResult.isError = false
})

describe("ISS-06: useSessionResume active-session query", () => {
  it("skips the active-session query for guests and reports loaded", () => {
    authState.user = null
    authState.isAuthenticated = false

    const value = run()

    expect(activeCalls[0]).toMatchObject({ skip: true })
    expect(value.loaded).toBe(true)
  })

  it("queries the active session for authenticated users", () => {
    run()

    expect(activeCalls[0]).toMatchObject({ skip: false })
  })

  it("waits for the authenticated active-session result", () => {
    const value = run()

    expect(value.loaded).toBe(false)
  })
})
