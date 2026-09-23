import React, { useState } from "react"

/**
 * SpeakingPage component - interactive live AI speaking session room
 * with AI cat tutor avatar, dialogue cards, error correction hints,
 * reflection timer, mic recording controls, and mode switcher.
 */
const SpeakingPage = ({
  topicTitle = "Mua hoa quả ở chợ",
  currentRound = 2,
  totalRounds = 4,
  initialTime = "00:18",
  maxTime = "00:45",
  onEndSession,
  onSwitchMode,
}) => {
  const [activeTab, setActiveTab] = useState("casual") // 'casual' | 'placement'
  const [isMicActive, setIsMicActive] = useState(true)
  const [isFreeTalk, setIsFreeTalk] = useState(true)
  const [volume, setVolume] = useState(100)
  const [isReplayingAi, setIsReplayingAi] = useState(false)

  const handleReplayAi = () => {
    setIsReplayingAi(true)
    setTimeout(() => {
      setIsReplayingAi(false)
    }, 2000)
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-5">
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
      </div>

      {/* Main Speaking Room Card */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xs">
        {/* Cat Emoticon Avatar Area */}
        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          {/* Visual Cat Avatar */}
          <div className="flex flex-col items-center justify-center select-none">
            {/* 2 Cat Ears */}
            <div className="flex items-center gap-8 mb-1">
              <div className="w-7 h-14 sm:w-8 sm:h-16 bg-[#c85a5a] rounded-full shadow-inner transform -rotate-6" />
              <div className="w-7 h-14 sm:w-8 sm:h-16 bg-[#c85a5a] rounded-full shadow-inner transform rotate-6" />
            </div>
            {/* Cat Mouth */}
            <span className="text-3xl sm:text-4xl text-[#c85a5a] font-light leading-none tracking-widest">
              ω
            </span>
          </div>

          {/* AI Speaking Status Pill */}
          <div className="bg-rose-50 border border-rose-200/70 text-[#990011] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-2xs">
            <span>AI Tutor Cat Speak đang nói...</span>
            <span className="flex items-center gap-0.5 text-xs text-[#990011]">
              <span className="w-1 h-3 bg-[#990011] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-4 bg-[#990011] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-2 bg-[#990011] rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="w-1 h-3.5 bg-[#990011] rounded-full animate-bounce [animation-delay:450ms]" />
            </span>
          </div>
        </div>

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
                “你好！你想买什么苹果？这里的红富士很新鲜！”
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Nǐ hǎo! Nǐ xiǎng mǎi shénme píngguǒ? Zhèlǐ de hóngfùshì...
              </p>
              <p className="text-xs sm:text-sm text-slate-600 italic">
                Chào bạn! Bạn muốn mua táo gì? Táo Phú Sĩ ở đây rất tươi ngon!
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
                ✓ 94% Chuẩn
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                “我想买两斤。(Wǒ xiǎng mǎi liǎng jīn.)”
              </p>
            </div>

            {/* Hint Row */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-amber-600 shrink-0">
                💡 Gợi ý:
              </span>
              <button
                type="button"
                className="bg-blue-50/80 border border-blue-200 text-blue-700 hover:bg-blue-100/70 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
              >
                “这个多少钱一斤？” (Bao nhiêu 1 cân?)
              </button>
            </div>
          </div>
        </div>

        {/* Instant Error Correction Tip */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 flex items-start sm:items-center gap-2.5 text-xs sm:text-sm shadow-2xs">
          <span className="text-amber-600 font-bold shrink-0 text-base">⚡</span>
          <div className="flex flex-wrap items-center gap-1.5 text-amber-950">
            <span className="font-extrabold text-amber-900 shrink-0">
              MẸO SỬA LỖI TỨC THÌ:
            </span>
            <span>
              Sai: “我要二斤” ➔ Đúng: “我要两斤” (Lượng từ 斤 dùng 两, không dùng 二).
            </span>
          </div>
        </div>

        {/* Bottom Control Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          {/* Left Timer Pill */}
          <div className="bg-rose-50/60 border border-rose-200/70 text-[#990011] text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <span>⏱</span>
            <span>{initialTime} / {maxTime} · Thu âm phản xạ</span>
          </div>

          {/* Center Big Mic Button & Caption */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsMicActive(!isMicActive)}
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
