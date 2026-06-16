// src/features/video-call/components/BeautyPicker.jsx
import React from "react"
import { Sparkles, Sun, Thermometer, Palette } from "lucide-react"
import Switch from "@/shared/components/ui/inputs/Switch"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"

const BeautyPicker = () => {
  const { t } = useLanguage()
  const { beautyOptions, setBeautyOptions, switchBeauty } = useGlobalVideoCall()

  const toggle = (key) => {
    const next = { ...beautyOptions, [key]: !beautyOptions[key] }
    setBeautyOptions(next)
    switchBeauty(next)
  }

  const items = [
    {
      key: "smoothing",
      icon: <Sparkles size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.smoothing || "Skin Smoothing",
    },
    {
      key: "brightness",
      icon: <Sun size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.brightness || "Brightness Boost",
    },
    {
      key: "warmth",
      icon: <Thermometer size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.warmth || "Warm Tone",
    },
    {
      key: "colorFilter",
      icon: <Palette size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.colorFilter || "Color Filter (Vivid)",
    },
  ]

  return (
    <div className="flex flex-col h-full w-full">
      <div className="text-sm font-medium text-gray-900 mb-3">
        {t?.rooms?.beauty?.title || "Beauty"}
      </div>
      <div className="flex flex-col gap-1">
        {items.map(({ key, icon, label }) => (
          <div
            key={key}
            className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={(e) => {
              if (e.target.closest("label")) return
              toggle(key)
            }}
          >
            <div className="flex items-center gap-3 text-sm text-gray-700">
              {icon}
              <span>{label}</span>
            </div>
            <Switch
              checked={beautyOptions[key]}
              onChange={() => toggle(key)}
              colorClass="peer-checked:bg-cath-red-600"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BeautyPicker
