import React from "react"
import { Check, X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getFeatureSuffix } from "../../utils/planUtils"

const PlanCard = ({ plan, isActive, onAction, actionLabel, isProcessing }) => {
  const { t } = useLanguage()
  const { name, price, interval, description, features, iconUrl, brandColor } =
    plan

  return (
    <div
      className={`relative flex flex-col p-6 rounded-3xl border ${
        isActive
          ? "border-cath-red-700 bg-[#FFF5F5] shadow-md"
          : "border-[#E5E5E5] bg-white"
      }`}
    >
      {isActive && (
        <span className="absolute -top-3 left-6 px-3 py-1 bg-cath-red-700 text-white text-xs font-bold rounded-full">
          {t.billing.pricing.currentPlan}
        </span>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {iconUrl && (
            <img
              src={iconUrl}
              alt={`${name} icon`}
              className="w-8 h-8 object-cover rounded-md"
            />
          )}
          <h3 className="text-xl font-bold">{name}</h3>
        </div>
        <p className="text-[#7A7574] text-sm">{description}</p>
      </div>

      <div className="mb-6 flex items-end gap-1">
        <span className="text-4xl font-extrabold">
          {price === 0
            ? "0 ₫"
            : new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(price)}
        </span>
        {price > 0 && (
          <span className="text-[#7A7574] text-sm mb-1">/{interval}</span>
        )}
      </div>

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {features.map((feature, i) => {
          const isBoolean = feature.valueType === "boolean"
          const isFalsy = isBoolean && feature.limitValue === "false"

          return (
            <li
              key={feature.id || i}
              className={`flex items-start gap-2 text-sm ${isFalsy ? "opacity-50" : ""}`}
            >
              <div
                className={`mt-0.5 shrink-0 rounded-full p-0.5 ${
                  isFalsy ? "text-gray-500" : "text-green-600"
                }`}
              >
                {isFalsy ? (
                  <X size={14} strokeWidth={3} />
                ) : (
                  <Check size={14} strokeWidth={3} />
                )}
              </div>
              <span className={`text-[#333] ${isFalsy ? "line-through" : ""}`}>
                {!isBoolean && feature.limitValue ? (
                  <>
                    {feature.name}:{" "}
                    <span className="font-semibold">
                      {feature.limitValue}
                      {getFeatureSuffix(feature.code, t)}
                    </span>
                  </>
                ) : (
                  feature.name
                )}
              </span>
            </li>
          )
        })}
      </ul>

      {!isActive && !onAction ? (
        <div className="w-full py-3 rounded-full font-semibold text-center bg-[#F3F3F3] text-[#7A7574]">
          {t.billing.pricing.included}
        </div>
      ) : (
        <button
          onClick={onAction}
          disabled={isProcessing || isActive}
          style={!isActive && brandColor ? { backgroundColor: brandColor } : {}}
          className={`w-full py-3 rounded-full font-semibold transition-all ${
            isActive
              ? "bg-[#E5E5E5] text-[#7A7574] cursor-default"
              : "bg-cath-red-700 text-white hover:brightness-90"
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isProcessing
            ? t.billing.pricing.processing
            : isActive
              ? t.billing.pricing.currentPlan
              : actionLabel}
        </button>
      )}
    </div>
  )
}

export default PlanCard
