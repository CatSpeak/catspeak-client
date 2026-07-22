import React, { useState } from 'react'
import { X } from 'lucide-react'
import TopBar from './TopBar'
import GameSidebar from './GameSidebar'
import ExitConfirmModal from './ExitConfirmModal'
import { useGlobalVideoCall } from '@/features/video-call/context/GlobalVideoCallProvider'
import ChatBox from '@/features/video-call/components/chat/ChatBox';
const GameLayoutOverlay = ({
  // Content Components
  gameContentComponent,

  // Modal overlays
  overlays,
}) => {
  const {
    messages,
    handleSendMessage,
    isConnected,
    user
  } = useGlobalVideoCall()

  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  return (
    <div className="fixed inset-0 w-full h-[100dvh] z-[100] flex flex-col bg-gray-50/95 text-slate-900 overflow-hidden">

      {/* Container for the main layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 md:p-6 max-w-[1800px] mx-auto w-full">

        {/* TOP BAR */}
        <TopBar
          onOpenMobileLeaderboard={() => setShowMobileLeaderboard(true)}
          onOpenMobileChat={() => setShowMobileChat(true)}
          onLeaveGame={() => setShowExitConfirm(true)}
        />

        {/* CONTENT - 3 COLUMNS */}
        <div className="flex-1 flex flex-col lg:flex-row mt-3 md:mt-4 gap-4 md:gap-6 min-h-0 relative">

          {/* Column 1: Leaderboard */}
          <div className="hidden lg:block lg:w-[300px] xl:w-[320px] shrink-0 h-full min-h-0">
            <GameSidebar />
          </div>

          {/* Column 2: Game Content */}
          <div className="flex-1 min-w-0 h-full min-h-0 flex flex-col relative overflow-hidden">
            {gameContentComponent}
          </div>

          {/* Column 3: Chat */}
          <div className="hidden lg:block lg:w-[360px] xl:w-[400px] shrink-0 h-full min-h-0">
            <div className="w-full h-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              <ChatBox
                messages={messages}
                currentUser={user}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
                className="w-full h-full"
              />
            </div>
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

          {/* Mobile Chat Sidebar */}
          <div className={`fixed inset-y-0 right-0 z-[150] w-[85vw] max-w-sm p-0 transform transition-transform duration-300 ease-in-out ${showMobileChat ? "translate-x-0" : "translate-x-full"} lg:hidden`}>
            <div className="h-full w-full relative bg-white">
              <button
                onClick={() => setShowMobileChat(false)}
                className="absolute top-4 left-4 p-2 bg-gray-50 hover:bg-red-50 rounded-full text-slate-400 hover:text-cath-red-600 z-[160] transition-colors shadow-sm border border-gray-100"
              >
                <X size={18} />
              </button>
              <div className="w-full h-full pt-14 bg-white flex flex-col relative z-[155]">
                <ChatBox
                  messages={messages}
                  currentUser={user}
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
          {showMobileChat && (
            <div
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[140] lg:hidden"
              onClick={() => setShowMobileChat(false)}
            />
          )}
        </div>
      </div>

      {/* Game overlay */}
      {overlays}

      {/* Exit confirm modal */}
      <ExitConfirmModal
        showExitConfirm={showExitConfirm}
        setShowExitConfirm={setShowExitConfirm}
      />
    </div>
  )
}

export default GameLayoutOverlay