import React, { useState, useEffect } from "react";
import { useGame } from "@/features/video-call/context/GameContext";
import { useLanguage } from "@/shared/context/LanguageContext";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Check, X, LogOut } from "lucide-react";
import { playGlobalSound } from "@/features/video-call/hooks/useParticipantAudioEffect";

const TopBar = ({ onOpenSidebar, onExit }) => {
  const { currentRound, timer: initialTimer, gameState } = useGame();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setTimeLeft(initialTimer);
  }, [initialTimer, currentRound]); // Reset when new round starts

  useEffect(() => {
    let interval;
    if (gameState === "playing" && currentRound?.started_at) {
      const startedAt = new Date(currentRound.started_at).getTime();

      // Run every 200ms for smoother UI updates, though seconds only change once per sec
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const remaining = Math.max(0, initialTimer - elapsed);
        
        setTimeLeft((prev) => {
          if (remaining === 10 && prev > 10) {
            // Play at 10 seconds remaining
            playGlobalSound("ticking");
          }
          if (remaining <= 0) {
            clearInterval(interval);
          }
          return remaining;
        });
      }, 500); 
    }
    return () => clearInterval(interval);
  }, [gameState, currentRound?.started_at]);

  if (!currentRound) return null;

  const isLowTime = timeLeft <= 10;

  return (
    <div className="flex items-center justify-between bg-white px-3 md:px-10 py-2.5 md:py-4 rounded-2xl md:rounded-3xl shadow-sm border border-gray-200 shrink-0 w-full gap-2">
      <div className="flex items-center gap-1.5 md:gap-4 flex-1 overflow-hidden">
        <h2 className="text-base md:text-xl font-black text-cath-red-700 tracking-tight uppercase truncate hidden sm:block">
          {t.rooms?.game?.crackIt?.title || "Crack It"}
        </h2>
        <div className="h-4 md:h-6 w-px bg-gray-300 shrink-0 hidden sm:block"></div>
        <div className="text-sm md:text-base text-slate-600 font-medium whitespace-nowrap shrink-0">
          {t.rooms?.game?.crackIt?.round || "Ván"} {currentRound.round}/
          {currentRound.total}
        </div>
      </div>

      <div className="flex items-center justify-center shrink-0">
        <motion.div
          transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}}
          className={`text-2xl md:text-3xl font-black tabular-nums ${isLowTime ? "text-cath-red-600 drop-shadow-sm" : "text-slate-800"}`}
        >
          00:{timeLeft.toString().padStart(2, "0")}
        </motion.div>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
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
