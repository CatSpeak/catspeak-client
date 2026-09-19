import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ANALYZE_MIN_MS,
  CONVERSATION_NOTICE,
  CONVERSATION_PHASE,
  NOT_HEARING_BANNER_MS,
  NOT_HEARING_EXIT_MS,
  QUESTION_DURATION_MS,
  RETRY_RESTART_MS,
  TICK_MS,
  VAD_GRACE_MS,
  VAD_SILENCE_MS,
} from "../constants/conversation"
import {
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_SCORING_PATH,
} from "../constants/routes"
import { TOTAL_TURNS, evaluateTurn, selectNextQuestion } from "../engine"
import { useSubmitTurnMutation } from "../api"
import { SILENCE_LEVEL } from "../services/audio/constants"
import {
  MAX_ASR_RETRIES,
  canRetry,
  createSilenceTracker,
  createSpeechRecognizer,
  nextRetryCount,
  speak,
  stopSpeaking,
} from "../services/speech"
import { readActiveSession } from "../utils/sessionStorage"
import useMicCapture from "./useMicCapture"

const sortTurns = (list) => [...list].sort((a, b) => a.order - b.order)

const upsertTurn = (list, turn) =>
  sortTurns([...list.filter((entry) => entry.order !== turn.order), turn])

const useConversationLoop = () => {
  const navigate = useNavigate()

  const [session, setSession] = useState(readActiveSession)
  const [turns, setTurns] = useState(() => readActiveSession()?.turns || [])
  const [order, setOrder] = useState(
    () => (readActiveSession()?.turns?.length || 0) + 1,
  )
  const [question, setQuestion] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [phase, setPhase] = useState(CONVERSATION_PHASE.LOADING)
  const [notice, setNotice] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [remainingMs, setRemainingMs] = useState(QUESTION_DURATION_MS)
  const [showHanzi, setShowHanzi] = useState(true)
  const [showPinyin, setShowPinyin] = useState(true)
  const [submitTurn] = useSubmitTurnMutation()
  const mic = useMicCapture()

  const levelRef = useRef(0)
  const micStatusRef = useRef("connecting")
  const recognizerRef = useRef(null)
  const trackerRef = useRef(null)
  const deadlineRef = useRef(0)
  const listenStartedAtRef = useRef(0)
  const silentSinceRef = useRef(null)
  const finishingRef = useRef(false)
  const restartTimerRef = useRef(null)
  const mountedRef = useRef(true)

  const finishTurnRef = useRef(() => {})
  const handleNoSpeechRef = useRef(() => {})
  const loadQuestionRef = useRef(() => {})
  const stateRef = useRef({})

  useEffect(() => {
    levelRef.current = mic.level
  }, [mic.level])

  useEffect(() => {
    micStatusRef.current = mic.status
  }, [mic.status])

  useEffect(() => {
    stateRef.current = {
      session,
      turns,
      order,
      question,
      transcript,
      retryCount,
    }
  }, [session, turns, order, question, transcript, retryCount])

  const stopRecognizer = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.destroy()
      recognizerRef.current = null
    }
  }, [])

  const clearRestart = useCallback(() => {
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const startListening = useCallback(
    (nextQuestion, { preserveRetry = false } = {}) => {
      stopRecognizer()
      finishingRef.current = false
      silentSinceRef.current = null
      listenStartedAtRef.current = Date.now()
      deadlineRef.current = Date.now() + QUESTION_DURATION_MS
      setRemainingMs(QUESTION_DURATION_MS)
      setTranscript("")
      if (!preserveRetry) setRetryCount(0)
      setNotice(null)
      setPhase(CONVERSATION_PHASE.LISTENING)

      const tracker = createSilenceTracker({
        silenceMs: VAD_SILENCE_MS,
        graceMs: VAD_GRACE_MS,
        threshold: SILENCE_LEVEL,
      })
      tracker.reset(listenStartedAtRef.current)
      trackerRef.current = tracker

      const recognizer = createSpeechRecognizer({
        level: nextQuestion?.level,
        onResult: (text) => setTranscript(text),
        onEnd: (finalText) => {
          if (finishingRef.current) return
          const clean = String(finalText || "").trim()
          if (clean) finishTurnRef.current({ transcript: clean })
          else handleNoSpeechRef.current()
        },
      })
      recognizerRef.current = recognizer
      recognizer.start()
    },
    [stopRecognizer],
  )

  const loadQuestion = useCallback(
    (nextOrder, sourceTurns) => {
      const current = stateRef.current
      const turnsForSelection = sourceTurns || current.turns
      const nextQuestion = selectNextQuestion({
        targetBand: current.session?.targetBand,
        turns: turnsForSelection,
        order: nextOrder,
      })
      if (!nextQuestion) {
        navigate(PLACEMENT_TEST_SCORING_PATH, { replace: true })
        return
      }
      setOrder(nextOrder)
      setQuestion(nextQuestion)
      startListening(nextQuestion)
      speak(nextQuestion.hanzi)
    },
    [navigate, startListening],
  )

  const handleNoSpeech = useCallback(() => {
    if (finishingRef.current) return
    const current = stateRef.current
    if (canRetry(current.retryCount)) {
      setRetryCount(nextRetryCount(current.retryCount))
    }
    setNotice(CONVERSATION_NOTICE.RETRY)
    clearRestart()
    restartTimerRef.current = window.setTimeout(() => {
      restartTimerRef.current = null
      startListening(current.question, { preserveRetry: true })
    }, RETRY_RESTART_MS)
  }, [clearRestart, startListening])

  const finishTurn = useCallback(
    async ({ transcript: rawTranscript = "" } = {}) => {
      if (finishingRef.current) return
      finishingRef.current = true
      clearRestart()
      stopRecognizer()
      stopSpeaking()

      const current = stateRef.current
      const clean = String(rawTranscript || "").trim()
      const durationMs = Math.max(0, Date.now() - listenStartedAtRef.current)
      const level = current.question?.level || 1
      const evaluation = evaluateTurn({
        question: current.question,
        transcript: clean,
        level,
      })

      setTranscript(clean)
      setNotice(null)
      setPhase(CONVERSATION_PHASE.ANALYZING)

      const turn = {
        order: current.order,
        questionId: current.question?.id || null,
        level,
        transcript: clean,
        durationMs,
        retryCount: current.retryCount,
        passed: evaluation.passed,
      }
      const nextTurns = upsertTurn(current.turns, turn)
      const startedAt = Date.now()

      try {
        const result = await submitTurn({
          sessionId: current.session?.id,
          ...turn,
        }).unwrap()
        if (result?.session) {
          setSession(result.session)
          setTurns(result.session.turns || nextTurns)
        } else {
          setTurns(nextTurns)
        }
      } catch {
        setTurns(nextTurns)
      }

      const elapsed = Date.now() - startedAt
      if (elapsed < ANALYZE_MIN_MS) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, ANALYZE_MIN_MS - elapsed)
        })
      }
      if (!mountedRef.current) return

      const nextOrder = current.order + 1
      if (nextOrder > TOTAL_TURNS) {
        navigate(PLACEMENT_TEST_SCORING_PATH, { replace: true })
        return
      }
      loadQuestionRef.current(nextOrder, nextTurns)
    },
    [clearRestart, navigate, stopRecognizer, submitTurn],
  )

  useEffect(() => {
    finishTurnRef.current = finishTurn
  }, [finishTurn])

  useEffect(() => {
    handleNoSpeechRef.current = handleNoSpeech
  }, [handleNoSpeech])

  useEffect(() => {
    loadQuestionRef.current = loadQuestion
  }, [loadQuestion])

  useEffect(() => {
    mountedRef.current = true
    const stored = readActiveSession()
    if (!stored) {
      navigate(PLACEMENT_TEST_PATH, { replace: true })
      return () => {
        mountedRef.current = false
      }
    }
    const startOrder = (stored.turns?.length || 0) + 1
    if (startOrder > TOTAL_TURNS) {
      navigate(PLACEMENT_TEST_SCORING_PATH, { replace: true })
      return () => {
        mountedRef.current = false
      }
    }
    loadQuestionRef.current(startOrder, stored.turns || [])
    return () => {
      mountedRef.current = false
      clearRestart()
      stopRecognizer()
      stopSpeaking()
    }
  }, [navigate, clearRestart, stopRecognizer])

  useEffect(() => {
    if (phase !== CONVERSATION_PHASE.LISTENING) return undefined
    const id = window.setInterval(() => {
      const now = Date.now()
      setRemainingMs(Math.max(0, deadlineRef.current - now))

      const tracker = trackerRef.current
      if (tracker) {
        const state = tracker.push(levelRef.current)
        if (state.shouldSubmit) {
          finishTurnRef.current({ transcript: stateRef.current.transcript })
          return
        }
      }

      if (micStatusRef.current !== "connecting") {
        if (levelRef.current < SILENCE_LEVEL) {
          if (silentSinceRef.current == null) silentSinceRef.current = now
          const silentMs = now - silentSinceRef.current
          if (silentMs >= NOT_HEARING_EXIT_MS) {
            finishTurnRef.current({ transcript: "" })
            return
          }
          if (silentMs >= NOT_HEARING_BANNER_MS) {
            setNotice(CONVERSATION_NOTICE.NO_HEARING)
          }
        } else {
          silentSinceRef.current = null
          setNotice((previous) =>
            previous === CONVERSATION_NOTICE.NO_HEARING ? null : previous,
          )
        }
      }

      if (deadlineRef.current - now <= 0) {
        finishTurnRef.current({ transcript: stateRef.current.transcript })
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [phase])

  const handleSubmit = useCallback(() => {
    finishTurnRef.current({ transcript: stateRef.current.transcript })
  }, [])

  const handleSkip = useCallback(() => {
    finishTurnRef.current({ transcript: "" })
  }, [])

  const handleReplay = useCallback(() => {
    const hanzi = stateRef.current.question?.hanzi
    if (hanzi) speak(hanzi)
  }, [])

  const toggleHanzi = useCallback(() => setShowHanzi((value) => !value), [])
  const togglePinyin = useCallback(() => setShowPinyin((value) => !value), [])

  const canSkip =
    notice === CONVERSATION_NOTICE.NO_HEARING || retryCount >= MAX_ASR_RETRIES

  return {
    ready: Boolean(question),
    session,
    order,
    question,
    transcript,
    phase,
    notice,
    retryCount,
    remainingMs,
    showHanzi,
    showPinyin,
    toggleHanzi,
    togglePinyin,
    canSkip,
    handleSubmit,
    handleSkip,
    handleReplay,
  }
}

export default useConversationLoop
