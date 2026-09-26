import React, { useState, useEffect, useRef, useCallback } from "react"
import { Room, RoomEvent, Track } from "livekit-client"
import { toast } from "@/shared/utils/toastBridge"



const TOPIC_SUBTITLE = "speaking-subtitle"
const TOPIC_ASSIST = "speaking-assist"
const TOPIC_STATE = "speaking-state"
const TOPIC_CONTROL = "speaking-control"

/**
 * SpeakingPage component - interactive live AI speaking session room
 * connected with LiveKit Realtime Speaking Agent.
 */
const SpeakingPage = ({
  sessionData,
  topicTitle = "Luyện nói tiếng Trung",
  onEndSession,
  onBackToSelection,
  onConnectionLost,
}) => {
  const [isMicActive, setIsMicActive] = useState(false) // Mặc định tắt mic
  const [isRequestingMic, setIsRequestingMic] = useState(false)
  const [micError, setMicError] = useState(null)
  const [volume, setVolume] = useState(100)
  const [isReplayingAi, setIsReplayingAi] = useState(false)
  const [isWrappingUp, setIsWrappingUp] = useState(false)

  // Realtime LiveKit Agent States
  const [connectionStatus, setConnectionStatus] = useState("connecting") // 'connecting' | 'connected' | 'failed' | 'disconnected'
  const [connectError, setConnectError] = useState(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(
    () => sessionData?.topic?.script_turns || sessionData?.topic?.scriptTurns || 3
  )
  const [aiText, setAiText] = useState(
    () => sessionData?.topic?.openingZh || sessionData?.topic?.opening_zh || "你好！准备好了吗？"
  )
  const [aiPinyin, setAiPinyin] = useState("")
  const [aiMeaning, setAiMeaning] = useState(
    () => (sessionData?.topic?.title_vi ? `Chủ đề: ${sessionData.topic.title_vi}` : "Chào bạn! Bạn đã sẵn sàng chưa?")
  )
  const [hints, setHints] = useState([])
  const [learnerText, setLearnerText] = useState("Micro đang tắt. Nhấn nút Micro bên dưới để bắt đầu nói...")
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [warnMessage, setWarnMessage] = useState(null)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  const roomRef = useRef(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  const onEndSessionRef = useRef(onEndSession)
  const onConnectionLostRef = useRef(onConnectionLost)
  const didFinishSessionRef = useRef(false)
  const wasConnectedRef = useRef(false)
  const isWrappingUpRef = useRef(false)
  useEffect(() => {
    onEndSessionRef.current = onEndSession
  }, [onEndSession])
  useEffect(() => {
    onConnectionLostRef.current = onConnectionLost
  }, [onConnectionLost])

  const finishSessionOnce = useCallback(() => {
    if (didFinishSessionRef.current) return
    didFinishSessionRef.current = true
    onEndSessionRef.current?.()
  }, [])

  const token = sessionData?.livekit?.token || sessionData?.token
  const serverUrl =
    sessionData?.livekit?.url ||
    sessionData?.serverUrl ||
    import.meta.env.VITE_LIVEKIT_URL ||
    "ws://localhost:7880"

  // ── LiveKit Room Connection & Event Listeners ─────────────────────────────
  useEffect(() => {
    didFinishSessionRef.current = false
    wasConnectedRef.current = false
    isWrappingUpRef.current = false
    if (!token) {
      setConnectionStatus("failed")
      setConnectError("Không tìm thấy mã LiveKit token hợp lệ để kết nối vào phòng.")
      return
    }

    let isCancelled = false

    // Disconnect previous room if existing
    if (roomRef.current && roomRef.current.state !== "disconnected") {
      roomRef.current.disconnect()
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
    roomRef.current = room

    // 1. Connection Lifecycle Listeners
    room.on(RoomEvent.Connected, () => {
      if (!isCancelled) {
        wasConnectedRef.current = true
        setConnectionStatus("connected")
      }
    })

    room.on(RoomEvent.Disconnected, () => {
      if (!isCancelled) {
        setConnectionStatus("disconnected")
        if (wasConnectedRef.current && !isWrappingUpRef.current) onConnectionLostRef.current?.()
        if (isWrappingUpRef.current) finishSessionOnce()
      }
    })

    room.on(RoomEvent.Reconnecting, () => {
      if (!isCancelled) setConnectionStatus("connecting")
    })

    room.on(RoomEvent.Reconnected, () => {
      if (!isCancelled) setConnectionStatus("connected")
    })

    // 2. Data Packet Listener from AI Agent
    room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
      try {
        const raw = new TextDecoder().decode(payload)
        const data = JSON.parse(raw)

        if (topic === TOPIC_SUBTITLE) {
          if (data.text) {
            setAiText(data.text)
            setIsAiSpeaking(true)
            setTimeout(() => setIsAiSpeaking(false), 3500)
          }
        } else if (topic === TOPIC_ASSIST) {
          setAiPinyin(data.pinyin || "")
          setAiMeaning(data.meaning_vi || "")
          setHints(Array.isArray(data.hints) ? data.hints : [])
        } else if (topic === TOPIC_STATE) {
          if (data.turn_index) setCurrentRound(data.turn_index)
          if (data.script_turns) setTotalRounds(data.script_turns)
          if (data.warn === "silence_10s") {
            setWarnMessage("Bạn có cần AI hỗ trợ không? Hãy thử phát âm một từ gợi ý nhé!")
          } else if (data.warn === "time_4m") {
            setWarnMessage("Phiên luyện nói sắp hết giờ (còn 1 phút).")
          } else if (!data.warn) {
            setWarnMessage(null)
          }

          if (data.phase === "wrapping_up") {
            isWrappingUpRef.current = true
            setIsWrappingUp(true)
          }
          if (data.phase === "ended") finishSessionOnce()
        }
      } catch (err) {
        console.warn("[SpeakingPage] Error parsing data packet:", err)
      }
    })

    // 3. Remote Audio Track Subscription (AI Tutor Voice)
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio && audioRef.current) {
        track.attach(audioRef.current)
      }
    })

    // 4. Perform Room Connection
    setConnectionStatus("connecting")
    setConnectError(null)

    room.connect(serverUrl, token).catch((err) => {
      if (!isCancelled) {
        console.error("[SpeakingPage] LiveKit connect error:", err)
        const msg = err?.message || "Không thể kết nối đến máy chủ đàm thoại LiveKit."
        setConnectionStatus("failed")
        setConnectError(msg)
        toast.error(msg)
      }
    })

    return () => {
      isCancelled = true
      if (room && room.state !== "disconnected") {
        room.disconnect()
      }
    }
  }, [token, serverUrl, retryCount, finishSessionOnce])

  // Timer effect when connected
  useEffect(() => {
    if (connectionStatus === "connected") {
      timerRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [connectionStatus])

  // Volume control effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // ── Send Control Packet Helper ───────────────────────────────────────────
  const sendControlPacket = async (action, hintId = null) => {
    const room = roomRef.current
    if (!room || !room.localParticipant) return
    const payload = { action, hint_id: hintId }
    try {
      const raw = new TextEncoder().encode(JSON.stringify(payload))
      await room.localParticipant.publishData(raw, { topic: TOPIC_CONTROL })
    } catch (err) {
      console.warn("[SpeakingPage] Failed to send control packet:", err)
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleReplayAi = () => {
    if (isWrappingUp) return
    setIsReplayingAi(true)
    sendControlPacket("replay_question")
    setTimeout(() => {
      setIsReplayingAi(false)
    }, 2000)
  }

  const handleToggleMic = async () => {
    const room = roomRef.current
    if (!room || connectionStatus !== "connected" || isWrappingUp) return

    if (!isMicActive) {
      // Yêu cầu và kiểm tra quyền truy cập microphone
      try {
        setIsRequestingMic(true)
        setMicError(null)

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          const notSupportedMsg = "Trình duyệt không hỗ trợ truy cập Micro."
          setMicError(notSupportedMsg)
          toast.error(notSupportedMsg)
          setIsRequestingMic(false)
          return
        }

        // Xin quyền microphone từ người dùng
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())

        // Bật mic trên LiveKit participant
        await room.localParticipant.setMicrophoneEnabled(true)
        setIsMicActive(true)
        setLearnerText("Micro đã bật · Đang lắng nghe giọng nói của bạn...")
      } catch (err) {
        console.warn("[SpeakingPage] Mic permission denied or error:", err)
        const deniedMsg =
          "Chưa cấp quyền Micro. Vui lòng cho phép trình duyệt truy cập mic để luyện nói."
        setMicError(deniedMsg)
        toast.error(deniedMsg)
        setIsMicActive(false)
      } finally {
        setIsRequestingMic(false)
      }
    } else {
      // Tắt mic
      try {
        await room.localParticipant.setMicrophoneEnabled(false)
        setIsMicActive(false)
        setLearnerText("Micro đang tắt · Nhấn nút Micro để bật lại.")
      } catch (err) {
        console.warn("[SpeakingPage] Error disabling mic:", err)
      }
    }
  }


  const handleFinishEarly = () => {
    if (isWrappingUp) return
    isWrappingUpRef.current = true
    setIsWrappingUp(true)
    sendControlPacket("finish_early")
  }



  const formattedTime = () => {
    const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, "0")
    const secs = String(sessionSeconds % 60).padStart(2, "0")
    return `${mins}:${secs}`
  }

  // ── Render Connecting State ───────────────────────────────────────────────
  if (connectionStatus === "connecting") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
        <audio ref={audioRef} autoPlay className="hidden" />
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6 max-w-md w-full border border-slate-100">
          {/* Animated Spinner with Avatar */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-rose-200 animate-ping opacity-60" />
            <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-[#990011] animate-spin flex items-center justify-center">
              <span className="text-2xl">🐱</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Đang kết nối phòng luyện nói...
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Đang kết nối với trợ lý cho chủ đề:{" "}
              <span className="font-semibold text-[#990011]">{topicTitle}</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200/80 max-w-xs mx-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Vui lòng chờ trong giây lát...</span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (roomRef.current) roomRef.current.disconnect()
                onBackToSelection?.()
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors underline cursor-pointer"
            >
              Hủy và quay lại danh sách chủ đề
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render Connection Error State ─────────────────────────────────────────
  if (connectionStatus === "failed") {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4">
        <audio ref={audioRef} autoPlay className="hidden" />
        <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-2xs">
            ⚠️
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Không thể kết nối vào phòng luyện nói
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {connectError || "Không thể kết nối với trợ lý. Vui lòng kiểm tra mạng và thử lại."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRetryCount((k) => k + 1)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer"
            >
              🔄 Thử kết nối lại
            </button>
            <button
              type="button"
              onClick={() => {
                if (roomRef.current) roomRef.current.disconnect()
                onBackToSelection?.()
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
            >
              Quay lại danh sách chủ đề
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (connectionStatus === "disconnected") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <audio ref={audioRef} autoPlay className="hidden" />
        <div className="rounded-3xl border border-amber-200 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900">Đang khôi phục kết nối</h2>
          <p className="mt-2 text-sm text-slate-600">Phiên sẽ tự kết thúc nếu kết nối không được khôi phục trong 15 giây.</p>
          <button type="button" className="mt-5 rounded-xl bg-[#990011] px-5 py-3 text-sm font-bold text-white" onClick={() => onConnectionLost?.()}>
            Thử kết nối lại
          </button>
        </div>
      </div>
    )
  }

  // ── Render Connected Speaking Room ────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-5">
      {/* Remote Audio Element for LiveKit Audio */}
      <audio ref={audioRef} autoPlay />

      {/* Top Header & Round Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Right Topic & Round Pill */}
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              connectionStatus === "connected"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            ● {connectionStatus === "connected" ? "Đã vào phòng luyện nói" : "Đang kết nối với trợ lý..."}
          </span>
          <div className="bg-rose-50/50 border border-rose-100 text-[#990011] text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xs">
            <span>🍎 {topicTitle} · Lượt {currentRound}/{totalRounds}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalRounds }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < currentRound ? "bg-[#990011]" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinishEarly}
            disabled={isWrappingUp}
            className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Kết thúc
          </button>
        </div>
      </div>

      {/* Mic Permission Warning Banner */}
      {micError && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs sm:text-sm text-rose-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{micError}</span>
          </div>
          <button
            type="button"
            onClick={handleToggleMic}
            className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 font-bold rounded-lg text-xs cursor-pointer shrink-0"
          >
            Cấp quyền lại
          </button>
        </div>
      )}

      {/* Main Speaking Room Card */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xs">
        {/* Cat Emoticon Avatar Area */}
        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          {/* Visual Cat Avatar */}
          <div className="flex flex-col items-center justify-center select-none">
            {/* 2 Cat Ears */}
            <div className="flex items-center gap-8 mb-1">
              <div
                className={`w-7 h-14 sm:w-8 sm:h-16 rounded-full shadow-inner transform -rotate-6 transition-transform ${
                  isAiSpeaking ? "scale-110 bg-amber-500" : "bg-[#c85a5a]"
                }`}
              />
              <div
                className={`w-7 h-14 sm:w-8 sm:h-16 rounded-full shadow-inner transform rotate-6 transition-transform ${
                  isAiSpeaking ? "scale-110 bg-amber-500" : "bg-[#c85a5a]"
                }`}
              />
            </div>
            {/* Cat Mouth */}
            <span className="text-3xl sm:text-4xl text-[#c85a5a] font-light leading-none tracking-widest">
              ω
            </span>
          </div>

          {/* AI Speaking Status Pill */}
          <div className="bg-rose-50 border border-rose-200/70 text-[#990011] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-2xs">
            <span>{isAiSpeaking ? "AI Tutor Cat Speak đang nói..." : "AI đang lắng nghe bạn..."}</span>
            {isAiSpeaking && (
              <span className="flex items-center gap-0.5 text-xs text-[#990011]">
                <span className="w-1 h-3 bg-[#990011] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-4 bg-[#990011] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-2 bg-[#990011] rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="w-1 h-3.5 bg-[#990011] rounded-full animate-bounce [animation-delay:450ms]" />
              </span>
            )}
          </div>
        </div>

        {/* Warning Banner (Conditional from Agent) */}
        {warnMessage && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <span>⚠️</span>
            <span>{warnMessage}</span>
          </div>
        )}

        {/* 2 Dialogue Cards (Left AI, Right Student) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. AI Tutor Dialogue Card */}
          <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-4.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 tracking-wider uppercase">
                <span>🤖</span>
                <span>AI TUTOR CAT SPEAK</span>
              </div>
              <button
                type="button"
                onClick={handleReplayAi}
                disabled={isWrappingUp || isReplayingAi}
                className="border border-rose-200 text-[#990011] bg-rose-50/50 hover:bg-rose-100/70 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>🔊</span>
                <span>{isReplayingAi ? "Đang phát..." : "Nghe lại"}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-base sm:text-lg font-bold text-[#990011] leading-snug">
                “{aiText}”
              </p>
              {aiPinyin && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {aiPinyin}
                </p>
              )}
              {aiMeaning && (
                <p className="text-xs sm:text-sm text-slate-600 italic">
                  {aiMeaning}
                </p>
              )}
            </div>
          </div>

          {/* 2. Student Dialogue Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-4.5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 tracking-wider uppercase">
                <span>👤</span>
                <span>BẠN (HỌC VIÊN)</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                  isMicActive
                    ? "bg-emerald-100/80 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isMicActive ? "✓ Micro đang bật" : "✕ Micro đang tắt"}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-medium text-slate-700 leading-snug">
                {learnerText}
              </p>
            </div>

            {/* Hint Chips Row */}
            {hints.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-amber-600 shrink-0">
                  💡 Gợi ý:
                </span>
                {hints.map((hint, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendControlPacket("play_hint", hint.id)}
                    className="bg-blue-50/80 border border-blue-200 text-blue-700 hover:bg-blue-100/70 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left flex items-center gap-1"
                  >
                    <span>🗣️</span>
                    <span>“{hint.text}” ({hint.meaning_vi || hint.pinyin})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          {/* Left Timer Pill */}
          <div className="bg-rose-50/60 border border-rose-200/70 text-[#990011] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <span>⏱</span>
            <span>{formattedTime()} / 05:00 · Thu âm phản xạ</span>
          </div>

          {/* Center Big Mic Button & Caption */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleToggleMic}
              disabled={isRequestingMic || isWrappingUp}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 cursor-pointer ${
                isMicActive
                  ? "bg-[#990011] hover:bg-[#85000f] ring-4 ring-rose-100 animate-pulse"
                  : "bg-slate-500 hover:bg-slate-600 ring-2 ring-slate-200"
              } ${isRequestingMic ? "opacity-75 cursor-wait" : ""}`}
              title={isMicActive ? "Nhấn để tắt mic" : "Nhấn để bật mic và bắt đầu nói"}
            >
              {isRequestingMic ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-6 h-6 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </button>
            <span className="text-[11px] text-slate-500 text-center mt-1.5 font-normal">
              {isMicActive
                ? "Micro đang bật · Nhấn để tắt"
                : "Micro đang tắt · Nhấn để bật & cấp quyền"}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVolume(volume === 100 ? 50 : volume === 50 ? 0 : 100)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
            >
              <span>{volume === 0 ? "🔇" : "🔊"}</span>
              <span>{volume}%</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeakingPage
