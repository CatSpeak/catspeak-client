import React, { useState, useEffect } from "react"
import Modal from "@/shared/components/ui/Modal"
import Slider from "@/shared/components/ui/Slider"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  VOICE_AVAILABILITY,
  DEFAULT_AI_SETTINGS,
  SPEED_CONFIG,
  AI_SETTINGS_STORAGE_KEY,
} from "../config/aiSessionConfig"

const VOICES = ["female", "male"]

// Map the URL lang param to the foreign-language value used by the modal/backend.
const foreignLanguageForUrlLang = (urlLang) =>
  urlLang === "zh" ? "chinese" : "english"

const AISessionSettingsModal = ({ open, onConfirm, onCancel, urlLang }) => {
  const { t } = useLanguage()
  const s = t.rooms.aiSettings

  const foreignLanguage = foreignLanguageForUrlLang(urlLang)

  // Human-readable label for a language value.
  const languageLabel = (value) =>
    value === "vietnamese"
      ? s.vietnamese
      : value === "chinese"
        ? s.chinese
        : s.english

  const voiceLabel = (voice) => (voice === "male" ? s.voiceMale : s.voiceFemale)

  const [language, setLanguage] = useState(foreignLanguage)
  const [speed, setSpeed] = useState(SPEED_CONFIG.default)
  const [voice, setVoice] = useState(DEFAULT_AI_SETTINGS.voice)

  // Load persisted settings (or defaults) every time the modal opens.
  useEffect(() => {
    if (!open) return

    let saved = null
    try {
      const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY)
      saved = raw ? JSON.parse(raw) : null
    } catch {
      saved = null
    }

    const initialLanguage = saved?.language ?? foreignLanguage
    const available = VOICE_AVAILABILITY[initialLanguage] ?? ["female"]
    const savedVoice = saved?.voice ?? DEFAULT_AI_SETTINGS.voice
    const initialVoice = available.includes(savedVoice)
      ? savedVoice
      : available[0]

    setLanguage(initialLanguage)
    setSpeed(
      typeof saved?.speed === "number" ? saved.speed : SPEED_CONFIG.default,
    )
    setVoice(initialVoice)
  }, [open, foreignLanguage])

  // When language changes, reset voice if the current one is unavailable.
  const handleSelectLanguage = (value) => {
    setLanguage(value)
    const available = VOICE_AVAILABILITY[value] ?? ["female"]
    if (!available.includes(voice)) {
      setVoice(available[0])
    }
  }

  const handleConfirm = () => {
    const settings = { language, speed, voice }
    try {
      localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // localStorage unavailable — proceed with in-memory settings.
    }
    onConfirm(settings)
  }

  const availableVoices = VOICE_AVAILABILITY[language] ?? ["female"]

  // Language options: foreign (from URL) + Vietnamese.
  const languageOptions = [foreignLanguage, "vietnamese"]

  const pillClass = (active) =>
    `inline-flex h-10 items-center rounded-full px-4 text-sm border transition-colors ${
      active
        ? "bg-cath-red-700 border-cath-red-700 text-white hover:bg-cath-red-800 hover:border-cath-red-800"
        : "border-[#C6C6C6] hover:bg-[#F2F2F2]"
    }`

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={s.title}
      className="max-w-sm min-[426px]:max-w-md max-[425px]:max-w-none max-[425px]:h-full max-[425px]:flex max-[425px]:flex-col"
    >
      <div className="flex flex-col gap-6 pb-2 max-h-[60vh] overflow-y-auto -mx-3 px-3 scrollbar-app-transparent max-[425px]:max-h-none max-[425px]:flex-1">
        {/* Language */}
        <div className="text-left flex flex-col">
          <label className="text-sm mb-2">{s.language}</label>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelectLanguage(value)}
                className={pillClass(language === value)}
              >
                {languageLabel(value)}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="text-left flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm">{s.speed}</label>
            <span className="text-sm font-medium tabular-nums">
              {speed.toFixed(1)}×
            </span>
          </div>
          <Slider
            value={speed}
            min={SPEED_CONFIG.min}
            max={SPEED_CONFIG.max}
            step={SPEED_CONFIG.step}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-xs text-[#7A7574] mt-1">
            <span>{s.speedSlow}</span>
            <span>{s.speedNormal}</span>
            <span>{s.speedFast}</span>
          </div>
        </div>

        {/* Voice */}
        <div className="text-left flex flex-col">
          <label className="text-sm mb-2">{s.voice}</label>
          <div className="flex flex-wrap gap-2">
            {VOICES.map((v) => {
              const isAvailable = availableVoices.includes(v)
              const isSelected = voice === v
              const tooltip = isAvailable
                ? undefined
                : s.voiceUnavailable
                    .replace("{{voice}}", voiceLabel(v))
                    .replace("{{language}}", languageLabel(language))
              return (
                <button
                  key={v}
                  type="button"
                  title={tooltip}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && setVoice(v)}
                  className={`${pillClass(isSelected)} ${
                    isAvailable ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {voiceLabel(v)}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-wrap justify-end gap-2">
        <PillButton onClick={onCancel} variant="secondary" className="h-10">
          {s.cancel}
        </PillButton>
        <PillButton onClick={handleConfirm} className="h-10">
          {s.start}
        </PillButton>
      </div>
    </Modal>
  )
}

export default AISessionSettingsModal
