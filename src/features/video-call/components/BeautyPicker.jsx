import React, { useEffect } from "react"
import {
  Sparkles,
  Sun,
  Thermometer,
  Palette,
  Eye,
  Smile,
  Scissors,
  ZoomIn,
} from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import Slider from "@/shared/components/ui/Slider"

import { isBeautyFilterSupported } from "@/features/video-call/utils/roomTypeHelpers"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"

const BEAUTY_STORAGE_KEY = "catspeak:beautyOptions"

const readStoredBeautyOptions = () => {
  try {
    const raw = localStorage.getItem(BEAUTY_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore corrupt data */
  }
  return null
}

const BeautyPicker = ({
  beautyOptions: propOptions,
  onChange,
  roomType: propRoomType,
  className = "",
}) => {
  const { t } = useLanguage()
  const ctx = useGlobalVideoCall()
  const { hasFeature, isPro } = usePlanFeatures()

  const userHasProPlan = Boolean(
    isPro || hasFeature(PLAN_FEATURES.BEAUTY_FILTER),
  )
  const currentRoomType = propRoomType ?? ctx?.room?.roomType

  // Guard against unsupported room types or non-pro users in restricted rooms
  if (!isBeautyFilterSupported(currentRoomType, userHasProPlan)) {
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
      icon: (
        <Sparkles
          size={18}
          className="text-gray-500 dark:text-[#AAAAAA] shrink-0"
        />
      ),
      label: t?.rooms?.beauty?.smoothing || "Skin Smoothing",
    },
    {
      key: "brightness",
      icon: (
        <Sun size={18} className="text-gray-500 dark:text-[#AAAAAA] shrink-0" />
      ),
      label: t?.rooms?.beauty?.brightness || "Brightness Boost",
    },
    {
      key: "warmth",
      icon: (
        <Thermometer
          size={18}
          className="text-gray-500 dark:text-[#AAAAAA] shrink-0"
        />
      ),
      label: t?.rooms?.beauty?.warmth || "Warm Tone",
    },
    {
      key: "colorFilter",
      icon: (
        <Palette
          size={18}
          className="text-gray-500 dark:text-[#AAAAAA] shrink-0"
        />
      ),
      label: t?.rooms?.beauty?.colorFilter || "Color Filter (Vivid)",
    },
    {
      key: "eyeBrighten",
      icon: (
        <Eye size={18} className="text-gray-500 dark:text-[#AAAAAA] shrink-0" />
      ),
      label: t?.rooms?.beauty?.eyeBrighten || "Eye Brighten",
    },
    {
      key: "teethWhiten",
      icon: (
        <Smile
          size={18}
          className="text-gray-500 dark:text-[#AAAAAA] shrink-0"
        />
      ),
      label: t?.rooms?.beauty?.teethWhiten || "Teeth Whiten",
    },
    {
      key: "faceSlim",
      icon: (
        <Scissors
          size={18}
          className="text-gray-500 dark:text-[#AAAAAA] shrink-0"
        />
      ),
      label: t?.rooms?.beauty?.faceSlim || "Face Slim",
    },
    {
      key: "eyeEnlarge",
      icon: (
        <ZoomIn
          size={18}
          className="text-gray-500 dark:text-[#AAAAAA] shrink-0"
        />
      ),
      label: t?.rooms?.beauty?.eyeEnlarge || "Eye Enlarge",
    },
  ]

  // ── Status badge variant ────────────────────────────────────────────────
  const statusBadge = () => {
    if (!ctx.processorStatus || ctx.processorStatus === "idle") return null

    switch (ctx.processorStatus) {
      case "attached":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-transparent dark:border-green-800/40">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
            {t?.rooms?.beauty?.statusActive || "Active"}
          </span>
        )
      case "unsupported":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-transparent dark:border-red-800/40">
            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400" />
            {t?.rooms?.beauty?.statusUnsupported || "Unsupported"}
          </span>
        )
      case "initializing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 border border-transparent dark:border-yellow-800/40">
            <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-pulse" />
            {t?.rooms?.beauty?.statusInitializing || "Initializing..."}
          </span>
        )
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-transparent dark:border-orange-800/40">
            <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />
            {t?.rooms?.beauty?.statusError || "Error"}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* ── Processor status diagnostic badge ── */}
      {ctx.processorStatus && ctx.processorStatus !== "idle" && (
        <div className="mb-3">{statusBadge()}</div>
      )}

      <div className="flex flex-col gap-4">
        {items.map(({ key, icon, label }) => (
          <div key={key} className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-200">
                {icon}
                <span>{label}</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-[#AAAAAA] w-8 text-right tabular-nums">
                {beautyOptions[key] ?? 0}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              value={beautyOptions[key] ?? 0}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              trackColor="bg-gray-200 dark:bg-neutral-700"
              activeColor="bg-cath-red-700 dark:bg-red-400"
              thumbColor="bg-cath-red-700 dark:bg-red-400"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BeautyPicker
