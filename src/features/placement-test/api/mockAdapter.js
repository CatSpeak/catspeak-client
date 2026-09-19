import { SESSION_STATUS } from "../constants/session"
import { createSessionCode } from "../utils/session"
import { saveActiveSession } from "../utils/sessionStorage"

export const MOCK_LATENCY_MS = 400

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const buildSession = ({
  targetBand,
  studentId = null,
  now = Date.now,
  random = Math.random,
  year,
} = {}) => {
  const timestamp = now()
  return {
    id: `pt-${timestamp}-${Math.floor(random() * 1e6)}`,
    code: createSessionCode({
      year: year ?? new Date(timestamp).getFullYear(),
      random: random(),
    }),
    studentId,
    status: SESSION_STATUS.IN_PROGRESS,
    currentOrder: 0,
    targetBand,
    finalBand: null,
    selfAdjusted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    turns: [],
  }
}

export const createSessionMock = async (
  { targetBand, studentId } = {},
  { delayMs = MOCK_LATENCY_MS, persist = saveActiveSession, ...sessionDeps } = {},
) => {
  await wait(delayMs)
  const session = buildSession({ targetBand, studentId, ...sessionDeps })
  persist(session)
  return { data: session }
}
