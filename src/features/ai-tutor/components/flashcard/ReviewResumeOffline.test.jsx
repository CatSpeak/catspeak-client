// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import ReviewSession from "./ReviewSession"
import ReviewResult from "./ReviewResult"

let mockIsOnline = false
let mockPendingCount = 1

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useBlocker: () => ({ state: "unblocked", proceed: vi.fn(), reset: vi.fn() }),
}))

let mockSessionData = null
const mockStartSession = vi.fn()
const mockLoadSession = vi.fn(() => ({
  unwrap: () => Promise.resolve(mockSessionData),
}))
const mockFinishSession = vi.fn(() => ({
  unwrap: () => Promise.reject(new Error("Offline")),
}))

vi.mock("../../api/flashcardReviewApi", () => ({
  useLazyGetFlashcardSessionQuery: () => [mockLoadSession],
  useStartFlashcardSessionMutation: () => [mockStartSession],
  useFinishFlashcardSessionMutation: () => [mockFinishSession],
  flashcardErrorCode: vi.fn(),
}))

const mockSubmit = vi.fn()
vi.mock("../../hooks/useFlashcardSync", () => ({
  default: () => ({
    isOnline: mockIsOnline,
    pendingCount: mockPendingCount,
    isRetrying: false,
    submit: mockSubmit,
  }),
}))

vi.mock("./exercises/FlipCardExercise", () => ({
  default: ({ card, onResult, onNext }) => (
    <div data-testid="flip-exercise">
      <span>{card.word}</span>
      <button
        type="button"
        data-testid="answer-btn"
        onClick={() => {
          onResult({ isCorrect: true, isOverride: false })
          onNext()
        }}
      >
        Nhớ được
      </button>
    </div>
  ),
}))

describe("TC-FC-065: Resume session offline displays merged results 2/2", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  it("resumes session where 1/2 card was already answered, answers card 2 offline, displays '2/2 thẻ nhớ được'", async () => {
    // Session HSK 2 with 2 cards. Card 1 was answered before resume.
    mockSessionData = {
      session_id: "rev_hsk2_test",
      mode: "free",
      deck_id: "hsk-2",
      status: "in_progress",
      total_cards: 2,
      cards: [
        { card_id: 1, word: "苹果", exercise_type: "flip" },
        { card_id: 2, word: "香蕉", exercise_type: "flip" },
      ],
      answered_card_ids: [1],
      answered_results: [
        { card_id: 1, is_correct: true, is_override: false },
      ],
      resumed: true,
    }

    let finishedPayload = null
    const onFinished = vi.fn((sessionId, payload) => {
      finishedPayload = payload
    })

    await act(async () => {
      root.render(
        <ReviewSession
          mode="free"
          deckId="hsk-2"
          resumeSessionId="rev_hsk2_test"
          onFinished={onFinished}
        />
      )
    })

    // Card 2 is presented
    const answerBtn = container.querySelector('[data-testid="answer-btn"]')
    expect(answerBtn).not.toBeNull()

    // Offline: answer Card 2
    mockIsOnline = false
    mockPendingCount = 1

    await act(async () => {
      answerBtn.click()
    })

    expect(onFinished).toHaveBeenCalled()

    // Now render ReviewResult with the finishedPayload received from ReviewSession
    await act(async () => {
      root.render(
        <ReviewResult
          sessionId="rev_hsk2_test"
          localResults={finishedPayload.localResults}
          totalCards={finishedPayload.totalCards}
        />
      )
    })

    // Assert user symptom: Expect "2/2 thẻ nhớ được", but currently shows "1/1 thẻ nhớ được"
    expect(container.textContent).toContain("2/2 thẻ nhớ được")
  })

  it("handles previously wrong card on resume, shows '1/2 thẻ nhớ được' and 'Từ sẽ gặp lại sớm'", async () => {
    mockSessionData = {
      session_id: "rev_hsk2_test_wrong",
      mode: "free",
      deck_id: "hsk-2",
      status: "in_progress",
      total_cards: 2,
      cards: [
        { card_id: 1, word: "苹果", exercise_type: "flip" },
        { card_id: 2, word: "香蕉", exercise_type: "flip" },
      ],
      answered_card_ids: [1],
      answered_results: [
        { card_id: 1, is_correct: false, is_override: false },
      ],
      resumed: true,
    }

    let finishedPayload = null
    const onFinished = vi.fn((sessionId, payload) => {
      finishedPayload = payload
    })

    await act(async () => {
      root.render(
        <ReviewSession
          mode="free"
          deckId="hsk-2"
          resumeSessionId="rev_hsk2_test_wrong"
          onFinished={onFinished}
        />
      )
    })

    mockIsOnline = false
    mockPendingCount = 1

    const answerBtn = container.querySelector('[data-testid="answer-btn"]')
    await act(async () => {
      answerBtn.click()
    })

    await act(async () => {
      root.render(
        <ReviewResult
          sessionId="rev_hsk2_test_wrong"
          localResults={finishedPayload.localResults}
          totalCards={finishedPayload.totalCards}
        />
      )
    })

    expect(container.textContent).toContain("1/2 thẻ nhớ được")
    expect(container.textContent).toContain("Từ sẽ gặp lại sớm:")
    expect(container.textContent).toContain("苹果")
  })

  it("re-entering an already completed session offline passes all results to ReviewResult", async () => {
    mockSessionData = {
      session_id: "rev_hsk2_completed",
      mode: "free",
      deck_id: "hsk-2",
      status: "in_progress",
      total_cards: 2,
      cards: [
        { card_id: 1, word: "苹果", exercise_type: "flip" },
        { card_id: 2, word: "香蕉", exercise_type: "flip" },
      ],
      answered_card_ids: [1, 2],
      answered_results: [
        { card_id: 1, is_correct: true, is_override: false },
        { card_id: 2, is_correct: true, is_override: false },
      ],
      resumed: true,
    }

    let finishedPayload = null
    const onFinished = vi.fn((sessionId, payload) => {
      finishedPayload = payload
    })

    await act(async () => {
      root.render(
        <ReviewSession
          mode="free"
          deckId="hsk-2"
          resumeSessionId="rev_hsk2_completed"
          onFinished={onFinished}
        />
      )
    })

    expect(container.textContent).toContain("Bạn đã ôn xong mẻ thẻ này.")
    const viewResultBtn = container.querySelector("button")

    await act(async () => {
      viewResultBtn.click()
    })

    expect(onFinished).toHaveBeenCalled()
    expect(finishedPayload.localResults).toHaveLength(2)

    mockIsOnline = false
    await act(async () => {
      root.render(
        <ReviewResult
          sessionId="rev_hsk2_completed"
          localResults={finishedPayload.localResults}
          totalCards={finishedPayload.totalCards}
        />
      )
    })

    expect(container.textContent).toContain("2/2 thẻ nhớ được")
  })
})
