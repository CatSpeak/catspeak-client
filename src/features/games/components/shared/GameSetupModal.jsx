import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParams } from "react-router-dom"
import { Lock } from "lucide-react"

const GameSetupModal = ({ open, onClose }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const [selectedLevel, setSelectedLevel] = useState("easy")

  const [selectedGame, setSelectedGame] = useState("picture_it")

  // Ngôn ngữ game luôn ăn theo cộng đồng (URL :lang).
  // Hỗ trợ 3 ngôn ngữ: tiếng Anh (en), tiếng Trung (zh), tiếng Việt (vi).
  const communityLanguage = ["zh", "vi"].includes(lang) ? lang : "en"

  const languageLabel =
    communityLanguage === "zh"
      ? (t.rooms?.game?.setup?.langZh || "Tiếng Trung")
      : communityLanguage === "vi"
        ? (t.rooms?.game?.setup?.langVi || "Tiếng Việt")
        : (t.rooms?.game?.setup?.langEn || "Tiếng Anh")

  const handleStart = () => {
    const event = new CustomEvent("hostStartGame", {
      detail: { gameId: selectedGame, level: selectedLevel, language: communityLanguage },
    })
    window.dispatchEvent(event)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.game?.setup?.title || "Start a game"}
      className="bg-white text-slate-900 w-full max-w-2xl md:rounded-3xl overflow-hidden md:border border-gray-200 shadow-2xl"
      headerClassName="flex items-center justify-between p-4 pl-6 border-b border-gray-100"
      fullScreenOnMobile={true}
    >
      <div className="py-5 px-6 text-slate-600 flex flex-col gap-5">

        {/* Read-only language chip + locked note */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold shrink-0">
              {t.rooms?.game?.setup?.selectLanguage || "Language"}
            </span>
            <span className="text-sm font-semibold text-slate-800 truncate">
              {languageLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold shrink-0">
            <Lock size={12} className="text-slate-400" />
            <span>{t.rooms?.game?.setup?.lockedHint || "Locked"}</span>
          </div>
        </div>

        {/* Chọn Game */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedGame("picture_it")}
            className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${selectedGame === "picture_it"
                ? "border-cath-red-600 bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300"
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-slate-800 text-lg">Picture IT</span>
              {selectedGame === "picture_it" && (
                <svg className="w-5 h-5 text-cath-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {t.rooms?.game?.setup?.pictureItDesc || "Describe an image using the room language. Other players will rate your description."}
            </p>
          </button>

          <button
            onClick={() => setSelectedGame("crack_it")}
            className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${selectedGame === "crack_it"
                ? "border-cath-red-600 bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300"
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-slate-800 text-lg">Crack IT</span>
              {selectedGame === "crack_it" && (
                <svg className="w-5 h-5 text-cath-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {t.rooms?.game?.setup?.crackItDesc || "Guess hidden words from hints before everyone else."}
            </p>
          </button>
        </div>

        {/* Chọn Cấp độ (full width) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cath-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <label className="font-semibold text-slate-700">
              {t.rooms?.game?.setup?.selectLevel || "Difficulty"}
            </label>
          </div>
          <p className="text-xs text-slate-500">
            {t.rooms?.game?.setup?.difficultyDesc || "Adjust the challenge level for your room."}
          </p>
          <Dropdown
            options={[
              { label: t.rooms?.game?.setup?.levelEasy || "Easy", value: "easy" },
              { label: t.rooms?.game?.setup?.levelMedium || "Medium", value: "medium" },
              { label: t.rooms?.game?.setup?.levelHard || "Hard", value: "hard" },
            ]}
            value={selectedLevel}
            onChange={(val) => setSelectedLevel(val)}
            dropdownClassName="w-full max-w-full"
            trigger={(isOpen, selectedOption, toggle) => (
              <button
                type="button"
                onClick={toggle}
                className="w-full flex items-center justify-between bg-white border border-gray-200 text-slate-800 rounded-xl px-4 h-12 outline-none hover:border-cath-red-400 transition-all shadow-sm font-medium"
              >
                <span className="truncate text-sm">{selectedOption?.label || t.rooms?.game?.setup?.levelMedium || "Medium"}</span>
                <svg className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          />
        </div>
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-slate-700 transition-all"
        >
          {t.rooms?.game?.setup?.cancel || "Hủy"}
        </button>
        <button
          onClick={handleStart}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-cath-red-600 hover:bg-cath-red-700 text-white shadow-lg shadow-cath-red-500/25 transition-all"
        >
          {t.rooms?.game?.setup?.startNow || "Start"}
        </button>
      </div>
    </Modal>
  )
}

export default GameSetupModal