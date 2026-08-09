import React, { useEffect } from "react"
import { Sparkles, Sun, Thermometer, Palette, Eye, Smile, Scissors, ZoomIn } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import Slider from "@/shared/components/ui/Slider"

import { isBeautyFilterSupported } from "@/features/video-call/utils/roomTypeHelpers"

const BEAUTY_STORAGE_KEY = "catspeak:beautyOptions"

const readStoredBeautyOptions = () => {
  try {
    const raw = localStorage.getItem(BEAUTY_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupt data */ }
  return null
}

const BeautyPicker = ({ beautyOptions: propOptions, onChange }) => {
  const { t } = useLanguage()
  const ctx = useGlobalVideoCall()

  // Guard against unsupported room types
  if (!isBeautyFilterSupported(ctx?.room?.roomType)) {
    return null
  }

  // Use prop-driven state when provided (e.g. pre-join modal),
  // otherwise fall back to global call context (in-call panel).
  const beautyOptions = propOptions ?? ctx.beautyOptions

  // ── Sync pre-join beauty selections into the in-call context ──────────
  // When BeautyPicker is used without props (in-call mode), read any
  // settings the user chose before joining from localStorage and feed
  // them into the context so the slider UI matches the live effect.
  //
  // The processor (useCombinedProcessor) already applies stored options
  // when it attaches to the camera track; this ensures the UI is in sync.
  const isInCall = !propOptions && !onChange
  useEffect(() => {
    if (!isInCall) return
    const stored = readStoredBeautyOptions()
    if (stored) {
      ctx.setBeautyOptions(stored)
    }
    // Run once on mount. Dependencies intentionally excluded so we don't
    // overwrite subsequent in-call slider adjustments.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = onChange
    ? (key, value) => onChange(key, value)
    : (key, value) => {
        const next = { ...ctx.beautyOptions, [key]: value }
        ctx.setBeautyOptions(next)
        ctx.switchBeauty(next)
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
    {
      key: "eyeBrighten",
      icon: <Eye size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.eyeBrighten || "Eye Brighten",
    },
    {
      key: "teethWhiten",
      icon: <Smile size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.teethWhiten || "Teeth Whiten",
    },
    {
      key: "faceSlim",
      icon: <Scissors size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.faceSlim || "Face Slim",
      hint: t?.rooms?.beauty?.faceAwareHint || "Face-aware",
    },
    {
      key: "eyeEnlarge",
      icon: <ZoomIn size={18} className="text-gray-500" />,
      label: t?.rooms?.beauty?.eyeEnlarge || "Eye Enlarge",
      hint: t?.rooms?.beauty?.faceAwareHint || "Face-aware",
    },
  ]

  // ── Status badge variant ────────────────────────────────────────────────
  const statusBadge = () => {
    if (!ctx.processorStatus || ctx.processorStatus === "idle") return null

    switch (ctx.processorStatus) {
      case "attached":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {t?.rooms?.beauty?.statusActive || "Active"}
          </span>
        )
      case "unsupported":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {t?.rooms?.beauty?.statusUnsupported || "Unsupported"}
          </span>
        )
      case "initializing":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            {t?.rooms?.beauty?.statusInitializing || "Initializing..."}
          </span>
        )
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            {t?.rooms?.beauty?.statusError || "Error"}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col w-full p-4">
      {/* ── Processor status diagnostic badge ── */}
      {ctx.processorStatus && ctx.processorStatus !== "idle" && (
        <div className="mb-3">{statusBadge()}</div>
      )}

      <div className="text-sm font-medium text-gray-900 mb-4">
        {t?.rooms?.beauty?.title || "Beauty"}
      </div>
      <div className="flex flex-col gap-5 pb-6">
        {items.map(({ key, icon, label, hint }) => (
          <div
            key={key}
            className="flex flex-col"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                {icon}
                <span>{label}</span>
                {hint && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 font-medium">
                    {hint}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 w-8 text-right tabular-nums">
                {beautyOptions[key] ?? 0}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              value={beautyOptions[key] ?? 0}
              onChange={(e) => handleChange(key, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BeautyPicker