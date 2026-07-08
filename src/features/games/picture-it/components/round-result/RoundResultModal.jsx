import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { fluentEaseOut } from "@/shared/utils/animations"
import useScrollLock from "@/shared/hooks/useScrollLock"
import RoundImageCard from "./RoundImageCard"
import RoundScoreCard from "./RoundScoreCard"
import LeaderboardCard from "./LeaderboardCard"
import CountdownCircle from "./CountdownCircle"
import ConfettiCanvas from "./ConfettiCanvas"

/**
 * RoundResultModal
 *
 * Root orchestrator for the post-round result screen.
 *
 * @param {boolean}     open        - Controls visibility
 * @param {Function}    onClose     - Called when countdown finishes
 * @param {RoundResult} result      - Round result data
 */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: fluentEaseOut },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -12,
    transition: { duration: 0.25, ease: "easeIn" },
  },
}

const RoundResultModal = ({ open, onClose, result }) => {
  useScrollLock(open)
  if (!result) return null

  return createPortal(
    <>
      {open && <ConfettiCanvas durationMs={2800} count={90} />}

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
          >
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="fixed inset-0"
              style={{
                background: "rgba(10, 10, 15, 0.72)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />

            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-[80vw] max-h-[90vh] overflow-y-auto scrollbar-app-transparent rounded-3xl p-8 flex flex-col gap-6"
              style={{
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "0 24px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <CountdownCircle
                duration={result.countdown ?? 3}
                onComplete={onClose}
              />

              <div className="flex gap-4 flex-1 min-h-0">
                <RoundImageCard image={result.image} />

                <div className="flex flex-row gap-4 w-full">
                  <RoundScoreCard
                    describer={result.describer}
                    roundScore={result.roundScore}
                    averageRating={result.averageRating}
                  />

                  <LeaderboardCard
                    leaderboard={result.leaderboard}
                  />
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}

export default RoundResultModal
