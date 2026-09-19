import { describe, expect, it } from "vitest"
import {
  MLU_CAP,
  applySelfAdjust,
  clampHsk,
  evaluateTurn,
  scoreSession,
  selectNextQuestion,
} from "./index"

const turn = (order, level, transcript, extra = {}) => ({
  order,
  questionId: `q-${order}`,
  level,
  transcript,
  durationMs: 6000,
  retryCount: 0,
  ...extra,
})

describe("selectNextQuestion", () => {
  it("starts from the initial band level", () => {
    const question = selectNextQuestion({
      targetBand: "hsk3_4",
      order: 1,
      random: () => 0,
    })
    expect(question).toMatchObject({ order: 1, role: "initial", level: 3 })
    expect(question.hanzi).toBeTruthy()
  })

  it("adjusts difficulty from the previous answer", () => {
    const strong = selectNextQuestion({
      targetBand: "hsk3_4",
      order: 2,
      turns: [turn(1, 3, "鉴于全球化演变")],
      random: () => 0,
    })
    expect(strong.level).toBe(4)

    const weak = selectNextQuestion({
      targetBand: "hsk3_4",
      order: 2,
      turns: [turn(1, 3, "嗯")],
      random: () => 0,
    })
    expect(weak.level).toBe(2)
  })

  it("probes the boundary on turn 4 and the HSK5-6 ceiling on turn 5", () => {
    const boundary = selectNextQuestion({
      targetBand: "hsk3_4",
      order: 4,
      turns: [turn(1, 3, "鉴于全球化演变"), turn(2, 4, "鉴于全球化演变"), turn(3, 5, "鉴于全球化演变")],
      random: () => 0,
    })
    expect(boundary.role).toBe("boundary")
    expect(boundary.level).toBeGreaterThanOrEqual(2)
    expect(boundary.level).toBeLessThanOrEqual(5)

    const ceiling = selectNextQuestion({
      targetBand: "hsk3_4",
      order: 5,
      random: () => 0,
    })
    expect(ceiling).toMatchObject({ order: 5, role: "ceiling", level: 6 })
  })

  it("never repeats a question within a level", () => {
    const used = []
    let turns = []
    for (let order = 1; order <= 3; order += 1) {
      const question = selectNextQuestion({
        targetBand: "hsk3_4",
        order,
        turns,
        random: () => 0,
      })
      used.push(question.id)
      turns = [...turns, turn(order, question.level, "嗯")]
    }
    expect(new Set(used).size).toBe(3)
  })

  it("returns null outside the 5-turn window", () => {
    expect(selectNextQuestion({ targetBand: "hsk3_4", order: 0 })).toBeNull()
    expect(selectNextQuestion({ targetBand: "hsk3_4", order: 6 })).toBeNull()
  })
})

describe("evaluateTurn", () => {
  it("reports capped vocabulary, grammar matches and a pass flag", () => {
    const result = evaluateTurn({
      level: 3,
      transcript: "因为我觉得这个方法很好，所以我想参加",
    })
    expect(result.mlu).toBeLessThanOrEqual(MLU_CAP)
    expect(result.matchedVocabulary.length).toBeGreaterThan(0)
    expect(result.passed).toBe(true)
  })

  it("never throws on missing input", () => {
    expect(() => evaluateTurn()).not.toThrow()
    expect(() => evaluateTurn({ transcript: 42 })).not.toThrow()
  })
})

describe("AHI and capped MLU", () => {
  it("computes a weighted average word level", () => {
    const { vocabTotal } = scoreSession({
      turns: [turn(1, 6, "全球化文明融合")],
      now: () => 0,
    })
    expect(vocabTotal).toBeCloseTo(6, 5)
  })

  it("caps every answer at MLU 10 before scoring", () => {
    const belowCap = scoreSession({
      turns: [turn(1, 1, "我你他是不很学生老师朋友家")],
      now: () => 0,
    })
    expect(belowCap.vocabTotal).toBeCloseTo(1, 5)

    const aboveCap = scoreSession({
      turns: [turn(1, 1, "我你他是不很学生老师朋友家全球化")],
      now: () => 0,
    })
    expect(aboveCap.vocabTotal).toBeCloseTo(1, 5)

    const earlyHighLevel = scoreSession({
      turns: [turn(1, 1, "我全球化是不很学生老师朋友家")],
      now: () => 0,
    })
    expect(earlyHighLevel.vocabTotal).toBeGreaterThan(1)
  })
})

describe("grammar floor", () => {
  it("holds a high-vocabulary answer at the demonstrated grammar level", () => {
    const result = scoreSession({
      turns: [turn(1, 6, "因为全球化，所以文明融合")],
      now: () => 0,
    })
    expect(result.grammarFloor).toBe(2)
    expect(result.vocabBand).toBeGreaterThanOrEqual(4)
    expect(result.band).toBe(2)
  })

  it("does not lift the result above the vocabulary band", () => {
    const result = scoreSession({
      turns: [turn(1, 1, "我是学生")],
      now: () => 0,
    })
    expect(result.grammarFloor).toBe(1)
    expect(result.band).toBe(1)
  })
})

describe("HSK clamp", () => {
  it("clamps empty input to HSK1", () => {
    const result = scoreSession({ turns: [], now: () => 0 })
    expect(result.vocabTotal).toBe(0)
    expect(result.grammarFloor).toBe(0)
    expect(result.band).toBe(1)
  })

  it("clamps ceiling-level evidence to HSK6", () => {
    const result = scoreSession({
      turns: [
        turn(1, 6, "鉴于全球化演变"),
        turn(2, 6, "无非文明融合"),
        turn(3, 6, "鉴于教育体系改革"),
        turn(4, 6, "全球化与文明认同"),
        turn(5, 6, "无非可持续演变"),
      ],
      now: () => 1710000000000,
    })
    expect(result.vocabBand).toBe(6)
    expect(result.grammarFloor).toBe(6)
    expect(result.band).toBe(6)
    expect(result.scoredAt).toBe(1710000000000)
  })
})

describe("scoreSession", () => {
  it("scores a deterministic full 5-turn session", () => {
    const result = scoreSession({
      targetBand: "hsk3_4",
      turns: [
        turn(1, 3, "因为我觉得这个方法很好，所以我想参加"),
        turn(2, 4, "不但可以提高效率，而且能解决环境问题", { durationMs: 7000 }),
        turn(3, 4, "如果遇到挑战，我们就应该努力沟通", { durationMs: 6500 }),
        turn(4, 5, "一旦竞争加剧，独立和责任就更加重要", { durationMs: 7200 }),
        turn(5, 6, "鉴于全球化演变，改革教育体系无非是当务之急", {
          durationMs: 8000,
          retryCount: 1,
        }),
      ],
      now: () => 1710000000000,
    })

    expect(result.scoredAt).toBe(1710000000000)
    expect(result.grammarFloor).toBe(6)
    expect(result.vocabBand).toBe(4)
    expect(result.band).toBe(4)
    for (const score of [
      result.pronunciation,
      result.vocabulary,
      result.grammar,
      result.fluency,
    ]) {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
    expect(result.weaknesses.every((entry) => entry.score < 60)).toBe(true)
  })

  it("never throws on garbage turns", () => {
    expect(() => scoreSession()).not.toThrow()
    expect(() => scoreSession({ turns: null })).not.toThrow()
    expect(() => scoreSession({ turns: [null, 42, { transcript: 5 }, {}] })).not.toThrow()
    expect(() => selectNextQuestion({ turns: [undefined], order: 1 })).not.toThrow()
  })
})

describe("clampHsk", () => {
  it("keeps a level inside HSK 1-6", () => {
    expect(clampHsk(0)).toBe(1)
    expect(clampHsk(3)).toBe(3)
    expect(clampHsk(9)).toBe(6)
    expect(clampHsk("nope")).toBe(1)
  })
})

describe("applySelfAdjust", () => {
  it("moves at most one HSK level and clamps to the range", () => {
    expect(applySelfAdjust({ band: 3, level: 2 })).toMatchObject({ band: 2, applied: true })
    expect(applySelfAdjust({ band: 3, level: 5 })).toMatchObject({ band: 4, applied: true })
    expect(applySelfAdjust({ band: 1, level: 0 })).toMatchObject({ band: 1, applied: false })
    expect(applySelfAdjust({ band: 1, level: 2 })).toMatchObject({ band: 2, applied: true })
    expect(applySelfAdjust({ band: 6, level: 9 })).toMatchObject({ band: 6, applied: false })
    expect(applySelfAdjust({ band: 6, level: 5 })).toMatchObject({ band: 5, applied: true })
  })

  it("locks after the one-time adjustment", () => {
    expect(
      applySelfAdjust({ band: 3, level: 4, selfAdjusted: true }),
    ).toMatchObject({ band: 3, applied: false, selfAdjusted: true })
  })
})
