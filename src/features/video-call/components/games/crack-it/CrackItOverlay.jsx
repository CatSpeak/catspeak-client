import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "../../../context/GameContext";
import TopBar from "./TopBar";
import PuzzleCenter from "./PuzzleCenter";
import AnswerInput from "./AnswerInput";
import GameSidebar from "./GameSidebar";
import { useLanguage } from "@/shared/context/LanguageContext";
import Confetti from "react-confetti"; // Might need to install or use a placeholder if not installed
import { X } from "lucide-react";
import { useParticipants } from "@livekit/components-react";

import RoundResultOverlay from "./RoundResultOverlay";
import GameOverScreen from "./GameOverScreen";
import ExitConfirmModal from "./ExitConfirmModal";

const CrackItOverlay = () => {
  const { gameState, gameType, exitGame, countdown, roundResults, finalResults, currentUserId, playerNames, currentRound, leftPlayers } = useGame();
  const { t } = useLanguage();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const participants = useParticipants();

  const getPlayerName = (id) => {
    let name = "";
    if (playerNames?.[id]) name = playerNames[id];
    else {
      const p = participants.find(p => p.identity === id.toString());
      if (p && p.name) name = p.name;
      else name = t.rooms?.game?.crackIt?.playerX ? t.rooms.game.crackIt.playerX.replace('{0}', id) : `Người chơi ${id}`;
    }
    
    return {
      name,
      isYou: id.toString() === currentUserId?.toString()
    };
  };

  const hasLeft = leftPlayers?.has(currentUserId?.toString());

  if (gameState === "idle" || gameType !== "crack_it" || hasLeft) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] z-[100] flex bg-gray-50/95 text-slate-900 overflow-hidden">
      {/* Nút thoát khẩn cấp được di chuyển vào TopBar */}
      
      {/* Exit Confirmation Modal */}
      <ExitConfirmModal 
        showExitConfirm={showExitConfirm} 
        setShowExitConfirm={setShowExitConfirm} 
        t={t} 
        exitGame={exitGame} 
      />

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* GAME_SETUP & COUNTDOWN */}
        <AnimatePresence>
          {gameState === "setup" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 text-slate-900"
            >
              <h1 className="text-4xl font-bold mb-8 text-cath-red-700">
                {t.rooms?.game?.crackIt?.title || "Crack It"}
              </h1>
              {countdown !== null ? (
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl font-black text-cath-red-500"
                >
                  {countdown}
                </motion.div>
              ) : (
                <div className="text-xl text-slate-600 font-medium">
                  {t.rooms?.game?.crackIt?.waitingStart || "Đang chuẩn bị ván đấu..."}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PLAYING STATE */}
        {(gameState === "playing" || gameState === "result") && (
          <div className="flex-1 flex flex-col p-4 md:p-6 max-w-6xl mx-auto w-full h-full overflow-hidden">
            <TopBar 
              onOpenSidebar={() => setShowMobileSidebar(true)} 
              onExit={() => setShowExitConfirm(true)} 
            />
            
            <div className="flex-1 flex flex-col lg:flex-row mt-4 md:mt-6 gap-4 md:gap-8 min-h-0">
              {/* Left & Center: Puzzle and Answer */}
              <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0 relative items-center justify-start md:justify-center overflow-y-auto md:overflow-visible w-full pb-8 md:pb-4">
                <PuzzleCenter />
                <div className="w-full max-w-2xl mt-4 shrink-0">
                  <AnswerInput />
                </div>

                {/* ROUND RESULT OVERLAY */}
                <RoundResultOverlay 
                  gameState={gameState} 
                  roundResults={roundResults} 
                  currentRound={currentRound}
                  t={t} 
                  getPlayerName={getPlayerName} 
                />
              </div>

              {/* Right Sidebar (Desktop) / Slide-out (Mobile) */}
              <div className={`
                fixed inset-y-0 right-0 z-[150] w-[85vw] max-w-sm p-0 transform transition-transform duration-300 ease-in-out
                ${showMobileSidebar ? "translate-x-0" : "translate-x-full"}
                lg:relative lg:translate-x-0 lg:z-0 lg:w-[320px] lg:p-0 lg:shrink-0 lg:h-full lg:min-h-0
              `}>
                <div className="h-full w-full relative">
                  <button 
                    onClick={() => setShowMobileSidebar(false)} 
                    className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-red-50 rounded-full text-slate-400 hover:text-cath-red-600 lg:hidden z-10 transition-colors shadow-sm border border-gray-100"
                  >
                    <X size={18} />
                  </button>
                  <GameSidebar />
                </div>
              </div>

              {/* Mobile Sidebar Overlay */}
              {showMobileSidebar && (
                <div 
                  className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[140] lg:hidden"
                  onClick={() => setShowMobileSidebar(false)}
                />
              )}
            </div>
          </div>
        )}

        {/* GAME OVER STATE */}
        <GameOverScreen 
          gameState={gameState} 
          finalResults={finalResults} 
          t={t} 
          getPlayerName={getPlayerName} 
          exitGame={exitGame} 
        />

      </div>
    </div>
  );
};

export default CrackItOverlay;
