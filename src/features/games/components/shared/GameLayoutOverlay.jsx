import React, { useState } from 'react'
import { X } from 'lucide-react'
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
    ? "relative w-full h-full flex flex-col bg-gray-50/95 text-slate-900 overflow-hidden"
    : "fixed inset-0 w-full h-[100dvh] z-[100] flex flex-col bg-gray-50/95 text-slate-900 overflow-hidden"

  return (
    <div className={containerClass}>

      {/* Container for the main layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-2 md:p-3 max-w-[1800px] mx-auto w-full">

        {/* TOP BAR */}
        <TopBar
          onOpenMobileLeaderboard={() => setShowMobileLeaderboard(true)}
        />

        {/* CONTENT - 2 COLUMNS (Sidebar trái + Game content) */}
        <div className="flex-1 flex flex-col lg:flex-row mt-3 md:mt-4 gap-4 md:gap-6 min-h-0 relative">

          {/* Column 1: Leaderboard */}
          <div className="hidden lg:block lg:w-[300px] xl:w-[320px] shrink-0 h-full min-h-0">
            <GameSidebar />
          </div>

          {/* Column 2: Game Content - full remaining space (screen-share style) */}
          <div className="flex-1 min-w-0 h-full min-h-0 flex flex-col relative overflow-hidden">
            {gameContentComponent}
          </div>

          {/* Mobile Leaderboard Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-[150] w-[85vw] max-w-sm p-0 transform transition-transform duration-300 ease-in-out ${showMobileLeaderboard ? "translate-x-0" : "-translate-x-full"} lg:hidden`}>
            <div className="h-full w-full relative bg-white">
              <button
                onClick={() => setShowMobileLeaderboard(false)}
                className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-red-50 rounded-full text-slate-400 hover:text-cath-red-600 z-10 transition-colors shadow-sm border border-gray-100"
              >
                <X size={18} />
              </button>
              <GameSidebar />
            </div>
          </div>
          {showMobileLeaderboard && (
            <div
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[140] lg:hidden"
              onClick={() => setShowMobileLeaderboard(false)}
            />
          )}
        </div>
      </div>

      {/* Game overlay */}
      {overlays}
    </div>
  )
}

export default GameLayoutOverlay