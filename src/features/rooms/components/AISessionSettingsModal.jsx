import React, { useState, useEffect, useMemo } from "react"
import Modal from "@/shared/components/ui/Modal"
import Slider from "@/shared/components/ui/Slider"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LEVELS } from "../config/constants"
import {
  VOICE_AVAILABILITY,
  DEFAULT_AI_SETTINGS,
  SPEED_CONFIG,
  AI_SETTINGS_STORAGE_KEY,
  SUPPORT_LANGUAGES,
} from "../config/aiSessionConfig"

const VOICES = ["female", "male"]

// Map the URL lang param to the foreign-language value used by the modal/backend.
const languageForUrlLang = (urlLang) => {
  if (urlLang === "zh") {
    return { apiValue: "chinese", levelsKey: "Chinese" }
  }
  if (urlLang === "vi") {
    return { apiValue: "vietnamese", levelsKey: "Vietnamese" }
  }
  return { apiValue: "english", levelsKey: "English" }
}

const AISessionSettingsModal = ({ open, onConfirm, onCancel, urlLang }) => {
  const { t } = useLanguage()
  const s = t.rooms.aiSettings

  const { apiValue: foreignLanguage, levelsKey } = languageForUrlLang(urlLang)
  const proficiencyLevels = useMemo(() => LEVELS[levelsKey] ?? [], [levelsKey])
  const availableSupportLanguages = useMemo(
    () => SUPPORT_LANGUAGES.filter((value) => value !== foreignLanguage),
    [foreignLanguage],
  )

  // Human-readable label for a language value.
  const languageLabel = (value) =>
    value === "vietnamese"
      ? s.vietnamese
      : value === "chinese"
        ? s.chinese
        : s.english

  const voiceLabel = (voice) => (voice === "male" ? s.voiceMale : s.voiceFemale)

  const [supportLanguage, setSupportLanguage] = useState(null)
  const [speed, setSpeed] = useState(SPEED_CONFIG.default)
  const [voice, setVoice] = useState(DEFAULT_AI_SETTINGS.voice)
  const [proficiencyLevel, setProficiencyLevel] = useState(
    DEFAULT_AI_SETTINGS.proficiencyLevel,
  )

  const isValidProficiencyLevel = (value) =>
    proficiencyLevels.some((level) => level.value === value)

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

    // supportLanguage is persisted; learningLanguage is always re-derived from URL.
    const savedSupport = availableSupportLanguages.includes(saved?.supportLanguage)
      ? saved.supportLanguage
      : null
    setSupportLanguage(savedSupport)

    const available = VOICE_AVAILABILITY[foreignLanguage] ?? ["female"]
    const savedVoice = saved?.voice ?? DEFAULT_AI_SETTINGS.voice
    setVoice(available.includes(savedVoice) ? savedVoice : available[0])

    setSpeed(
      typeof saved?.speed === "number" ? saved.speed : SPEED_CONFIG.default,
    )
    const savedProficiency = isValidProficiencyLevel(saved?.proficiencyLevel)
      ? saved.proficiencyLevel
      : DEFAULT_AI_SETTINGS.proficiencyLevel
    setProficiencyLevel(savedProficiency)
  }, [open, foreignLanguage, proficiencyLevels, availableSupportLanguages])

  const handleConfirm = () => {
    const settings = { supportLanguage, speed, voice, proficiencyLevel }
    try {
      localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // localStorage unavailable — proceed with in-memory settings.
    }
    onConfirm({
      learningLanguage: foreignLanguage,
      supportLanguage,
      speed,
      voice,
      proficiencyLevel,
    })
  }

  const availableVoices = VOICE_AVAILABILITY[foreignLanguage] ?? ["female"]

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
        {/* Learning Language — read-only, derived from URL */}
        <div className="text-left flex flex-col">
          <label className="text-sm mb-2">{s.learningLanguage}</label>
          <div className="flex flex-wrap gap-2">
            <span className={pillClass(true)}>{languageLabel(foreignLanguage)}</span>
          </div>
        </div>

        {/* Support Language — optional */}
        <div className="text-left flex flex-col">
          <label className="text-sm mb-2">{s.supportLanguage}</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSupportLanguage(null)}
              className={pillClass(supportLanguage === null)}
            >
              {s.supportNone}
            </button>
            {availableSupportLanguages.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSupportLanguage(value)}
                className={pillClass(supportLanguage === value)}
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

        {/* Proficiency Level — optional, matches Create Room levels */}
        <div className="text-left flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="text-sm">{s.proficiencyLabel}</label>
            <span className="text-xs text-[#7A7574]">{s.proficiencyOptional}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {proficiencyLevels.map((level) => {
              const isSelected = proficiencyLevel === level.value
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setProficiencyLevel(isSelected ? null : level.value)}
                  className={pillClass(isSelected)}
                >
                  {level.label}
                </button>
              )
            })}
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
                    .replace("{{language}}", languageLabel(foreignLanguage))
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

      <div className="p-4 sm:p-6 flex gap-3 sm:gap-2 justify-between sm:justify-end">
        <PillButton onClick={onCancel} variant="outline" className="h-12 sm:h-10 flex-1 sm:flex-none">
          {s.cancel}
        </PillButton>
        <PillButton onClick={handleConfirm} className="h-12 sm:h-10 flex-1 sm:flex-none">
          {s.start}
        </PillButton>
      </div>
    </Modal>
  )
}

export default AISessionSettingsModal
