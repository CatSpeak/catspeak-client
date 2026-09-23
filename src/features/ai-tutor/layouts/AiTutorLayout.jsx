import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { AnimatePresence } from "framer-motion"

const AiTutorLayout = () => {
  const location = useLocation()

  return (
    <div className="flex-1 h-full overflow-y-auto flex flex-col bg-primaryBg relative">
      <div className="mx-auto w-full min-w-0 p-4 sm:p-6 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <FluentAnimation
            key={location.pathname}
            animationKey={location.pathname}
            direction="up"
            className="w-full flex-1 flex flex-col gap-6"
          >
            <Outlet />
          </FluentAnimation>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AiTutorLayout
