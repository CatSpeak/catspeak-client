import React, { useState, useRef, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnectionState } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";

import {
  VideoGrid,
  ParticipantList,
  ChatBox,
  ControlBar as VideoCallControlBar,
  RoomHeader,
} from "@/features/video-call";
import BackgroundsAndEffectsPanel from "@/features/video-call/components/BackgroundsAndEffectsPanel";
import TroubleshootPanel from "@/features/video-call/components/TroubleshootPanel";
import VirtualBackgroundPicker from "@/features/video-call/components/VirtualBackgroundPicker";
import AvatarUrlPicker from "@/features/video-call/components/AvatarUrlPicker";
import SubtitleOverlay from "@/features/video-call/components/SubtitleOverlay";
import SubtitleOverlayNonAI from "@/features/video-call/components/SubtitleOverlayNonAI";

import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider";
import { VideoCallProvider } from "@/features/video-call/context/VideoCallProvider";
import { GameProvider } from "@/features/games/context/GameContext";
// import CrackItOverlay from "@/features/video-call/components/games/crack-it/CrackItOverlay";
import PictureITOverlay from "@/features/games/components/picture-it/components/PictureITOverlay";
import { useLanguage } from "@/shared/context/LanguageContext";
import VideoCallLoading from "@/features/video-call/components/VideoCallLoading";
import CrackItOverlay from "@/features/games/components/crack-it/CrackItOverlay";

const VideoCallRoomContent = () => {
  const { t } = useLanguage();
  const {
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    showVirtualBackground,
    setShowVirtualBackground,
    showAvatarPicker,
    setShowAvatarPicker,
    activeSidePanel,
    setActiveSidePanel,
    showTroubleshoot,
    isAISession,
    showCC,
    // Auth guard
    user,
    location,
    // Header info
    session,
    room,
    // ChatBox props (presentational component — keeps props-based API)
    messages,
    handleSendMessage,
    isConnected,
    // PiP controls
    enterPiP,
    // Room subtitles
    showRoomSubtitles,
  } = useVideoCallContext();

  const isSidePanelOpen = activeSidePanel !== null;
  const sidePanelTitle = showParticipants
    ? t.rooms.videoCall.participantList.title
    : showVirtualBackground
      ? t.rooms?.videoCall?.backgroundsAndEffects || "Backgrounds and effects"
      : showAvatarPicker
        ? t.rooms?.avatarPicker?.title || "Meeting Avatar"
        : showTroubleshoot
          ? t.rooms?.videoCall?.reconnect || "Troubleshoot connection"
          : t.rooms.chatBox.title;

  // ── LiveKit connection gate ──
  // The "Connecting…" loading screen from VideoCallProvider is dismissed
  // as soon as phase flips to "in-call", but LiveKit may still be
  // negotiating the WebSocket at that point.  Keep showing a loader
  // until the connection is fully established so that participant
  // metadata (name, avatar, etc.) is available when VideoGrid renders.
  const connectionState = useConnectionState();
  const [hasConnected, setHasConnected] = useState(false);

  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      setHasConnected(true);
    }
  }, [connectionState]);

  const livekitReady =
    hasConnected || connectionState === ConnectionState.Connected;
  const isReconnecting = connectionState === ConnectionState.Reconnecting;

  useEffect(() => {
    // Prevent iOS/macOS swipe-to-go-back gestures during the call
    document.body.style.overscrollBehaviorX = "none";
    return () => {
      document.body.style.overscrollBehaviorX = "auto";
    };
  }, []);

  if (!user) {
    return (
      <Navigate
        to="/"
        state={{
          requireLogin: true,
          redirectTo: location.pathname + location.search + location.hash,
        }}
        replace
      />
    );
  }

  if (!livekitReady) {
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col relative">
      {isReconnecting && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/50 backdrop-blur-md text-white">
          <div className="relative flex items-center justify-center h-16 w-16 mb-6">
            <span className="absolute inline-flex h-full w-full animate-[ping_2s_ease-in-out_infinite] rounded-full bg-white opacity-20"></span>
            <span className="absolute inline-flex h-12 w-12 animate-[ping_1.5s_ease-in-out_infinite] rounded-full bg-white opacity-30"></span>
            <span className="relative inline-flex h-5 w-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]"></span>
          </div>
          <p className="text-lg font-medium tracking-wide animate-pulse">
            {t.rooms?.videoCall?.provider?.reconnecting ??
              "Reconnecting to call..."}
          </p>
        </div>
      )}
      {/* Top Bar */}
      <RoomHeader />

      {/* Game Overlay */}
      <CrackItOverlay />

      <PictureITOverlay />

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row bg-[#F3F3F3]">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-[0.03] pointer-events-none" />
        {/* Video Area */}
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="flex-1 relative min-h-0">
            <VideoGrid />
          </div>
          {/* AI Room subtitles — only show in AI rooms when enabled */}
          {isAISession && showCC && <SubtitleOverlay />}
          {/* Non-AI Room subtitles — only show in non-AI rooms when enabled */}
          {!isAISession && showRoomSubtitles && (
            <SubtitleOverlayNonAI showRoomSubtitles={showRoomSubtitles} />
          )}
        </div>

        {/* Desktop Side Panel */}
        <AnimatePresence initial={false}>
          {isSidePanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 336, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden md:flex flex-col overflow-hidden relative py-5"
              style={{ width: 336 }}
            >
              <div className="w-80 h-full flex flex-col shrink-0 bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                {showParticipants && <ParticipantList />}
                {showVirtualBackground && <BackgroundsAndEffectsPanel />}
                {showAvatarPicker && <AvatarUrlPicker />}
                {showTroubleshoot && <TroubleshootPanel />}
                {showChat && (
                  <ChatBox
                    messages={messages}
                    currentUser={user}
                    onSendMessage={handleSendMessage}
                    isConnected={isConnected}
                    className="h-full w-full"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay Side Panel */}
        <AnimatePresence initial={false}>
          {isSidePanelOpen && (
            <div className="md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30 flex bg-black/40"
                onClick={() => setActiveSidePanel(null)}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="text-black flex w-full items-center gap-2 border-b border-[#E5E5E5] px-4 py-3 text-left hover:bg-gray-50"
                    onClick={() => setActiveSidePanel(null)}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary2/10">
                      <ChevronRight className="rotate-180" />
                    </span>
                    <div className="text-base font-semibold">
                      {sidePanelTitle}
                    </div>
                  </button>

                  <div className="flex-1 overflow-y-auto">
                    {showParticipants && <ParticipantList hideTitle />}
                    {showVirtualBackground && <BackgroundsAndEffectsPanel />}
                    {showAvatarPicker && <AvatarUrlPicker />}
                    {showTroubleshoot && <TroubleshootPanel hideTitle />}
                    {showChat && (
                      <ChatBox
                        messages={messages}
                        currentUser={user}
                        onSendMessage={handleSendMessage}
                        isConnected={isConnected}
                        className="h-full w-full"
                        hideTitle
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <VideoCallControlBar />
    </div>
  );
};

const VideoCallRoomWrapper = () => {
  const { lang } = useParams();
  return (
    <VideoCallProvider>
      <GameProvider roomLanguage={lang === "zh" ? "zh" : "en"}>
        <VideoCallRoomContent />
      </GameProvider>
    </VideoCallProvider>
  );
};

export default VideoCallRoomWrapper;
