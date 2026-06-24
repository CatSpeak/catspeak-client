import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { AnimatePresence } from "framer-motion"
import CatSpeakSidebar from "../components/CatSpeakSidebar"
import SharedLayout from "@/shared/components/layout/SharedLayout"

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
    <SharedLayout sidebar={<CatSpeakSidebar />} contentClassName="p-6">
      <AnimatePresence mode="wait">
        <div key={animationKey} className="mx-auto w-full h-full">
          <FluentAnimation animationKey={animationKey}>
            <Outlet />
          </FluentAnimation>
        </div>
      </AnimatePresence>
    </SharedLayout>
  )
}

export default CatSpeakLayout
