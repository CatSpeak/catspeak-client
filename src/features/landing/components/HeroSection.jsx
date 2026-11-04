import { useEffect, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { useAuth } from "@/features/auth"
import { useNavigate } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import { ArrowRight, Bot, Pause, Play, Sparkles, Users } from "lucide-react"

const HeroSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (typeof window === "undefined") return "en"
    const savedLanguage = window.localStorage.getItem("communityLanguage")
    return ["en", "zh", "ja"].includes(savedLanguage) ? savedLanguage : "en"
  })
  const [selectedRoom, setSelectedRoom] = useState("human")
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)

  const heroT = t?.landing?.hero || {}
  const homeT = t?.home || {}
  const previewT = heroT.preview || {}
  const languageContent = previewT.contentByLanguage?.[selectedLanguage] || {}
  const summaryT = heroT.summary || {}
  const languages = [
    { code: "en", label: "EN" },
    { code: "zh", label: "中文" },
    { code: "ja", label: "日本語" },
  ]
  const speechSamples = {
    en:
      languageContent.audioText ||
      "That sounds like a sensible adjustment.",
    zh: languageContent.audioText || "这个调整听起来很合理。",
    ja: languageContent.audioText || "その調整はとても妥当だと思います。",
  }

  useEffect(
    () => () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    },
    [],
  )

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language)
    window.localStorage.setItem("communityLanguage", language)
    setAudioError(false)
    if (isAudioPlaying && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsAudioPlaying(false)
    }
  }

  const handleAudioToggle = () => {
    if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
      setAudioError(true)
      return
    }

    if (isAudioPlaying) {
      window.speechSynthesis.cancel()
      setIsAudioPlaying(false)
      return
    }

    const utterance = new window.SpeechSynthesisUtterance(
      speechSamples[selectedLanguage],
    )
    utterance.lang =
      selectedLanguage === "zh"
        ? "zh-CN"
        : selectedLanguage === "ja"
          ? "ja-JP"
          : "en-US"
    utterance.onend = () => setIsAudioPlaying(false)
    utterance.onerror = () => {
      setIsAudioPlaying(false)
      setAudioError(true)
    }

    setAudioError(false)
    setIsAudioPlaying(true)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const handleAction = () => {
    if (!isAuthenticated) {
      openAuthModal?.("login")
      return
    }

    const target =
      selectedRoom === "ai"
        ? `/${selectedLanguage}/ai-tutor/speaking-room`
        : `/${selectedLanguage}/community`
    navigate(target)
  }

  return (
    <section
      id="problem"
      className="w-full scroll-mt-[72px] bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-8 lg:py-0"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:min-h-[560px] lg:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.95fr)] lg:gap-8 xl:gap-10">
        <div className="flex flex-col justify-center lg:py-10">
          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#990011] sm:text-sm"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#70D6B2]" />
            <span>
              {heroT.subtitle ||
                homeT.subtitle ||
                "Cộng đồng luyện nói 3 ngôn ngữ Anh · Trung · Nhật · hoạt động 24/7"}
            </span>
          </Motion.div>

          <Motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="max-w-[720px] text-[clamp(2.35rem,4.2vw,3.35rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#171717]"
          >
            {heroT.titlePrefix || homeT.heroTitle1 || "Tự tin luyện nói ngoại ngữ cùng"}{" "}
            <span className="text-[#A90016]">
              {heroT.titleHighlight || homeT.heroTitle2 || "cộng đồng"}
            </span>{" "}
            {heroT.titleSuffix || "và AI"}
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24 }}
            className="mt-6 max-w-[680px] text-base leading-[1.75] text-[#555] sm:text-lg"
          >
            {heroT.description ||
              homeT.heroSubtitle ||
              "Biến kiến thức thành những cuộc trò chuyện thực tế. Kết nối với người học ngôn ngữ, thực hành trong môi trường tương tác và khám phá cách AI hỗ trợ hành trình luyện nói của bạn."}
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32 }}
            className="mt-7"
          >
            <button
              type="button"
              onClick={handleAction}
              className="group inline-flex h-[52px] items-center justify-center gap-3 rounded-xl bg-[#A90016] px-7 text-base font-semibold text-white shadow-[0_3px_8px_rgba(169,0,22,0.18)] transition-colors hover:bg-[#890012]"
            >
              <span>{heroT.ctaButton || "Tham gia CAT SPEAK"}</span>
              <ArrowRight
                size={19}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 grid grid-cols-3 border-t border-[#EEEEEE] pt-4"
          >
            {[
              {
                label: summaryT.roomLabel || "Hình thức phòng",
                value: summaryT.roomValue || "Room 1–1 & Nhóm",
              },
              {
                label: summaryT.languagesLabel || "3 Ngôn ngữ trọng tâm",
                value: summaryT.languagesValue || "Anh · Trung · Nhật",
              },
              {
                label: summaryT.aiLabel || "Trợ lý đồng hành",
                value: summaryT.aiValue || "AI phản xạ 24/7",
              },
            ].map(({ label, value }, index) => (
              <div key={label} className="min-w-0 pr-2 sm:pr-4">
                <p className="text-xs leading-5 text-[#777] sm:text-sm">{label}</p>
                <p
                  className={`mt-0.5 text-xs font-semibold leading-5 sm:text-sm ${
                    index === 1 ? "text-[#A90016]" : "text-[#171717]"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </Motion.div>
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full justify-self-center lg:justify-self-end"
        >
          <div className="overflow-hidden rounded-[18px] border border-[#E5E5E5] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
            <div className="flex min-h-[62px] items-center justify-between gap-2 bg-[#242424] px-4 sm:px-5">
              <p className="flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-white sm:text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#B00018]" />
                <span className="truncate">
                  {previewT.roomTitle || "Phòng luyện ngôn ngữ"}
                </span>
              </p>
              <div
                className="flex shrink-0 items-center gap-0.5 rounded-lg border border-white/15 bg-white/5 p-0.5"
                aria-label={previewT.chooseLanguage || "Choose practice language"}
              >
                {languages.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={selectedLanguage === code}
                    onClick={() => handleLanguageSelect(code)}
                    className={`rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors sm:px-2.5 sm:text-xs ${
                      selectedLanguage === code
                        ? "bg-[#A90016] text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex h-[58px] items-center justify-around border-b border-[#E8E8E8] bg-[#FAFAFA] px-2 sm:px-3">
              <button
                type="button"
                aria-pressed={selectedRoom === "human"}
                onClick={() => setSelectedRoom("human")}
                className={`inline-flex h-[36px] items-center justify-center gap-2 rounded-lg px-3 text-[11px] font-semibold transition-colors sm:px-4 sm:text-xs ${
                  selectedRoom === "human"
                    ? "border border-[#E5E5E5] bg-white text-[#A90016] shadow-sm"
                    : "text-[#555] hover:bg-white"
                }`}
              >
                <Users size={15} aria-hidden="true" />
                <span>{previewT.humanRoom || "Room 1–1 Người Thật"}</span>
              </button>
              <button
                type="button"
                aria-pressed={selectedRoom === "ai"}
                onClick={() => setSelectedRoom("ai")}
                className={`inline-flex h-[36px] items-center justify-center gap-2 rounded-lg px-3 text-[11px] font-semibold transition-colors sm:px-4 sm:text-xs ${
                  selectedRoom === "ai"
                    ? "border border-[#E5E5E5] bg-white text-[#A90011] shadow-sm"
                    : "text-[#555] hover:bg-white"
                }`}
              >
                <Bot size={15} className="text-[#F3A126]" aria-hidden="true" />
                <span>{previewT.aiRoom || "AI Hội Thoại 24/7"}</span>
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex min-h-[88px] items-start justify-between gap-3 rounded-xl border border-[#EAEAEA] bg-[#F5F5F5] p-3 sm:p-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#777] sm:text-xs">
                    {languageContent.topicLabel ||
                      previewT.topicLabel ||
                      "Chủ đề buổi nói (Tiếng Anh)"}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-[#171717] sm:text-base">
                    {languageContent.topic ||
                      previewT.topic ||
                      "Workplace Negotiation: Discussing Project Deadlines"}
                  </p>
                </div>
                <div className="shrink-0 rounded-md border border-[#E5E5E5] bg-white px-2 py-1 text-[10px] font-semibold leading-4 text-[#A90016] sm:text-xs">
                  {previewT.timeLeft || "12:00 còn lại"}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A90016] text-white">
                  {selectedRoom === "ai" ? (
                    <Bot size={15} aria-hidden="true" />
                  ) : (
                    <span className="text-[10px] font-bold">
                      {languageContent.speakerInitials || "LM"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-[#F4F4F4] px-3 py-3 sm:px-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#171717] sm:text-sm">
                      {selectedRoom === "ai"
                        ? previewT.aiSpeaker || "CATSPEAK AI Coach"
                        : languageContent.speaker ||
                          previewT.speaker ||
                          "Linh Mai (Hà Nội)"}
                    </p>
                    <span className="text-[10px] text-[#999] sm:text-xs">
                      {previewT.justNow || "Vừa xong"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-[1.55] text-[#333] sm:text-sm">
                    {languageContent.message ||
                      previewT.message ||
                      '"Hi! Considering the new client requirements, do you think we can extend the sprint delivery by two days?"'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 rounded-2xl rounded-tr-md border border-[#FFDADA] bg-[#FFF8F8] px-3 py-3 sm:px-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#A90016] sm:text-sm">
                      {previewT.yourTurn || "Lượt nói của bạn"}
                    </p>
                    <span className="text-[10px] font-medium text-[#009878] sm:text-xs">
                      {previewT.recognized || "Đã nhận diện"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-[1.55] text-[#333] sm:text-sm">
                    {languageContent.reply ||
                      previewT.reply ||
                      '"I agree with you. If we push it to Thursday, our team can guarantee zero bug releases."'}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#222] text-xs font-semibold text-white shadow-sm">
                  {previewT.you || "Bạn"}
                </div>
              </div>

              <div className="flex min-h-[58px] items-center gap-3 rounded-xl bg-[#171717] px-3 text-white sm:px-4">
                <button
                  type="button"
                  onClick={handleAudioToggle}
                  aria-label={
                    isAudioPlaying
                      ? previewT.stopAudio || "Tạm dừng âm thanh"
                      : previewT.playAudio || "Phát âm thanh"
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A90016] transition-colors hover:bg-[#C0001B]"
                >
                  {isAudioPlaying ? (
                    <Pause size={15} fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play size={15} fill="currentColor" aria-hidden="true" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold sm:text-sm">
                    {isAudioPlaying
                      ? previewT.stopAudio || "Tạm dừng âm thanh"
                      : languageContent.sampleAudio ||
                        previewT.sampleAudio ||
                        previewT.playAudio ||
                        "Phát âm thanh"}
                  </p>
                  <p className="text-[10px] text-[#BDBDBD] sm:text-xs">
                    {audioError
                      ? previewT.audioUnavailable || "Trình duyệt không hỗ trợ phát âm thanh"
                      : previewT.audioDescription || "Ngữ điệu tự nhiên · Phản xạ thực chiến"}
                  </p>
                </div>
                <div className="hidden items-center gap-1 sm:flex" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, index) => (
                    <span
                      key={index}
                      className={`h-1 rounded-full ${
                        isAudioPlaying ? "animate-pulse bg-[#C5C5C5]" : "bg-[#555]"
                      }`}
                      style={{ width: `${3 + (index % 3)}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#FFE2A3] bg-[#FFFCF2] p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#A90016] sm:text-sm">
                    <Sparkles size={14} aria-hidden="true" />
                    {previewT.aiFeedback || "Gợi ý phản xạ thông minh từ AI"}
                  </p>
                  <span className="rounded bg-[#FFF0C9] px-1.5 py-0.5 text-[10px] font-semibold text-[#A66A00] sm:text-xs">
                    {previewT.confidence || "Độ tự nhiên: 96%"}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-[1.6] text-[#666] sm:text-xs">
                  {languageContent.suggestion ||
                    previewT.suggestion ||
                    'Thay vì nói "I agree with you", bạn có thể diễn đạt tự nhiên hơn trong bối cảnh công sở: "That sounds like a sensible adjustment".'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAction}
                className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#A90016] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#890012] sm:text-sm"
              >
                <span>{previewT.enterRoom || "Vào phòng luyện ngôn ngữ"}</span>
                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </Motion.div>
      </div>
    </section>
  )
}

export default HeroSection
