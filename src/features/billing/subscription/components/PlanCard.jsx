import React from "react"
import { Check, X } from "lucide-react"

const PlanCard = ({ plan, isActive, onAction, actionLabel, isProcessing }) => {
  const { name, price, interval, description, features } = plan

  return (
    <div
      className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all ${
        isActive
          ? "border-cath-red-700 bg-[#FFF5F5] shadow-md"
          : "border-[#E5E5E5] bg-white hover:border-gray-300"
      }`}
    >
      {isActive && (
        <span className="absolute -top-3 left-6 px-3 py-1 bg-cath-red-700 text-white text-xs font-bold rounded-full">
          Current Plan
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-[#7A7574] text-sm">{description}</p>
      </div>

      <div className="mb-6 flex items-end gap-1">
        <span className="text-4xl font-extrabold">${price}</span>
        {price > 0 && (
          <span className="text-[#7A7574] text-sm mb-1">/{interval}</span>
        )}
      </div>

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <div className="mt-0.5 shrink-0 bg-[#E5F7ED] text-green-600 rounded-full p-0.5">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[#333]">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onAction}
        disabled={isProcessing || isActive}
        className={`w-full py-3 rounded-full font-semibold transition-all ${
          isActive
            ? "bg-[#E5E5E5] text-[#7A7574] cursor-default"
            : actionLabel === "Downgrade"
            ? "bg-white text-cath-red-700 border-2 border-cath-red-700 hover:bg-[#FFF5F5]"
            : "bg-cath-red-700 text-white hover:brightness-90"
        } disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {isProcessing ? "Processing..." : isActive ? "Current Plan" : actionLabel}
      </button>
    </div>
  )
}

export default PlanCard
