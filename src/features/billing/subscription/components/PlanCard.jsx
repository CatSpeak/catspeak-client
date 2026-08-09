import React from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Loader2,
  Sparkles,
  Star,
  X,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getFeatureSuffix } from "../../utils/planUtils"

const hexToRgbA = (hex, alpha = 0.15) => {
  if (!hex || typeof hex !== "string") return `rgba(255, 255, 255, ${alpha})`

  let color = hex.replace("#", "")
  if (color.length === 3) {
    color = color
      .split("")
      .map((value) => value + value)
      .join("")
  }

  if (color.length !== 6) return `rgba(255, 255, 255, ${alpha})`

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const getContrastColor = (hex) => {
  if (!hex || typeof hex !== "string") return "text-gray-900"

  let color = hex.replace("#", "")
  if (color.length === 3) {
    color = color
      .split("")
      .map((value) => value + value)
      .join("")
  }

  if (color.length !== 6) return "text-gray-900"

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const perceivedBrightness = Math.sqrt(
    0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b),
  )

  return perceivedBrightness > 175 ? "text-gray-900" : "text-white"
}

const getIntervalLabel = (interval, language) => {
  const normalizedInterval = String(interval || "").toLowerCase()
  const isYearly =
    normalizedInterval.includes("year") ||
    normalizedInterval.includes("annual") ||
    normalizedInterval.includes("nam")

  if (language === "vi") return isYearly ? "năm" : "tháng"
  if (language === "zh") return isYearly ? "年" : "月"
  if (isYearly) return "year"
  if (normalizedInterval.includes("month")) return "month"

  return interval || "month"
}

const renderFeatureText = (text, highlightColor) => {
  if (typeof text !== "string") return text

  const parts = text.split(/(\d+\s*[a-zA-Z\u00C0-\u1EF9]+)/)
  return parts.map((part, index) => {
    const isMatch = part.match(/^\d+\s*[a-zA-Z\u00C0-\u1EF9]+/)

    if (!isMatch) return part

    return (
      <strong
        key={`${part}-${index}`}
        className="font-extrabold"
        style={{ color: highlightColor }}
      >
        {part}
      </strong>
    )
  })
}

const PlanCard = ({
  plan,
  isActive,
  isHighlighted,
  highlightBadge,
  onAction,
  actionLabel,
  isProcessing,
}) => {
  const { t, language } = useLanguage()
  const { name, price, interval, description, features = [], brandColor } = plan

  const numericPrice = Number(price) || 0
  const isPaidPlan = numericPrice > 0

  const cardColor = brandColor || (isPaidPlan ? "#990011" : "#0F9F6E")
  const buttonTextColor = getContrastColor(cardColor)
  const priceLabel =
    numericPrice === 0
      ? "0\u20ab"
      : `${new Intl.NumberFormat("vi-VN").format(numericPrice)}\u20ab`
  const intervalLabel = getIntervalLabel(interval, language)

  let buttonText = actionLabel
  if (isActive) {
    buttonText = t.billing.pricing.currentPlan || "Current plan"
  } else if (!onAction) {
    buttonText = t.billing.pricing.included || "Included"
  }

  const badge = isHighlighted
    ? {
        icon: Sparkles,
        label: highlightBadge || "Required",
      }
    : isActive
      ? {
          icon: BadgeCheck,
          label: t.billing.pricing.activated || "Activated",
        }
      : isPaidPlan
        ? {
            icon: Star,
            label: t.billing.pricing.popular || "Popular",
          }
        : null

  const BadgeIcon = badge?.icon
  const cardShadow = isHighlighted
    ? `0 24px 52px ${hexToRgbA(cardColor, 0.35)}`
    : isActive
      ? `0 22px 48px ${hexToRgbA(cardColor, 0.18)}`
      : "0 18px 40px rgba(15, 23, 42, 0.08)"

  return (
    <motion.article
      animate={
        isHighlighted
          ? {
              y: [0, -32, 0, -20, 0, -8, 0],
              scale: [1, 1.05, 0.98, 1.03, 0.99, 1.01, 1],
              rotate: [0, -1.5, 1.5, -1, 1, 0],
            }
          : { y: 0, scale: 1, rotate: 0 }
      }
      transition={
        isHighlighted
          ? {
              duration: 1.2,
              repeat: 1,
              repeatDelay: 0.15,
              ease: "easeOut",
            }
          : { duration: 0.5 }
      }
      className={`group relative flex h-full min-h-[560px] flex-col overflow-hidden rounded-xl border bg-white transition-[box-shadow,border-color,background-color] duration-500 ${
        isHighlighted ? "ring-4 ring-cath-red-700/60 shadow-2xl" : ""
      }`}
      style={{
        background: `linear-gradient(180deg, ${hexToRgbA(
          cardColor,
          isHighlighted ? 0.16 : 0.1,
        )} 0%, rgba(255, 255, 255, 0) 34%), #fff`,
        borderColor:
          isHighlighted || isActive ? cardColor : hexToRgbA(cardColor, 0.22),
        boxShadow: cardShadow,
      }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: cardColor }} />

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0">
              <h3 className="break-words text-xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-2xl">
                {name}
              </h3>
            </div>
          </div>

          {badge && (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase leading-none tracking-[0.12em]"
              style={{
                backgroundColor: hexToRgbA(cardColor, 0.11),
                borderColor: hexToRgbA(cardColor, 0.24),
                color: cardColor,
              }}
            >
              <BadgeIcon
                size={12}
                className={isPaidPlan ? "fill-current" : ""}
              />
              {badge.label}
            </span>
          )}
        </header>
        <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
          {description}
        </p>

        <section className="mt-7 border-b border-gray-100 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="break-words text-4xl font-black leading-none tracking-tight text-gray-950">
                  {priceLabel}
                </span>
                {isPaidPlan && (
                  <span className="text-sm font-bold text-gray-400">
                    / {intervalLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-1 flex-col">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-gray-400">
              {t.billing.pricing.included || "Included"}
            </span>
            <span className="h-px flex-1 bg-gray-100" />
          </div>

          <ul className="flex flex-1 flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
            {features.map((feature, index) => {
              const isString = typeof feature === "string"
              const isBoolean = !isString && feature.valueType === "boolean"
              const isFalsy = isBoolean && feature.limitValue === "false"
              const featureKey = isString
                ? `${feature}-${index}`
                : feature.id || index

              return (
                <li
                  key={featureKey}
                  className={`grid grid-cols-[20px_1fr] gap-3 text-sm leading-relaxed ${
                    isFalsy ? "text-gray-400" : "text-gray-700"
                  }`}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                    style={
                      isFalsy
                        ? undefined
                        : {
                            color: cardColor,
                          }
                    }
                  >
                    {isFalsy ? (
                      <X size={13} strokeWidth={3} />
                    ) : (
                      <Check size={13} strokeWidth={3} />
                    )}
                  </span>

                  <span
                    className={`min-w-0 font-semibold ${
                      isFalsy ? "line-through decoration-gray-300" : ""
                    }`}
                  >
                    {isString ? (
                      renderFeatureText(feature, cardColor)
                    ) : !isBoolean && feature.limitValue ? (
                      <>
                        {feature.name}:{" "}
                        <strong className="font-extrabold text-gray-900">
                          {feature.limitValue}
                          {getFeatureSuffix(feature.code, t)}
                        </strong>
                      </>
                    ) : (
                      feature.name
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <footer className="mt-7 border-t border-gray-100 pt-5">
          {isActive ? (
            <div
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-center text-sm font-extrabold"
              style={{
                backgroundColor: hexToRgbA(cardColor, 0.08),
                borderColor: hexToRgbA(cardColor, 0.22),
                color: cardColor,
              }}
            >
              <BadgeCheck size={17} strokeWidth={2.4} />
              <span className="leading-snug">{buttonText}</span>
            </div>
          ) : !onAction ? (
            <div className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm font-extrabold text-gray-400">
              <Check size={17} strokeWidth={2.4} />
              <span className="leading-snug">{buttonText}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAction}
              disabled={isProcessing}
              className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-extrabold ${buttonTextColor} shadow-sm transition-all duration-150 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70`}
              style={{
                backgroundColor: cardColor,
              }}
            >
              {isProcessing ? (
                <Loader2 size={17} className="shrink-0 animate-spin" />
              ) : (
                <ArrowRight size={17} className="shrink-0" strokeWidth={2.5} />
              )}
              <span className="leading-snug">
                {isProcessing ? t.billing.pricing.processing : buttonText}
              </span>
            </button>
          )}
        </footer>
      </div>
    </motion.article>
  )
}

export default PlanCard
