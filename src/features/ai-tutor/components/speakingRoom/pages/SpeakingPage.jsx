import React, { useState, useEffect, useReducer, useRef } from "react"
import { Room, RoomEvent, Track } from "livekit-client"
import { assistReducer, initialAssistState } from "../../../utils/speakingAssist"

const TOPIC_SUBTITLE = "speaking-subtitle"
const TOPIC_ASSIST = "speaking-assist"
const TOPIC_STATE = "speaking-state"
const TOPIC_CONTROL = "speaking-control"

/**
 * SpeakingPage component - interactive live AI speaking session room
 * connected with LiveKit Realtime Speaking Agent.
 *
 * Phụ đề, pinyin, nghĩa, gợi ý và mẹo sửa lỗi đi qua assistReducer
 * (utils/speakingAssist.js): gói speaking-assist tới trước hay sau phụ đề đều
 * được ghép đúng câu theo turn_index, và câu AI mới thì pinyin của câu cũ bị xóa
 * chứ không hiện nhầm. Cách hiện gợi ý theo BR-SS-009: HSK 1-2 hiện sẵn, HSK 3-4
 * thu vào nút "Gợi ý" (tự mở khi im lặng 10 giây), HSK 5-6 không hiện.
 */

// Câu mẫu khi chưa có phụ đề nào (chưa nối phòng hoặc chạy thử không có token).
const PLACEHOLDER_AI = {
  text: "你好！准备好了吗？",
  pinyin: "Nǐ hǎo! Zhǔnbèi hǎole ma?",
  meaningVi: "Chào bạn! Bạn đã sẵn sàng chưa?",
}

const hintModeForLevel = (hskLevel) => {
  const n = Number(hskLevel)
  if (!n) return null
  if (n <= 2) return "proactive"
  if (n <= 4) return "chip"
  return "none"
}
const SpeakingPage = ({
  sessionData,
  topicTitle = "Mua hoa quả ở chợ",
  onEndSession,
  onSwitchMode,
}) => {
  const [activeTab, setActiveTab] = useState("casual") // 'casual' | 'placement'
  const [isMicActive, setIsMicActive] = useState(true)
  const [isFreeTalk, setIsFreeTalk] = useState(true)
  const [volume, setVolume] = useState(100)
  const [isReplayingAi, setIsReplayingAi] = useState(false)
  
  // Realtime LiveKit Agent States
  const [connectionStatus, setConnectionStatus] = useState(() => sessionData?.token ? "connecting" : "connected")
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(sessionData?.hskLevel > 4 ? 5 : 3)
  const [assist, dispatchAssist] = useReducer(assistReducer, initialAssistState)
  const [chipOpenForSeq, setChipOpenForSeq] = useState(null)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [warnMessage, setWarnMessage] = useState(null)
  const [sessionSeconds, setSessionSeconds] = useState(0)

  const roomRef = useRef(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  // ── LiveKit Room Connection & Event Listeners ─────────────────────────────
  useEffect(() => {
    const token = sessionData?.token
    const serverUrl = sessionData?.serverUrl || "ws://localhost:7880"

    if (!token) {
      return
    }

    let isMounted = true
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

    // 1. Data Packet Listener
    room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
      try {
        const raw = new TextDecoder().decode(payload)
        const data = JSON.parse(raw)

        if (topic === TOPIC_SUBTITLE || topic === TOPIC_ASSIST || topic === TOPIC_STATE) {
          dispatchAssist({ topic, data })
        }

        if (topic === TOPIC_SUBTITLE) {
          if (data.text && data.role !== "learner") {
            setIsAiSpeaking(true)
            setTimeout(() => setIsAiSpeaking(false), 3500)
          }
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

          if (data.phase === "ended") {
            setTimeout(() => {
              onEndSession?.()
            }, 2000)
          }
        }
      } catch (err) {
        console.warn("[SpeakingPage] Error parsing data packet:", err)
      }
    })

    // 2. Remote Audio Track Subscription
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Audio && audioRef.current) {
        track.attach(audioRef.current)
      }
    })

    // 3. Connect & Enable Mic
    async function startRoom() {
      try {
        await room.connect(serverUrl, token)
        if (!isMounted) return
        setConnectionStatus("connected")
        await room.localParticipant.setMicrophoneEnabled(true)
      } catch (err) {
        console.error("[SpeakingPage] LiveKit connect error:", err)
        if (isMounted) setConnectionStatus("connected") // fallback for standalone testing
      }
    }

    startRoom()

    // 4. Session Timer
    timerRef.current = setInterval(() => {
      setSessionSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      isMounted = false
      clearInterval(timerRef.current)
      if (room.state !== "disconnected") {
        room.disconnect()
      }
    }
  }, [sessionData, onEndSession])

  // ── Dữ liệu hiển thị ─────────────────────────────────────────────────────
  const ai = assist.ai || PLACEHOLDER_AI
  const aiText = ai.text
  const aiPinyin = ai.pinyin || ""
  const aiMeaning = ai.meaningVi || ""
  const learnerText = assist.learner?.text || ""
  const hints = assist.hints || []
  const correction = assist.correction
  // Cấp của buổi quyết định cách hiện gợi ý; chỉ khi không biết cấp mới dùng
  // hint_mode trong gói assist.
  const hintMode = hintModeForLevel(sessionData?.hskLevel) || assist.hintMode || "none"
  const chipOpen =
    (assist.ai && chipOpenForSeq === assist.ai.seq) || assist.warn === "silence_10s"

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
    setIsReplayingAi(true)
    sendControlPacket("replay_question")
    setTimeout(() => {
      setIsReplayingAi(false)
    }, 2000)
  }

  const handleToggleMic = async () => {
    const nextState = !isMicActive
    setIsMicActive(nextState)
    if (roomRef.current?.localParticipant) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(nextState)
    }
  }

  const handleFinishEarly = () => {
    sendControlPacket("finish_early")
    setTimeout(() => {
      if (roomRef.current) roomRef.current.disconnect()
      onEndSession?.()
    }, 1200)
  }

  const formattedTime = () => {
    const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, "0")
    const secs = String(sessionSeconds % 60).padStart(2, "0")
    return `${mins}:${secs}`
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-5">
      {/* Remote Audio Element for LiveKit Audio */}
      <audio ref={audioRef} autoPlay />

      {/* Top Header Mode Bar & Round Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Mode Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("casual")
              onSwitchMode?.("casual")
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "casual"
                ? "bg-white border border-rose-200 text-[#990011] shadow-2xs"
                : "bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-white"
            }`}
          >
            ☕ Giao tiếp (Casual Chat)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("placement")
              onSwitchMode?.("placement")
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "placement"
                ? "bg-white border border-rose-200 text-[#990011] font-bold shadow-2xs"
                : "bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-white"
            }`}
          >
            📄 Bài test đầu vào (Placement Test)
          </button>
        </div>

        {/* Right Topic & Round Pill */}
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${connectionStatus === "connected" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            ● {connectionStatus === "connected" ? "LiveKit đã kết nối" : "Đang kết nối..."}
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
            className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Kết thúc
          </button>
        </div>
      </div>

      {/* Main Speaking Room Card */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xs">
        {/* Cat Emoticon Avatar Area */}
        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          {/* Visual Cat Avatar */}
          <div className="flex flex-col items-center justify-center select-none">
            {/* 2 Cat Ears */}
            <div className="flex items-center gap-8 mb-1">
              <div className={`w-7 h-14 sm:w-8 sm:h-16 rounded-full shadow-inner transform -rotate-6 transition-transform ${isAiSpeaking ? "scale-110 bg-amber-500" : "bg-[#c85a5a]"}`} />
              <div className={`w-7 h-14 sm:w-8 sm:h-16 rounded-full shadow-inner transform rotate-6 transition-transform ${isAiSpeaking ? "scale-110 bg-amber-500" : "bg-[#c85a5a]"}`} />
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

        {/* Warning Banner (Conditional) */}
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
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {aiPinyin}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 italic">
                {aiMeaning}
              </p>
            </div>
          </div>

          {/* 2. Student Dialogue Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-4.5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 tracking-wider uppercase">
                <span>👤</span>
                <span>BẠN (HỌC VIÊN)</span>
              </div>
              <span className="bg-emerald-100/80 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                ✓ Đang kết nối mic
              </span>
            </div>

            <div className="space-y-1">
              {learnerText ? (
                <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                  “{learnerText}”
                </p>
              ) : (
                <p className="text-sm sm:text-base font-medium text-slate-700 leading-snug">
                  Đang lắng nghe bạn nói...
                </p>
              )}
            </div>

            {/* Hint Chips Row: BR-SS-009, HSK 1-2 hiện sẵn, HSK 3-4 thu vào nút, HSK 5-6 ẩn */}
            {hintMode !== "none" && hints.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {hintMode === "chip" && !chipOpen ? (
                  <button
                    type="button"
                    onClick={() => setChipOpenForSeq(assist.ai?.seq ?? null)}
                    className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100/70 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    💡 Gợi ý
                  </button>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-amber-600 shrink-0">
                      💡 Gợi ý:
                    </span>
                    {hints.map((hint, idx) => (
                      <button
                        key={hint.id || idx}
                        type="button"
                        onClick={() => sendControlPacket("play_hint", hint.id)}
                        title="Bấm để nghe mẫu giọng AI tốc độ chậm"
                        className="bg-blue-50/80 border border-blue-200 text-blue-700 hover:bg-blue-100/70 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left flex items-center gap-1"
                      >
                        <span>🗣️</span>
                        <span>“{hint.text}” ({hint.meaning_vi || hint.pinyin})</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instant Error Correction Tip: chỉ hiện khi gói assist có correction
            (lỗi cản trở hiểu nghĩa, ASR >= 0,8, dạng đúng không vượt cấp) */}
        {correction && (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 flex items-start sm:items-center gap-2.5 text-xs sm:text-sm shadow-2xs">
            <span className="text-amber-600 font-bold shrink-0 text-base">⚡</span>
            <div className="flex flex-wrap items-center gap-1.5 text-amber-950">
              <span className="font-extrabold text-amber-900 shrink-0">
                MẸO SỬA LỖI TỨC THÌ:
              </span>
              <span>
                Bạn nói: “{correction.original}” ➔ Thử nói: “{correction.corrected}”. {correction.note_vi || ""}
              </span>
            </div>
          </div>
        )}

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
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 cursor-pointer ${
                isMicActive
                  ? "bg-[#990011] hover:bg-[#85000f] ring-4 ring-rose-100"
                  : "bg-slate-400 hover:bg-slate-500"
              }`}
              title={isMicActive ? "Nhấn để tắt mic" : "Nhấn để bật mic"}
            >
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
            <span className="text-[11px] text-slate-500 text-center mt-1.5 font-normal">
              {isMicActive
                ? "Nhấn để tắt mic · Tự động nhận diện giọng nói"
                : "Mic đang tắt · Nhấn để bật lại"}
            </span>
          </div>

          {/* Right Mode & Volume Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFreeTalk(!isFreeTalk)}
              className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                isFreeTalk
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70"
                  : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{isFreeTalk ? "🟢" : "⚪"}</span>
              <span>Nói tự do: {isFreeTalk ? "BẬT" : "TẮT"}</span>
            </button>
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
