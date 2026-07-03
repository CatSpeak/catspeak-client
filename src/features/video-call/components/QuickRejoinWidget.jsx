import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { Video, ArrowRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useGetRoomByIdQuery } from "@/store/api/roomsApi"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const STORAGE_KEY = "catspeak_last_room"

export const QuickRejoinWidget = ({ embedInStack = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isInCall = useSelector((s) => Boolean(s?.videoCall?.isInCall))
  
  const [lastRoom, setLastRoom] = useState(null)
  const [isDismissed, setIsDismissed] = useState(false)

  // 1. Read last room from localStorage on mount & location change
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.roomId) {
          setLastRoom(parsed)
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [location?.pathname])

  // 2. Fetch room data to verify active status
  const roomId = lastRoom?.roomId
  const { data: roomData, isError } = useGetRoomByIdQuery(Number(roomId), {
    skip: !roomId || Boolean(isInCall) || isDismissed,
  })

  // 3. Auto-cleanup if room no longer exists (404 or ended)
  useEffect(() => {
    if (isError) {
      console.info("[QuickRejoin] Room no longer exists or ended. Clearing last room snapshot.")
      localStorage.removeItem(STORAGE_KEY)
      setLastRoom(null)
    }
  }, [isError])

  // Don't show if user is in call, dismissed, no room saved, or currently on the meeting page
  const isOnCallPage = Boolean(location?.pathname?.includes(`/meet/${roomId}`))
  if (isInCall || isDismissed || !lastRoom || !roomId || isOnCallPage || isError) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.removeItem(STORAGE_KEY)
    setLastRoom(null)
  }

  const handleRejoin = () => {
    const targetPath = lastRoom.callPath || `/zh/meet/${roomId}`
    navigate(targetPath)
  }

  const roomName = roomData?.name || lastRoom.roomTitle || `Phòng #${roomId}`
  const participantCount = roomData?.currentParticipantCount ?? roomData?.participantCount ?? 0

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`${embedInStack ? "w-[380px] max-w-full pointer-events-auto shadow-2xl" : "fixed bottom-6 right-6 z-[9998] w-80 sm:w-96 pointer-events-auto shadow-2xl"} bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-3 transition-all`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Phòng họp đang diễn ra
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            title="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Room Info Row */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shrink-0 mt-0.5">
            <Video className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">
              {roomName}
            </h4>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {participantCount > 0 ? `${participantCount} thành viên đang tham gia` : "Nhấn để quay lại phòng"}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1 flex items-center gap-2">
          <PillButton
            onClick={handleRejoin}
            variant="primary"
            className="w-full text-xs h-9 font-semibold flex items-center justify-center gap-2 shadow-sm !border-transparent text-white"
          >
            <span>Tham gia lại</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </PillButton>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuickRejoinWidget
