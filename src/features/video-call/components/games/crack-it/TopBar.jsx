import React, { useState, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { useLanguage } from "@/shared/context/LanguageContext";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Check, X, LogOut } from "lucide-react";

const TopBar = ({ onOpenSidebar, onExit }) => {
  const { currentRound, timer: initialTimer, gameState } = useGame();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setTimeLeft(initialTimer);
  }, [initialTimer, currentRound]); // Reset when new round starts

  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 11) {
            // Play at 10 seconds remaining
            new Audio("/sounds/ticking.mp3").play().catch(() => {});
          }
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, initialTimer]);

  if (!currentRound) return null;

  const isLowTime = timeLeft <= 10;

  return (
    <div className="flex items-center justify-between bg-white px-4 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-3xl shadow-sm border border-gray-200 shrink-0 w-full relative">
      <div className="flex items-center gap-2 md:gap-4">
        <h2 className="text-lg md:text-xl font-black text-cath-red-700 tracking-tight uppercase">
          {t.rooms?.game?.crackIt?.title || "Crack It"}
        </h2>
        <div className="h-5 md:h-6 w-px bg-gray-300"></div>
        <div className="text-sm md:text-base text-slate-600 font-medium whitespace-nowrap">
          {t.rooms?.game?.crackIt?.round || "Ván"} {currentRound.round}/
          {currentRound.total}
        </div>
      </div>

      <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
        <motion.div
          transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}}
          className={`text-2xl md:text-3xl font-black tabular-nums ${isLowTime ? "text-cath-red-600 drop-shadow-sm" : "text-slate-800"}`}
        >
          00:{timeLeft.toString().padStart(2, "0")}
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        {/* Mobile Sidebar Toggle Button */}
        {onOpenSidebar && (
          <button 
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl bg-gray-50 text-slate-600 border border-gray-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </button>
        )}
        
        {/* Exit Button */}
        {onExit && (
          <button 
            onClick={onExit}
            className="p-2 rounded-xl bg-white hover:bg-red-50 text-slate-400 hover:text-cath-red-600 border border-gray-200 hover:border-red-200 shadow-sm transition-all"
            title="Thoát trò chơi"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
