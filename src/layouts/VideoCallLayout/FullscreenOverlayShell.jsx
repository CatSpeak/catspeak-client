import React from "react"
import { ArrowLeft } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"

const FullscreenOverlayShell = ({
  backgroundImageUrl,
  onBack,
  backLabel,
  maxWidthClass = "max-w-[420px]",
  cardClassName = "",
  contentClassName = "",
  children,
}) => {
  return (
    <div
      className="flex h-[100dvh] w-full flex-col bg-cover bg-center bg-no-repeat relative overflow-y-auto"
      style={
        backgroundImageUrl
          ? { backgroundImage: `url(${backgroundImageUrl})` }
          : undefined
      }
    >
      <div className="fixed inset-0 bg-[#111111]/40 blur-sm" />

      <div className="relative z-50 w-full p-5 flex justify-start shrink-0">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white transition-all duration-300 shadow-sm"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span className="text-sm font-medium pr-1">{backLabel}</span>
        </button>
      </div>

      <div
        className={`relative z-10 flex flex-1 w-full flex-col items-center justify-center p-5 ${contentClassName}`}
      >
        <FluentCard
          className={`shadow-2xl w-full ${maxWidthClass} items-center ${cardClassName}`}
        >
          {children}
        </FluentCard>
      </div>
    </div>
  )
}

export default FullscreenOverlayShell
