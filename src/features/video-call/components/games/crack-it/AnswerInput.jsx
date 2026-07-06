import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../../context/GameContext";
import { useLanguage } from "@/shared/context/LanguageContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { useAuth } from "@/features/auth";

const AnswerInput = () => {
  const { submitAnswer, gameState, lastCorrectAnswer, currentUserId, correctPlayers, currentRound } = useGame();
  const { t } = useLanguage();
  
  const [inputValue, setInputValue] = useState("");
  const [shake, setShake] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [wrongToasts, setWrongToasts] = useState([]);
  const inputRef = useRef(null);

  const isCorrect = correctPlayers.has(currentUserId.toString());
  const isDisabled = gameState !== "playing" || isCorrect;

  // Xóa trắng input khi bắt đầu ván mới
  useEffect(() => {
    setInputValue("");
    setWrongToasts([]);
  }, [currentRound?.round]);

  // Lắng nghe event nhập sai
  useEffect(() => {
    const handleWrongAnswer = (e) => {
      const wrongVal = e.detail;
      if (wrongVal) {
        const id = Date.now();
        setWrongToasts(prev => [...prev, { id, text: wrongVal }]);
        setTimeout(() => {
          setWrongToasts(prev => prev.filter(t => t.id !== id));
        }, 3000); // Tự mất đi sau 3 giây như toast
      }
      setInputValue("");
      setShake(true);
      setTimeout(() => setShake(false), 400); // Shake duration
    };
    window.addEventListener("crackItWrongAnswer", handleWrongAnswer);
    return () => window.removeEventListener("crackItWrongAnswer", handleWrongAnswer);
  }, []);

  // Lắng nghe event khi có người đoán đúng (flash cho MỖI người)
  useEffect(() => {
    if (lastCorrectAnswer && lastCorrectAnswer._ts) {
      setShowFlash(true);
      // Play ding sound if available
      new Audio("/assets/audio/ding.mp3").play().catch(() => {});
      
      const timeout = setTimeout(() => setShowFlash(false), 1500);
      return () => clearTimeout(timeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCorrectAnswer?._ts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled || !inputValue.trim()) return;
    submitAnswer(inputValue.trim());
    inputRef.current?.focus();
  };

  return (
    <div className="relative shrink-0">
      
      {/* Cửa sổ nháy flash khi có người trả lời đúng */}
      <AnimatePresence mode="wait">
        {showFlash && lastCorrectAnswer && (
          <motion.div
            key={lastCorrectAnswer._ts}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex justify-center"
          >
            <div className="bg-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg border border-green-200 flex items-center justify-center gap-2 md:gap-3 text-green-600 font-bold text-sm md:text-lg max-w-[90vw] text-center mx-auto">
              🎉 {lastCorrectAnswer.player_name} {t.rooms?.game?.crackIt?.gotItRight || "đã đoán đúng!"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lịch sử lần thử (Toast tự mất) */}
      <AnimatePresence>
        {wrongToasts.length > 0 && !isCorrect && (
          <motion.div
            className="absolute bottom-full mb-4 left-0 w-full flex flex-col-reverse items-start gap-2"
          >
            {wrongToasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-lg ml-4"
              >
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
        className={`flex items-center rounded-full shadow-sm border-2 p-1.5 transition-all ${
          shake ? "bg-red-50 border-red-500 shadow-red-100" : isCorrect ? "bg-green-50 border-green-500 shadow-green-100" : "bg-white border-gray-300 focus-within:border-cath-red-400 focus-within:shadow-md"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isDisabled}
          placeholder={t.rooms?.game?.crackIt?.typeAnswer || "Nhập đáp án của bạn..."}
          className="flex-1 bg-transparent px-6 h-10 outline-none text-lg text-slate-800 disabled:text-slate-500 placeholder-gray-400 font-medium tracking-wide"
        />
        <button
          type="submit"
          disabled={isDisabled || !inputValue.trim()}
          className="w-10 h-10 rounded-full bg-cath-red-600 text-white flex items-center justify-center hover:scale-105 hover:bg-cath-red-700 disabled:opacity-50 disabled:hover:scale-100 disabled:bg-gray-300 disabled:text-gray-500 transition-all shrink-0 shadow-md"
        >
          <Send size={22} />
        </button>
      </motion.form>
    </div>
  );
};

export default AnswerInput;
