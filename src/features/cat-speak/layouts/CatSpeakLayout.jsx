import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { AnimatePresence } from "framer-motion"
import SharedLayout from "@/shared/components/layout/SharedLayout"

const getAnimationKey = (pathname) => {
  const reelMatch = pathname.match(/^\/([^/]+)\/cat-speak\/reels(\/.*)?$/)
  if (reelMatch) {
    return `/${reelMatch[1]}/cat-speak/reels`
  }

  return pathname
}

const CatSpeakLayout = () => {
  const location = useLocation()
  const animationKey = getAnimationKey(location.pathname)

  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 self-stretch items-stretch bg-primaryBg dark:bg-[#0F0F0F]">
      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full relative flex flex-col self-stretch">
        <AnimatePresence mode="wait">
          <div
            key={animationKey}
            className="mx-auto w-full h-full flex-1 flex flex-col"
          >
            <FluentAnimation animationKey={animationKey} className="w-full h-full flex-1 flex flex-col">
              <Outlet />
            </FluentAnimation>
          </div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default CatSpeakLayout
