import React from "react"
import { motion } from "framer-motion"
import { Loader2, Users } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const BreakoutTransitionOverlay = ({ roomName, isReturning }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xl text-white"
    >
      <div className="relative flex flex-col items-center max-w-md px-6 text-center">
        {/* Glowing backdrop effect */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-25 blur-2xl w-48 h-48 -z-10" />

        {/* Pulsing Icon Container */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-2xl mb-8"
        >
          <Users className="h-10 w-10 text-emerald-400" />
        </motion.div>

        {/* Loading Spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-6" />

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight mb-2">
          {isReturning
            ? t.rooms.breakoutRooms.returningTitle
            : t.rooms.breakoutRooms.movingTitle}
        </h3>

        {/* Description / Subtitle */}
        <p className="text-sm text-slate-300 mb-4 max-w-xs">
          {isReturning
            ? t.rooms.breakoutRooms.returningDesc
            : t.rooms.breakoutRooms.movingDesc}
        </p>

        {/* Room Badge */}
        {roomName && !isReturning && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {roomName}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default BreakoutTransitionOverlay
