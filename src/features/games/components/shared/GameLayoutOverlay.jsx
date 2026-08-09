import React, { useState } from 'react'
import TopBar from './TopBar'
import GameSidebar from './GameSidebar'

const GameLayoutOverlay = ({
  // Content Components
  gameContentComponent,

  // Modal overlays
  overlays,

  // Khi true, render gọn trong container (1 tile) thay vì fixed fullscreen.
  embedded = false,
}) => {
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false)

  const containerClass = embedded
    ? "relative w-full h-full flex flex-col bg-white text-slate-900 overflow-hidden"
    : "fixed inset-0 w-full h-[100dvh] z-[100] flex flex-col bg-gray-50/95 text-slate-900 overflow-hidden"

  return (
    <div className={containerClass}>
      {/* Container for the main layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* TOP BAR */}
        <TopBar
          onOpenMobileLeaderboard={
            embedded ? () => setShowMobileLeaderboard(true) : undefined
          }
        />

        {/* CONTENT */}
        {embedded ? (
          // Embedded (trong tile spotlight): 2 cột compact, BXH trái, content phải chiếm phần còn lại
          <div className="flex-1 flex flex-row mt-1 md:mt-2 gap-2 min-h-0 relative px-2 md:px-3 pb-2 md:pb-3 w-full overflow-hidden">
            <div className="hidden sm:block w-[220px] md:w-[260px] shrink-0 h-full min-h-0">
              <GameSidebar embedded />
            </div>
            <div className="flex-1 min-w-0 h-full min-h-0 flex flex-col relative overflow-hidden">
              {gameContentComponent}
            </div>
          </div>
        ) : (
          // Fullscreen: 2 cột như cũ
          <div className="flex-1 flex flex-col lg:flex-row mt-3 md:mt-4 gap-4 md:gap-6 min-h-0 relative p-2 md:p-3 max-w-[1800px] mx-auto w-full">
            <div className="hidden lg:block lg:w-[300px] xl:w-[320px] shrink-0 h-full min-h-0">
              <GameSidebar />
            </div>
            <div className="flex-1 min-w-0 h-full min-h-0 flex flex-col relative overflow-hidden">
              {gameContentComponent}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Leaderboard Drawer (chỉ embedded) */}
      {embedded && (
        <>
          {/* Backdrop — phủ toàn viewport */}
          <div
            className={`fixed inset-0 z-[150] bg-slate-900/50 backdrop-blur-sm sm:hidden transition-opacity duration-200 ${
              showMobileLeaderboard ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setShowMobileLeaderboard(false)}
          />

          {/* Drawer — 80% width, trượt từ phải */}
          <div
            className={`fixed inset-y-0 right-0 z-[160] w-[80vw] max-w-sm sm:hidden transform transition-transform duration-300 ease-out ${
              showMobileLeaderboard ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full w-full relative bg-white flex flex-col shadow-2xl">
              {/* BXH đầy đủ — title + nút X nằm cùng dòng trong GameSidebar */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <GameSidebar onClose={() => setShowMobileLeaderboard(false)} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Game overlay */}
      {overlays}
    </div>
  )
}

export default GameLayoutOverlay