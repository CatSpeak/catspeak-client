import React from "react"
import { ArrowLeft } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"

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

      <div className="relative z-50 w-full p-4 flex justify-start shrink-0">
        <PillButton
          variant="transparent"
          onClick={onBack}
          startIcon={
            <ArrowLeft
              size={16}
              className="transition-transform group-hover/pill:-translate-x-1"
            />
          }
        >
          {backLabel}
        </PillButton>
      </div>

      <div
        className={`relative z-10 flex flex-1 w-full flex-col items-center justify-center px-4 pb-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${contentClassName}`}
      >
        <FluentCard
          className={`shadow-2xl w-full ${maxWidthClass} items-center my-auto ${cardClassName}`}
        >
          {children}
        </FluentCard>
      </div>
    </div>
  )
}

export default FullscreenOverlayShell
