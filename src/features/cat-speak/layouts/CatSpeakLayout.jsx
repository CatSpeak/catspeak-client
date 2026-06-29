import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { AnimatePresence } from "framer-motion"

const getAnimationKey = (pathname) => {
  const reelDetailMatch = pathname.match(/^\/([^/]+)\/cat-speak\/reels\/[^/]+$/)
  if (reelDetailMatch) {
    return `/${reelDetailMatch[1]}/cat-speak/reels/:id`
  }

  return pathname
}

const CatSpeakLayout = () => {
  const location = useLocation()
  const animationKey = getAnimationKey(location.pathname)

  return (
    <div className="flex flex-col lg:flex-row w-full items-start">
      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full">
        <AnimatePresence mode="wait">
          <div
            key={animationKey}
            className="mx-auto w-full p-5 h-full"
          >
            <FluentAnimation animationKey={animationKey}>
              <Outlet />
            </FluentAnimation>
          </div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default CatSpeakLayout
