import { getTargetBand } from "../constants/bands"
import { HSK_BANK, HSK_LEVELS } from "../constants/hskBank"
import {
  CAT_ROLES,
  HSK_MAX,
  HSK_MIN,
  INITIAL_TURNS,
  TOTAL_TURNS,
} from "./constants"
import { evaluateTurn } from "./evaluate"

const QUESTIONS = HSK_LEVELS.flatMap((level) => HSK_BANK[level].questions)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const resolveRandom = (random) => {
  if (typeof random === "function") return random()
  const value = Number(random)
  return Number.isFinite(value) ? value : Math.random()
}

export const clampHsk = (level) => {
  const value = Number(level)
  if (!Number.isFinite(value)) return HSK_MIN
  return clamp(Math.round(value), HSK_MIN, HSK_MAX)
}

const priorTurns = (turns) =>
  (Array.isArray(turns) ? turns : [])
    .filter((turn) => turn && Number.isFinite(Number(turn.order)))
    .sort((a, b) => a.order - b.order)

const runningEstimate = (startLevel, turns) =>
  priorTurns(turns).reduce(
    (level, turn) =>
      clampHsk(
        level +
          (evaluateTurn({ level: turn.level, transcript: turn.transcript })
            .passed
            ? 1
            : -1),
      ),
    startLevel,
  )

const pickQuestion = (level, turns, random) => {
  const used = new Set(
    priorTurns(turns)
      .map((turn) => turn.questionId)
      .filter(Boolean),
  )
  const atLevel = QUESTIONS.filter((question) => question.level === level)
  if (atLevel.length === 0) return null
  const fresh = atLevel.filter((question) => !used.has(question.id))
  const candidates = fresh.length > 0 ? fresh : atLevel
  const index = clamp(Math.floor(resolveRandom(random) * candidates.length), 0, candidates.length - 1)
  return candidates[index]
}

export const selectNextQuestion = ({
  targetBand,
  turns = [],
  order,
  random = Math.random,
} = {}) => {
  const nextOrder = Number.isFinite(order)
    ? Math.round(Number(order))
    : priorTurns(turns).length + 1
  if (nextOrder < 1 || nextOrder > TOTAL_TURNS) return null

  const startLevel = getTargetBand(targetBand).hskRange[0]
  let level
  let role

  if (nextOrder <= INITIAL_TURNS) {
    level = runningEstimate(startLevel, turns)
    role = CAT_ROLES.INITIAL
  } else if (nextOrder === TOTAL_TURNS - 1) {
    level = clamp(runningEstimate(startLevel, turns) + 1, HSK_MIN + 1, HSK_MAX - 1)
    role = CAT_ROLES.BOUNDARY
  } else {
    level = HSK_MAX
    role = CAT_ROLES.CEILING
  }

  const question = pickQuestion(level, turns, random)
  if (!question) return null
  return { ...question, order: nextOrder, role }
}
