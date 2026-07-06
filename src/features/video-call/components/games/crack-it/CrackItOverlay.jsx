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
import { X, LogOut, Check } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import { useParticipants } from "@livekit/components-react";

const CrackItOverlay = () => {
  const { gameState, gameType, exitGame, countdown, roundResults, finalResults, currentUserId, playerNames } = useGame();
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

  if (gameState === "idle" || gameType !== "crack_it") {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] z-[100] flex bg-gray-50/95 text-slate-900 overflow-hidden">
      {/* Nút thoát khẩn cấp được di chuyển vào TopBar */}
      
      {/* Exit Confirmation Modal */}
      <Modal
        open={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title={t.rooms?.game?.crackIt?.exitConfirmTitle || "Xác nhận thoát"}
        className="bg-white text-slate-900 max-w-sm rounded-3xl overflow-hidden border border-gray-200 shadow-2xl"
        headerClassName="flex items-center justify-between p-4 pl-6 border-b border-gray-100"
        fullScreenOnMobile={false}
      >
        <div className="py-6 px-6 text-center text-slate-600">
          <p>{t.rooms?.game?.crackIt?.exitConfirmDesc1 || "Bạn có chắc chắn muốn thoát khỏi trò chơi này không?"}</p>
          <p className="text-cath-red-600 font-semibold mt-2">{t.rooms?.game?.crackIt?.exitConfirmDesc2 || "Bạn sẽ không thể tham gia lại ván chơi này nữa!"}</p>
        </div>
        <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={() => setShowExitConfirm(false)}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-slate-700 transition-all"
          >
            {t.rooms?.game?.crackIt?.cancel || "Hủy"}
          </button>
          <button 
            onClick={() => {
              setShowExitConfirm(false);
              exitGame();
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-cath-red-500 hover:bg-cath-red-600 text-white shadow-lg shadow-cath-red-500/25 transition-all"
          >
            {t.rooms?.game?.crackIt?.confirmExit || "Đồng ý thoát"}
          </button>
        </div>
      </Modal>

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
                <AnimatePresence>
                  {gameState === "result" && roundResults && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-40 bg-white/95 flex flex-col items-center justify-center text-slate-900 rounded-3xl backdrop-blur-sm border border-gray-100 shadow-2xl"
                    >
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wider mb-2 drop-shadow-sm text-center">
                        {t.rooms?.game?.crackIt?.roundResult || "Đáp án chính xác là"}:
                      </h2>
                      <div className="text-6xl font-black text-green-600 mb-10 tracking-widest drop-shadow-md text-center px-4">
                        {roundResults.correct_answer}
                      </div>

                      {/* Bảng xếp hạng thu nhỏ của Round */}
                      <div className="w-full max-w-lg bg-gray-50 rounded-3xl p-6 border border-gray-200 shadow-xl mb-8 flex flex-col min-h-0 max-h-[50vh]">
                        <h3 className="text-xl font-bold mb-4 text-center text-slate-700 shrink-0">
                          {t.rooms?.game?.crackIt?.roundLeaderboard || "Thành tích ván này"}
                        </h3>
                        <div className="flex flex-col gap-3 overflow-y-auto pr-2 min-h-0">
                          {Object.keys(roundResults.cumulative_scores || {})
                            .sort((a, b) => roundResults.cumulative_scores[b] - roundResults.cumulative_scores[a])
                            .map((id, index) => {
                              const score = roundResults.cumulative_scores[id];
                              const delta = roundResults.scores_delta?.[id] || 0;
                              return (
                                <div key={id} className="flex items-center justify-between bg-white shadow-sm border border-gray-100 px-4 py-3 rounded-2xl">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-slate-500">
                                      #{index + 1}
                                    </div>
                                    <div className="font-semibold text-lg text-slate-800 flex items-center gap-1">
                                      <span className="truncate max-w-[150px] md:max-w-[200px]">{getPlayerName(id).name}</span>
                                      {getPlayerName(id).isYou && (
                                        <span className="font-normal text-slate-500 text-sm shrink-0">
                                          ({t.rooms?.game?.crackIt?.you || "Bạn"})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {delta > 0 && (
                                      <div className="text-green-600 font-bold text-lg">
                                        +{delta}
                                      </div>
                                    )}
                                    <div className="text-cath-red-600 font-bold text-2xl w-16 text-right">
                                      {score}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <p className="text-slate-500 font-medium animate-pulse mt-4">
                        {t.rooms?.game?.crackIt?.nextRoundIn || "Ván tiếp theo sẽ bắt đầu sau ít giây..."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
        <AnimatePresence>
          {gameState === "game_over" && finalResults && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F9FAFB]"
            >
              <Confetti width={window.innerWidth} height={window.innerHeight} />
              
              <div className="relative z-10 bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-lg w-full text-center border-4 border-gray-100 mx-4 flex flex-col max-h-[80vh]">
                <h2 className="text-4xl md:text-5xl font-black text-cath-red-600 mb-6 uppercase tracking-widest drop-shadow-sm shrink-0">
                  {t.rooms?.game?.crackIt?.gameOver || "KẾT THÚC!"}
                </h2>
                
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3 shrink-0">
                  {t.rooms?.game?.crackIt?.finalLeaderboard || "Bảng Xếp Hạng Chung Cuộc"}
                  <span className="text-cath-red-500">🏆</span>
                </h3>
                
                <div className="flex flex-col gap-4 mb-6 overflow-y-auto pr-2 min-h-0">
                  {Object.entries(finalResults.final_scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([id, score], index) => (
                    <div key={id} className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-100"}`}>
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-xl text-slate-400 w-8">
                          #{index + 1}
                        </div>
                        <div className="font-semibold text-slate-800 text-lg flex items-center gap-1">
                          <span className="truncate max-w-[120px] md:max-w-[200px]">{getPlayerName(id).name}</span>
                          {getPlayerName(id).isYou && (
                            <span className="font-normal text-slate-500 text-sm shrink-0">
                              ({t.rooms?.game?.crackIt?.you || "Bạn"})
                            </span>
                          )}
                          {index === 0 && <span className="ml-1">👑</span>}
                        </div>
                      </div>
                      <div className="font-bold text-cath-red-600 text-xl">
                        {score} pts
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={exitGame}
                  className="mt-4 shrink-0 w-full bg-cath-red-700 hover:bg-cath-red-800 text-white font-semibold h-12 rounded-full transition-colors"
                >
                  {t.rooms?.game?.crackIt?.closeGame || "Đóng Game"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CrackItOverlay;
