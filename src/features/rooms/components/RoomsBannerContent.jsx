import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import doodles from "@/shared/assets/images/communities/doodles.png"
import doodlesDark from "@/shared/assets/images/communities/doodles-dark.png"
import SessionActionButtons from "./SessionActionButtons"
import { InteractiveScriptWidget } from "@/features/interactive-script"
import { M3_MOTION } from "@/shared/constants/motion"

const RoomsBannerContent = ({ sessionProps }) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="w-full flex flex-col">
      {/* Doodle logo */}
      <img
        src={doodles}
        alt="Cat Speak doodles"
        className="w-52 mb-4 object-contain object-left dark:hidden"
      />
      <img
        src={doodlesDark}
        alt="Cat Speak doodles"
        className="w-52 mb-4 object-contain object-left hidden dark:block"
      />

      <div className="flex flex-col gap-4">
        <InteractiveScriptWidget />
        <motion.div
          layout="position"
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : M3_MOTION.standard.spatial.fast
          }
          className="-mt-4"
          data-tour="session-action-buttons"
        >
          <SessionActionButtons {...sessionProps} />
        </motion.div>
      </div>
    </div>
  )
}

export default RoomsBannerContent
