import React from "react"
import { Check, X, Crown, Zap } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getFeatureSuffix } from "../../utils/planUtils"

const PlanCard = ({ plan, isActive, onAction, actionLabel, isProcessing }) => {
  const { t } = useLanguage();
  const { name, price, interval, description, features, iconUrl } = plan;

  const isPro = price > 0;

  return (
    <div
      className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-200 ${isPro
        ? "border-2 border-cath-red-700 bg-white shadow-md"
        : "border border-gray-200 bg-white shadow-sm hover:border-gray-300"
        }`}
    >
      {/* Badges */}
      {isActive && (
        <span className="absolute -top-3 left-6 px-3 py-1 bg-cath-red-700 text-white text-[11px] font-bold rounded-full font-nunito uppercase tracking-wide shadow-sm z-10">
          {t.billing.pricing.currentPlan}
        </span>
      )}

      {isPro && !isActive && (
        <span className="absolute -top-3 right-6 px-3 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-full font-nunito tracking-wider uppercase z-10">
          POPULAR
        </span>
      )}

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={`${name} icon`}
              className="w-6 h-6 object-cover rounded"
            />
          ) : (
            <div className={`p-1 rounded shrink-0 ${isPro ? "text-amber-600" : "text-gray-400"}`}>
              {isPro ? <Crown size={18} strokeWidth={2.5} /> : <Zap size={18} strokeWidth={2.5} />}
            </div>
          )}
          <h3 className="text-xl font-bold font-nunito text-gray-900 tracking-tight">{name}</h3>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
      </div>

      {/* Price Section */}
      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold font-nunito tracking-tight text-gray-900">
          {price === 0
            ? "0₫"
            : `${new Intl.NumberFormat("vi-VN").format(price)}₫`}
        </span>
        {price > 0 && (
          <span className="text-gray-400 text-xs font-normal">/{interval}</span>
        )}
      </div>

      {/* Features List */}
      <ul className="flex flex-col gap-3 mb-6 flex-1">
        {features.map((feature, i) => {
          const isBoolean = feature.valueType === "boolean"
          const isFalsy = isBoolean && feature.limitValue === "false"

          return (
            <li
              key={feature.id || i}
              className={`flex items-start gap-2.5 text-xs ${isFalsy ? "opacity-40" : ""
                }`}
            >
              <div
                className={`mt-0.5 shrink-0 rounded-full p-0.5 ${isFalsy ? "text-gray-400" : "text-emerald-600"
                  }`}
              >
                {isFalsy ? (
                  <X size={13} strokeWidth={2.5} />
                ) : (
                  <Check size={13} strokeWidth={2.5} />
                )}
              </div>
              <span className={`text-gray-600 leading-normal ${isFalsy ? "line-through text-gray-400" : ""}`}>
                {!isBoolean && feature.limitValue ? (
                  <>
                    {feature.name}:{" "}
                    <span className="font-bold text-gray-800">
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

      {/* Action Button */}
      <div className="mt-auto">
        {isActive ? (
          <div className="w-full py-2.5 rounded-xl font-bold font-nunito text-center bg-gray-100 text-gray-400 border border-gray-200 cursor-default text-xs">
            {t.billing.pricing.currentPlan}
          </div>
        ) : !onAction ? (
          <div className="w-full py-2.5 rounded-xl font-bold font-nunito text-center bg-gray-50 text-gray-400 border border-dashed border-gray-200 text-xs">
            {t.billing.pricing.included}
          </div>
        ) : isPro ? (
          <button
            onClick={onAction}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-xl font-bold font-nunito text-xs text-white bg-cath-red-700 hover:bg-cath-red-800 hover:brightness-105 active:scale-[0.98] transition-all duration-150 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? t.billing.pricing.processing : actionLabel}
          </button>
        ) : (
          <button
            onClick={onAction}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-xl font-bold font-nunito text-xs text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 border border-gray-200 active:scale-[0.98] transition-all duration-150 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? t.billing.pricing.processing : actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default PlanCard
