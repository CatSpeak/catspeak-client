import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import {
  ANALYZE_MIN_MS,
  CONVERSATION_NOTICE,
  CONVERSATION_PHASE,
  NOT_HEARING_BANNER_MS,
  QUESTION_DURATION_MS,
  TICK_MS,
} from "../constants/conversation"
import {
  PLACEMENT_TEST_PATH,
  PLACEMENT_TEST_SCORING_PATH,
} from "../constants/routes"
import { SESSION_STATUS } from "../constants/session"
import { CONNECTION_LOST_EVENT } from "../constants/lifecycle"
import { TOTAL_TURNS, evaluateTurn, selectNextQuestion } from "../engine"
import {
  placementTestApi,
  useCancelSessionMutation,
  useSubmitTurnMutation,
} from "../api"
import { SILENCE_LEVEL } from "../services/audio/constants"
import { createSilenceTracker } from "../services/speech"
import {
  clearActiveSession,
  readActiveSession,
  saveActiveSession,
} from "../utils/sessionStorage"
import {
  advancePauseBudget,
  remainingPauseBudget,
  remainingQuestionMs,
  startReconnect,
  tickReconnect,
} from "../utils/lifecycle"
import { upsertTurn } from "../utils/turns"
import useAudioTransport from "./useAudioTransport"

const isOnline = () =>
  typeof navigator === "undefined" || navigator.onLine !== false

const normalizeQuestion = (q, fallbackOrder = 1) => {
  if (!q) return null
  const parsedOrder = Number(
    q.turn_index ?? q.turnIndex ?? q.current_turn,
  )
  const effectiveOrder =
    Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : fallbackOrder
  return {
    id: q.question_id || q.id || `turn_${effectiveOrder}`,
    order: effectiveOrder,
    turnIndex: effectiveOrder,
    level: Number(q.target_hsk_level || q.hsk_level || q.level) || 1,
    hanzi: q.text || q.hanzi || "",
    pinyin: q.pinyin || "",
    meaningVi: q.meaning_vi || q.meaningVi || q.translation_vi || q.vi || "",
    audioBase64: q.audio_base64 || q.audioBase64 || null,
    audioFormat: q.audio_format || q.audioFormat || "audio/wav",
  }
}

const useConversationLoop = () => {
  const navigate = useNavigate()

  const [session, setSession] = useState(readActiveSession)
  const [turns, setTurns] = useState(() => readActiveSession()?.turns || [])
  const [order, setOrder] = useState(() => {
    const s = readActiveSession()
    return Number(s?.currentOrder) || (s?.turns?.length || 0) + 1
  })
  const [question, setQuestion] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [phase, setPhase] = useState(CONVERSATION_PHASE.LOADING)
  const [notice, setNotice] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [recordedMs, setRecordedMs] = useState(0)
  const [remainingMs, setRemainingMs] = useState(QUESTION_DURATION_MS)
  const [showHanzi, setShowHanzi] = useState(true)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showMeaning, setShowMeaning] = useState(true)
  const [paused, setPaused] = useState(false)
  const [pauseSpentMs, setPauseSpentMs] = useState(
    () => readActiveSession()?.pauseSpentMs || 0,
  )
  const [connectionLost, setConnectionLost] = useState(false)
  const [reconnect, setReconnect] = useState(() => startReconnect())
  const [suspended, setSuspended] = useState(false)
  const [submitTurn] = useSubmitTurnMutation()
  const [cancelSession] = useCancelSessionMutation()
  const [triggerGetQuestion] = placementTestApi.useLazyGetQuestionQuery()

  const {
    level: micLevel,
    status: micStatus,
    startListening: startAudioListening,
    stopListening: stopAudioListening,
    speak: speakText,
    stopSpeaking: stopSpeakingText,
    playAudioBase64,
    stopAudio,
    startRecording,
    stopRecording,
    getRecordedBlob,
    getRecordingUrl,
  } = useAudioTransport()

  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false)
  const userAudioRef = useRef(null)

  const levelRef = useRef(0)
  const micStatusRef = useRef("connecting")
  const trackerRef = useRef(null)
  const recordingStartedAtRef = useRef(0)
  const isRecordingRef = useRef(false)
  const silentSinceRef = useRef(null)
  const finishingRef = useRef(false)
  const recordingStoppedRef = useRef(false)
  const mountedRef = useRef(true)
  const frozenRemainingRef = useRef(QUESTION_DURATION_MS)
  const connectionLostRef = useRef(false)
  const reconnectRef = useRef(startReconnect())
  const pauseSpentRef = useRef(pauseSpentMs)
  const handleReconnectSuccessRef = useRef(() => {})
  const handleResumeRef = useRef(() => {})
  const handleLeaveRef = useRef(() => {})

  const finishTurnRef = useRef(() => {})
  const loadQuestionRef = useRef(() => {})
  const stateRef = useRef({})

  const handleStopUserAudio = useCallback(() => {
    if (userAudioRef.current) {
      try {
        userAudioRef.current.pause()
        userAudioRef.current.currentTime = 0
      } catch {
        // Audio pause error ignore
      }
      userAudioRef.current = null
    }
    setIsPlayingUserAudio(false)
  }, [])

  const handlePlayUserAudio = useCallback(() => {
    handleStopUserAudio()
    stopSpeakingText()
    stopAudio()

    const url =
      getRecordingUrl() ||
      (getRecordedBlob() ? URL.createObjectURL(getRecordedBlob()) : null)
    if (!url) return

    try {
      const audio = new Audio(url)
      userAudioRef.current = audio
      audio.onended = () => {
        setIsPlayingUserAudio(false)
        userAudioRef.current = null
      }
      audio.onerror = () => {
        setIsPlayingUserAudio(false)
        userAudioRef.current = null
      }
      audio
        .play()
        .then(() => {
          setIsPlayingUserAudio(true)
        })
        .catch(() => {
          setIsPlayingUserAudio(false)
          userAudioRef.current = null
        })
    } catch {
      setIsPlayingUserAudio(false)
      userAudioRef.current = null
    }
  }, [getRecordedBlob, getRecordingUrl, handleStopUserAudio, stopAudio, stopSpeakingText])

  useEffect(() => {
    levelRef.current = micLevel
  }, [micLevel])

  useEffect(() => {
    micStatusRef.current = micStatus
  }, [micStatus])

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    stateRef.current = {
      session,
      turns,
      order,
      question,
      transcript,
      retryCount,
      phase,
      isRecording,
      hasRecorded,
      recordedMs,
    }
  }, [
    session,
    turns,
    order,
    question,
    transcript,
    retryCount,
    phase,
    isRecording,
    hasRecorded,
    recordedMs,
  ])

  const playQuestionAudio = useCallback(
    (q) => {
      handleStopUserAudio()
      if (q?.audioBase64) {
        playAudioBase64(q.audioBase64, q.audioFormat)
      } else if (q?.hanzi) {
        speakText(q.hanzi)
      }
    },
    [handleStopUserAudio, playAudioBase64, speakText],
  )

  const handleStartRecord = useCallback(async () => {
    if (finishingRef.current) return
    handleStopUserAudio()
    stopSpeakingText()
    stopAudio()
    finishingRef.current = false
    recordingStoppedRef.current = false

    const recordSuccess = await startRecording()
    if (!recordSuccess) {
      toast.error(
        "Trình duyệt chưa có quyền truy cập Micro. Vui lòng cấp quyền micro cho trang web để trả lời bài thi.",
      )
      setIsRecording(false)
      return
    }

    const now = Date.now()
    recordingStartedAtRef.current = now
    setIsRecording(true)
    setHasRecorded(false)
    setNotice(null)
    setRecordedMs(0)
    setTranscript("")

    const tracker = createSilenceTracker({ threshold: SILENCE_LEVEL })
    tracker.reset(now)
    trackerRef.current = tracker

    startAudioListening({
      level: stateRef.current.question?.level,
      onResult: (text) => {
        if (text) setTranscript(text)
      },
      onEnd: (finalText) => {
        if (finalText) setTranscript(finalText)
      },
    })
  }, [startAudioListening, startRecording, stopAudio, stopSpeakingText])

  const handleStopRecord = useCallback(async () => {
    if (!isRecordingRef.current) return
    setIsRecording(false)
    setHasRecorded(true)
    stopAudioListening()
    await stopRecording()
    const elapsed = Math.min(
      Date.now() - (recordingStartedAtRef.current || Date.now()),
      QUESTION_DURATION_MS,
    )
    setRecordedMs(Math.max(0, elapsed))
    setNotice(null)
  }, [stopAudioListening, stopRecording])

  const handleToggleRecord = useCallback(() => {
    if (isRecordingRef.current) {
      handleStopRecord()
    } else {
      handleStartRecord()
    }
  }, [handleStartRecord, handleStopRecord])

  const handleReRecord = useCallback(async () => {
    const current = stateRef.current
    if (current.question && phase === CONVERSATION_PHASE.LISTENING) {
      setRetryCount((prev) => prev + 1)
      handleStopUserAudio()
      stopAudioListening()
      await stopRecording()
      await handleStartRecord()
    }
  }, [handleStartRecord, handleStopUserAudio, phase, stopAudioListening, stopRecording])

  const loadQuestion = useCallback(
    async (nextOrder, sourceTurns, preferredQuestion) => {
      finishingRef.current = false
      recordingStoppedRef.current = false
      const current = stateRef.current
      let rawQuestion = preferredQuestion

      if (!rawQuestion && nextOrder === 1 && current.session?.initialQuestion) {
        rawQuestion = current.session.initialQuestion
      }

      if (!rawQuestion && current.session?.id) {
        try {
          const res = await triggerGetQuestion({ sessionId: current.session.id }).unwrap()
          rawQuestion = res
        } catch {
          rawQuestion = null
        }
      }

      if (!rawQuestion) {
        rawQuestion = selectNextQuestion({
          targetBand: current.session?.targetBand,
          turns: sourceTurns || current.turns,
          order: nextOrder,
        })
      }

      const effectiveOrder =
        Number(
          rawQuestion?.turn_index ??
            rawQuestion?.turnIndex ??
            rawQuestion?.current_turn,
        ) || nextOrder

      const nextQuestion = normalizeQuestion(rawQuestion, effectiveOrder)
      if (!nextQuestion) {
        navigate(PLACEMENT_TEST_SCORING_PATH, { replace: true })
        return
      }

      handleStopUserAudio()
      stopAudioListening()
      stopAudio()
      await stopRecording()

      setOrder(effectiveOrder)
      setQuestion(nextQuestion)
      setTranscript("")
      setNotice(null)
      setIsRecording(false)
      setHasRecorded(false)
      setRecordedMs(0)
      setRemainingMs(QUESTION_DURATION_MS)
      setPhase(CONVERSATION_PHASE.LISTENING)
      playQuestionAudio(nextQuestion)
    },
    [
      handleStopUserAudio,
      navigate,
      playQuestionAudio,
      stopAudio,
      stopAudioListening,
      stopRecording,
      triggerGetQuestion,
    ],
  )

  const finishTurn = useCallback(
    async ({ transcript: rawTranscript = "", skipped = false } = {}) => {
      if (finishingRef.current) return
      finishingRef.current = true
      handleStopUserAudio()
      setIsRecording(false)
      stopAudioListening()
      stopSpeakingText()
      stopAudio()
      await stopRecording()
      const audioBlob = getRecordedBlob()

      const current = stateRef.current
      const clean = String(rawTranscript || "").trim()
      const durationMs = current.recordedMs || 0
      const level = current.question?.level || 1
      const turnOrder = current.question?.turnIndex || current.order || 1
      const evaluation = evaluateTurn({
        question: current.question,
        transcript: clean,
        level,
      })

      setTranscript(clean)
      setNotice(null)
      setPhase(CONVERSATION_PHASE.ANALYZING)

      const turn = {
        order: turnOrder,
        questionId: current.question?.id || null,
        level,
        transcript: clean,
        durationMs,
        retryCount: current.retryCount,
        passed: evaluation.passed,
      }
      const nextTurns = upsertTurn(current.turns, turn)
      const startedAt = Date.now()
      let result = null

      try {
        result = await submitTurn({
          sessionId: current.session?.id,
          order: turnOrder,
          turnIndex: turnOrder,
          audioBlob,
          durationMs,
          retryCount: current.retryCount,
          skipped: Boolean(skipped),
          ...turn,
        }).unwrap()
      } catch {
        // Network or server error: stay on current question and allow retrying submit
        finishingRef.current = false
        setPhase(CONVERSATION_PHASE.LISTENING)
        setNotice(CONVERSATION_NOTICE.NO_HEARING)
        return
      }

      // Check if server asked to retry because no speech was detected
      if (
        result?.accepted === false ||
        result?.canRetry === true ||
        result?.speechDetected === false
      ) {
        finishingRef.current = false
        setPhase(CONVERSATION_PHASE.LISTENING)
        setNotice(CONVERSATION_NOTICE.RETRY)
        if (typeof result?.retryCount === "number") {
          setRetryCount(result.retryCount)
        } else {
          setRetryCount((prev) => prev + 1)
        }
        setIsRecording(false)
        setHasRecorded(false)
        setRecordedMs(0)
        return
      }

      // Successful score submission
      if (result?.turnResult?.transcript) {
        setTranscript(result.turnResult.transcript)
      }
      const isCompleted = Boolean(result?.isCompleted)
      const nextQuestion = result?.nextQuestion ?? null
      if (result?.session) {
        setSession(result.session)
        setTurns(result.session.turns || nextTurns)
      } else {
        setTurns(nextTurns)
      }

      const elapsed = Date.now() - startedAt
      if (elapsed < ANALYZE_MIN_MS) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, ANALYZE_MIN_MS - elapsed)
        })
      }
      if (!mountedRef.current) return

      const nextOrder =
        Number(
          nextQuestion?.turn_index ??
            nextQuestion?.turnIndex ??
            nextQuestion?.current_turn,
        ) || (turnOrder + 1)

      if (nextOrder > TOTAL_TURNS || isCompleted) {
        navigate(PLACEMENT_TEST_SCORING_PATH, { replace: true })
        return
      }
      loadQuestionRef.current(
        nextOrder,
        result?.session?.turns || nextTurns,
        nextQuestion,
      )
    },
    [
      navigate,
      stopAudioListening,
      stopSpeakingText,
      stopAudio,
      stopRecording,
      getRecordedBlob,
      submitTurn,
    ],
  )

  useEffect(() => {
    finishTurnRef.current = finishTurn
  }, [finishTurn])

  useEffect(() => {
    loadQuestionRef.current = loadQuestion
  }, [loadQuestion])

  const suspendSession = useCallback(() => {
    handleStopUserAudio()
    stopAudioListening()
    stopSpeakingText()
    stopAudio()
    if (isRecordingRef.current) {
      stopRecording()
      setIsRecording(false)
      setHasRecorded(true)
    }
    setSuspended(true)
  }, [handleStopUserAudio, stopAudioListening, stopSpeakingText, stopAudio, stopRecording])

  const resumeSession = useCallback(() => {
    setSuspended(false)
  }, [])

  const handlePause = useCallback(() => {
    if (connectionLost) return
    setPaused(true)
    suspendSession()
  }, [connectionLost, suspendSession])

  const handleResume = useCallback(() => {
    setPaused(false)
    resumeSession()
  }, [resumeSession])

  const handleLeave = useCallback(() => {
    const current = stateRef.current
    if (current.session) {
      saveActiveSession({
        ...current.session,
        turns: current.turns,
        pauseSpentMs,
        pausedAt: Date.now(),
      })
    }
    handleStopUserAudio()
    stopAudioListening()
    stopSpeakingText()
    stopAudio()
    navigate(PLACEMENT_TEST_PATH, { replace: true })
  }, [handleStopUserAudio, navigate, pauseSpentMs, stopAudioListening, stopSpeakingText, stopAudio])

  const handleCancel = useCallback(async () => {
    const current = stateRef.current
    if (current.session?.id) {
      try {
        await cancelSession({ sessionId: current.session.id }).unwrap()
      } catch {
        // Ignore network error on cancel
      }
    }
    clearActiveSession()
    handleStopUserAudio()
    stopAudioListening()
    stopSpeakingText()
    stopAudio()
    navigate(PLACEMENT_TEST_PATH, { replace: true })
  }, [cancelSession, handleStopUserAudio, navigate, stopAudio, stopAudioListening, stopSpeakingText])

  const handleConnectionLost = useCallback(() => {
    if (connectionLost) return
    reconnectRef.current = startReconnect()
    setReconnect(reconnectRef.current)
    setConnectionLost(true)
    suspendSession()
  }, [connectionLost, suspendSession])

  const handleReconnectSuccess = useCallback(() => {
    reconnectRef.current = startReconnect()
    setReconnect(reconnectRef.current)
    setConnectionLost(false)
    resumeSession()
  }, [resumeSession])

  const handleReconnectNow = useCallback(() => {
    handleReconnectSuccess()
  }, [handleReconnectSuccess])

  useEffect(() => {
    connectionLostRef.current = connectionLost
  }, [connectionLost])

  useEffect(() => {
    handleReconnectSuccessRef.current = handleReconnectSuccess
  }, [handleReconnectSuccess])

  useEffect(() => {
    handleResumeRef.current = handleResume
  }, [handleResume])

  useEffect(() => {
    handleLeaveRef.current = handleLeave
  }, [handleLeave])

  useEffect(() => {
    const handleOffline = () => handleConnectionLost()
    const handleOnline = () => {
      if (connectionLostRef.current) handleReconnectSuccess()
    }
    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)
    window.addEventListener(CONNECTION_LOST_EVENT, handleOffline)
    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener(CONNECTION_LOST_EVENT, handleOffline)
    }
  }, [handleConnectionLost, handleReconnectSuccess])

  useEffect(() => {
    if (!connectionLost) return undefined
    const id = window.setInterval(() => {
      const previous = reconnectRef.current
      const next = tickReconnect(previous, 1000)
      if (next.exhausted) {
        reconnectRef.current = startReconnect()
        setReconnect(reconnectRef.current)
        setConnectionLost(false)
        setPaused(true)
        return
      }
      reconnectRef.current = next
      setReconnect(next)
      if (next.attempt !== previous.attempt && isOnline()) {
        handleReconnectSuccessRef.current()
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [connectionLost])

  useEffect(() => {
    if (!paused) return undefined
    const id = window.setInterval(() => {
      const next = advancePauseBudget(pauseSpentRef.current, 1000)
      pauseSpentRef.current = next
      setPauseSpentMs(next)
      if (remainingPauseBudget(next) <= 0) {
        handleResumeRef.current()
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [paused])

  useEffect(() => {
    mountedRef.current = true
    const stored = readActiveSession()
    if (!stored) {
      navigate(PLACEMENT_TEST_PATH, { replace: true })
      return () => {
        mountedRef.current = false
      }
    }
    const startOrder =
      Number(stored.currentOrder) || (stored.turns?.length || 0) + 1
    if (startOrder > TOTAL_TURNS) {
      navigate(PLACEMENT_TEST_SCORING_PATH, { replace: true })
      return () => {
        mountedRef.current = false
      }
    }
    loadQuestionRef.current(startOrder, stored.turns || [])
    return () => {
      mountedRef.current = false
      handleStopUserAudio()
      stopAudioListening()
      stopSpeakingText()
      stopAudio()
    }
  }, [handleStopUserAudio, navigate, stopAudioListening, stopSpeakingText, stopAudio])

  // Tick loop: smoothly updates recording timer
  useEffect(() => {
    if (phase !== CONVERSATION_PHASE.LISTENING || suspended || !isRecording) {
      return undefined
    }
    const id = window.setInterval(() => {
      const now = Date.now()
      const elapsed = Math.max(0, now - recordingStartedAtRef.current)
      const clamped = Math.min(elapsed, QUESTION_DURATION_MS)
      setRecordedMs(clamped)
      setRemainingMs(Math.max(0, QUESTION_DURATION_MS - clamped))

      if (elapsed >= QUESTION_DURATION_MS) {
        setIsRecording(false)
        setHasRecorded(true)
        stopAudioListening()
        stopRecording()
      }
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [phase, suspended, isRecording, stopAudioListening, stopRecording])

  // User explicitly clicks "Hoàn tất câu trả lời"
  const handleSubmit = useCallback(async () => {
    if (isRecordingRef.current) {
      setIsRecording(false)
      setHasRecorded(true)
      stopAudioListening()
      await stopRecording()
    }
    finishTurnRef.current({ transcript: stateRef.current.transcript })
  }, [stopAudioListening, stopRecording])

  // User explicitly clicks "Bỏ qua"
  const handleSkip = useCallback(async () => {
    if (isRecordingRef.current) {
      setIsRecording(false)
      setHasRecorded(true)
      stopAudioListening()
      await stopRecording()
    }
    finishTurnRef.current({ transcript: "", skipped: true })
  }, [stopAudioListening, stopRecording])

  const handleReplay = useCallback(() => {
    const q = stateRef.current.question
    if (q) playQuestionAudio(q)
  }, [playQuestionAudio])

  const toggleHanzi = useCallback(() => setShowHanzi((value) => !value), [])
  const togglePinyin = useCallback(() => setShowPinyin((value) => !value), [])
  const toggleMeaning = useCallback(() => setShowMeaning((value) => !value), [])

  return {
    ready: Boolean(question),
    session,
    order,
    question,
    transcript,
    phase,
    notice,
    retryCount,
    isRecording,
    micLevel,
    hasRecorded,
    recordedMs,
    remainingMs,
    maxDurationMs: QUESTION_DURATION_MS,
    isPlayingUserAudio,
    showHanzi,
    showPinyin,
    showMeaning,
    toggleHanzi,
    togglePinyin,
    toggleMeaning,
    canSkip: true,
    answeredCount: turns.length,
    paused,
    pauseRemainingMs: remainingPauseBudget(pauseSpentMs),
    connectionLost,
    reconnectAttempt: reconnect.attempt,
    reconnectRemainingMs: reconnect.remainingMs,
    handlePause,
    handleResume,
    handleLeave,
    handleCancel,
    handleReconnectNow,
    handleToggleRecord,
    handleStartRecord,
    handleStopRecord,
    handlePlayUserAudio,
    handleStopUserAudio,
    handleSubmit,
    handleSkip,
    handleReRecord,
    handleReplay,
  }
}

export default useConversationLoop
