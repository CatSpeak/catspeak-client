import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { AnimatePresence } from "framer-motion"
import CatSpeakSidebar from "../components/CatSpeakSidebar"

const CatSpeakLayout = () => {
  const location = useLocation()

  return (
    <div className="flex flex-col lg:flex-row w-full items-start">
      <CatSpeakSidebar />
      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full">
        <AnimatePresence mode="wait">
          <div
            key={location.pathname}
            className="mx-auto w-full p-5 h-full"
          >
            <FluentAnimation animationKey={location.pathname}>
              <Outlet />
            </FluentAnimation>
          </div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default CatSpeakLayout
