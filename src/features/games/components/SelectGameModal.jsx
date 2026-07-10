import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { CheckCircle2, Clock3, Gamepad2, Globe2, Sparkles, Users2 } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { PillButton } from "@/shared/components/ui/buttons"
import { DIFFICULTIES, GAME_OPTIONS, LANGUAGES } from "../data/mockInfomationGame"


const SelectGameModal = ({ open, onClose, onGameStart }) => {
  const [selectedGame, setSelectedGame] = useState(GAME_OPTIONS[0].id)
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [selectedLanguage, setSelectedLanguage] = useState("english")

  const handleStart = () => {
    onGameStart?.({
      gameId: selectedGame,
      difficulty: selectedDifficulty,
      language: selectedLanguage,
    })
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start a game"
      className="max-w-[900px] w-full h-auto bg-white shadow-faq-card"
      bodyClassName="overflow-y-auto"
    >
      <div className="space-y-4 px-6 overflow-y-auto">
        {/* Select game type */}
        <div className="grid gap-3 md:grid-cols-2 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-4 sm:p-5">
          {GAME_OPTIONS.map((game) => {
            const isActive = game.id === selectedGame;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGame(game.id)}
                className={`group relative flex flex-col items-start gap-4 rounded-[24px] border p-4 text-left transition ${isActive
                  ? "border-cath-red-700 bg-white shadow-faq-card"
                  : "border-[#E5E5E5] bg-white/70 hover:border-[#D0D0D0] hover:bg-white"
                  }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-black">
                      {game.title}
                    </h4>
                    {isActive && (
                      <CheckCircle2 size={17} className="text-cath-red-700" />
                    )}
                  </div>
                  <p className="text-sm leading-6 text-[#606060]">
                    {game.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Select level & language */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF6F6] text-[#990011]">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#121212]">
                  Difficulty
                </p>
                <p className="text-xs text-[#606060]">
                  Adjust the challenge level for your room.
                </p>
              </div>
            </div>
            <Dropdown
              className="w-full"
              dropdownClassName="min-w-full max-w-full"
              triggerClassName="h-12 rounded-2xl border-[#E5E5E5] bg-[#FBFBFB] px-4 text-sm font-medium text-[#121212]"
              placeholder="Select difficulty"
              value={selectedDifficulty}
              onChange={(value) => setSelectedDifficulty(value)}
              options={DIFFICULTIES.map((difficulty) => ({
                value: difficulty.id,
                label: difficulty.label,
                subtitle: difficulty.helper,
              }))}
            />
          </div>

          <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF6F6] text-[#990011]">
                <Globe2 size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#121212]">Language</p>
                <p className="text-xs text-[#606060]">
                  Choose the language for this session.
                </p>
              </div>
            </div>
            <Dropdown
              className="w-full"
              dropdownClassName="min-w-full max-w-full"
              triggerClassName="h-12 rounded-2xl border-[#E5E5E5] bg-[#FBFBFB] px-4 text-sm font-medium text-[#121212]"
              placeholder="Select language"
              value={selectedLanguage}
              onChange={(value) => setSelectedLanguage(value)}
              options={LANGUAGES.map((language) => ({
                value: language.id,
                label: language.label,
              }))}
            />
          </div>
        </div>

        {/* Button action */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#F0F0F0] bg-[#FCFCFC] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <PillButton
            variant="secondary"
            onClick={onClose}
            className="md:h-12 h-10 w-full sm:flex-1 shrink-0 bg-white border border-[#e5e5e5] shadow-sm hover:bg-gray-50 py-2 px-4 text-[18px] rounded-[35px] text-[#7B7979]"
          >
            Cancel
          </PillButton>

          <PillButton
            onClick={handleStart}
            className="md:h-12 h-10 w-full sm:flex-1 shrink-0 py-2 px-4 text-[18px] rounded-[35px] text-[#F5F5F5]"
          >
            Start
          </PillButton>
        </div>
      </div>
    </Modal>
  );
}

export default SelectGameModal
