import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParticipants } from "@livekit/components-react"
import { toast } from "react-hot-toast"

const GameSetupModal = ({ open, onClose }) => {
  const { t } = useLanguage()
  const allParticipants = useParticipants()
  const [selectedLevel, setSelectedLevel] = useState("easy")
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const [selectedGame, setSelectedGame] = useState("picture_it")

  const handleStart = () => {
    if (allParticipants.length < 2) {
      toast.error(
        t.rooms?.game?.crackIt?.notEnoughPlayers ||
        "Cần ít nhất 2 người để bắt đầu trò chơi!",
      )
      return
    }
    const event = new CustomEvent("hostStartGame", {
      detail: { gameId: selectedGame, level: selectedLevel, language: selectedLanguage },
    })
    window.dispatchEvent(event)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.game?.setup?.title || "Start a game"}
      className="bg-white text-slate-900 w-full max-w-3xl md:rounded-3xl overflow-hidden md:border border-gray-200 shadow-2xl"
      headerClassName="flex items-center justify-between p-4 pl-6 border-b border-gray-100"
      fullScreenOnMobile={true}
    >
      <div className="py-6 px-6 text-slate-600 flex flex-col gap-6">

        {/* Chọn Game */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chọn Cấp độ */}
          <div className="flex flex-col gap-2 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cath-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <label className="font-semibold text-slate-700">
                {t.rooms?.game?.setup?.selectLevel || "Difficulty"}
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-2">{t.rooms?.game?.setup?.difficultyDesc || "Adjust the challenge level for your room."}</p>
            <Dropdown
              options={[
                { label: t.rooms?.game?.setup?.levelEasy || "Easy", value: "easy" },
                { label: t.rooms?.game?.setup?.levelMedium || "Medium", value: "medium" },
                { label: t.rooms?.game?.setup?.levelHard || "Hard", value: "hard" },
              ]}
              value={selectedLevel}
              onChange={(val) => setSelectedLevel(val)}
              dropdownClassName="w-full max-w-full"
              triggerClassName="w-full justify-between bg-white border border-gray-200 text-slate-800 rounded-xl px-4 py-3 outline-none hover:border-cath-red-400 transition-all shadow-sm"
            />
          </div>

          {/* Chọn Ngôn ngữ */}
          <div className="flex flex-col gap-2 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cath-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <label className="font-semibold text-slate-700">
                {t.rooms?.game?.setup?.selectLanguage || "Language"}
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-2">{t.rooms?.game?.setup?.languageDesc || "Choose the language for this session."}</p>
            <Dropdown
              options={[
                { label: t.rooms?.game?.setup?.langEn || "English", value: "en" },
                { label: t.rooms?.game?.setup?.langZh || "Tiếng Trung", value: "zh" },
              ]}
              value={selectedLanguage}
              onChange={(val) => setSelectedLanguage(val)}
              dropdownClassName="w-full max-w-full"
              triggerClassName="w-full justify-between bg-white border border-gray-200 text-slate-800 rounded-xl px-4 py-3 outline-none hover:border-cath-red-400 transition-all shadow-sm"
            />
          </div>
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
