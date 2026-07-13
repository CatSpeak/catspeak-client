import React, { useState, useEffect, useRef } from "react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { Send, CheckCircle2 } from "lucide-react"

import { playGlobalSound } from "@/features/video-call/hooks/useParticipantAudioEffect"

const AnswerInput = () => {
  const {
    submitAnswer,
    gameState,
    lastCorrectAnswer,
    currentUserId,
    correctPlayers,
    currentRound,
  } = useGame()
  const { t } = useLanguage()

  const [inputValue, setInputValue] = useState("")
  const [shake, setShake] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [wrongToasts, setWrongToasts] = useState([])
  const [myScoreEarned, setMyScoreEarned] = useState(null)
  const inputRef = useRef(null)

  const isCorrect = correctPlayers.has(currentUserId.toString())
  const isDisabled = gameState !== "playing" || isCorrect

  // Xóa trắng input khi bắt đầu ván mới
  useEffect(() => {
    setInputValue("")
    setWrongToasts([])
    setMyScoreEarned(null)
  }, [currentRound?.round])

  // Lắng nghe event nhập sai và đúng
  useEffect(() => {
    const handleWrongAnswer = (e) => {
      const wrongVal = e.detail
      if (wrongVal) {
        const id = Date.now()
        setWrongToasts((prev) => [...prev, { id, text: wrongVal }])
        setTimeout(() => {
          setWrongToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000) // Tự mất đi sau 3 giây như toast
      }
      setInputValue("")
      setShake(true)
      setTimeout(() => setShake(false), 400) // Shake duration
    }

    const handleCorrectAnswer = (e) => {
      setMyScoreEarned(e.detail)
    }

    window.addEventListener("crackItWrongAnswer", handleWrongAnswer)
    window.addEventListener("crackItCorrectAnswer", handleCorrectAnswer)
    return () => {
      window.removeEventListener("crackItWrongAnswer", handleWrongAnswer)
      window.removeEventListener("crackItCorrectAnswer", handleCorrectAnswer)
    }
  }, [])

  // Lắng nghe event khi có người đoán đúng (flash cho MỖI người)
  useEffect(() => {
    if (lastCorrectAnswer && lastCorrectAnswer._ts) {
      setShowFlash(true)
      // Play ding sound if available
      playGlobalSound("correct")

      const timeout = setTimeout(() => setShowFlash(false), 1500)
      return () => clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCorrectAnswer?._ts])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isDisabled || !inputValue.trim()) return
    submitAnswer(inputValue.trim())
    inputRef.current?.focus()
  }

  return (
    <div className="relative shrink-0">
      {/* Cửa sổ nháy flash khi có người trả lời đúng - Đưa lên góc trên bên phải */}
      <AnimatePresence mode="wait">
        {showFlash && lastCorrectAnswer && (
          <motion.div
            key={lastCorrectAnswer._ts}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.8 }}
            className="fixed top-24 md:top-28 right-4 z-[200] pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md text-slate-800 px-4 py-3 rounded-2xl shadow-xl border border-green-100 flex items-center gap-3 min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-sm leading-tight max-w-[150px] truncate">
                  {lastCorrectAnswer.player_name}
                </span>
                <span className="text-xs text-slate-500 font-medium mt-0.5">
                  {t.rooms?.game?.crackIt?.gotItRight || "đã đoán chính xác!"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lịch sử lần thử sai (Toast tự mất) */}
      <AnimatePresence>
        {wrongToasts.length > 0 && !isCorrect && (
          <motion.div className="absolute bottom-full mb-3 left-4 flex flex-row-reverse items-center gap-2 z-[10] pointer-events-none">
            {wrongToasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9, filter: "blur(4px)" }}
                className="bg-white/95 backdrop-blur-md text-slate-700 px-4 py-2 rounded-xl text-sm font-medium shadow-[0_4px_12px_rgb(239,68,68,0.15)] flex items-center gap-2 border border-red-100"
              >
                <span className="text-red-500 font-bold text-xs flex items-center justify-center bg-red-50 w-5 h-5 rounded-full">
                  ✕
                </span>
                {toast.text}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={handleSubmit}
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`flex items-center rounded-full shadow-sm border-2 p-1.5 transition-all ${shake
            ? "bg-red-50 border-red-500 shadow-red-100"
            : isCorrect
              ? "bg-green-50 border-green-500 shadow-green-100"
              : "bg-white border-gray-300 focus-within:border-cath-red-400 focus-within:shadow-md"
          }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isDisabled}
          placeholder={
            t.rooms?.game?.crackIt?.typeAnswer || "Nhập đáp án của bạn..."
          }
          className={`flex-1 min-w-0 bg-transparent px-2 md:px-6 h-10 outline-none text-lg font-medium tracking-wide ${isCorrect ? "text-green-700" : "text-slate-800 disabled:text-slate-500"
            } placeholder-gray-400`}
        />

        {/* Score Pop-up for correct answer */}
        <AnimatePresence>
          {isCorrect && myScoreEarned !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mr-3 font-black text-green-600 drop-shadow-sm flex items-center gap-1 shrink-0"
            >
              <span className="text-xl">+{myScoreEarned}</span>
              <span className="text-xs uppercase tracking-wider mt-1">điểm</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isDisabled || !inputValue.trim()}
          className="w-10 h-10 rounded-full bg-cath-red-600 text-white flex items-center justify-center hover:scale-105 hover:bg-cath-red-700 disabled:opacity-50 disabled:hover:scale-100 disabled:bg-gray-300 disabled:text-gray-500 transition-all shrink-0 shadow-md"
        >
          <Send size={22} />
        </button>
      </motion.form>
    </div>
  )
}

export default AnswerInput
