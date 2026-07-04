import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Link as LinkIcon, Bookmark, Lock } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/features/auth";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import {
  formatDate,
  formatTimeRange,
  calculateEndDate,
} from "@/shared/utils/dateFormatter";
import toast from "react-hot-toast";
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal";
import Modal from "@/shared/components/ui/Modal";
import RoomFullModal from "./RoomFullModal";
import ENThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-ANH.png";
import ZHThumbnail from "@/shared/assets/images/rooms/THUMBNAIL-TQ.png";
import { getTopicIcon } from "../utils/getTopicIcon";
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation";
import Animated3DCard from "@/shared/components/ui/animations/Animated3DCard";

const RoomCard = ({ room }) => {
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const { lang } = useParams();

  const currentLang = lang || (typeof window !== 'undefined' ? localStorage.getItem("communityLanguage") : null) || "en";
  const fallbackThumbnail = currentLang === "zh" ? ZHThumbnail : ENThumbnail;

  const translatedName = room.name;
  const isRoomFull =
    room.maxParticipants !== null &&
    (room.currentParticipantCount || 0) >= room.maxParticipants;

  const isPrivate = room.privacy === "Private" && room.hasPassword;

  const handleJoinRoom = (e) => {
    e.stopPropagation();

    // If user is not authenticated, open login modal instead of navigating
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    // If authenticated, navigate to the unified meet page
    const communityLang = localStorage.getItem("communityLanguage") || "en";
    navigate(`/${communityLang}/meet/${room.roomId}`);
  };

  // Date and time formatting using locale-aware utilities
  const createDate = new Date(room.createDate);
  const dateStr = formatDate(createDate);

  const isInfiniteDuration = room.duration === null;
  const durationMinutes = room.duration || 20; // fallback to 20 if not null
  const endDate = calculateEndDate(createDate, durationMinutes);
  const timeStr = isInfiniteDuration
    ? t.rooms.noLimit
    : formatTimeRange(createDate, endDate);

  // Placeholder code simulation
  const roomCode = `room-${room.roomId}`.toLowerCase();

  const [showDevModal, setShowDevModal] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleRoomClick = (e) => {
    if (isRoomFull) {
      e.stopPropagation();
      setShowFullModal(true);
      return;
    }

    handleJoinRoom(e);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setShowDevModal(true);
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const communityLang = localStorage.getItem("communityLanguage") || "en";
    const link = `${window.location.origin}/${communityLang}/meet/${room.roomId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết", { position: "top-center" });
      });
  };

  return (
    <>
      <Animated3DCard
        onClick={handleRoomClick}
        style={{
          fontFamily: "var(--font-primary)",
          WebkitFontSmoothing: "antialiased",
        }}
        className="h-full w-full"
        containerClassName="h-full w-full"
      >
        {/* Cover Image Section */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-[#e5e5e5]">
          <img
            src={room.thumbnailUrl || fallbackThumbnail}
            alt="Room Cover"
            className="h-full w-full object-cover"
          />

          {/* Top Left: Badges */}
          <div className="absolute left-2 top-2 max-w-[55%] flex items-center gap-1.5 z-10 p-1">
            {room.requiredLevel && (
              <div className="flex shrink-0 items-center justify-center h-7 sm:h-8 px-3 bg-cath-red-800 text-[11px] sm:text-xs font-bold text-white rounded-md shadow-sm truncate">
                {room.requiredLevel}
              </div>
            )}
            <div className="flex shrink-0 items-center justify-center h-7 w-7 sm:h-8 sm:w-8 bg-cath-red-800 rounded-full shadow-sm z-10">
              {getTopicIcon(room.topic)}
            </div>
          </div>

          {/* Top Right: Actions & Status */}
          <div className="absolute right-2 top-2 flex items-center gap-1.5 z-10 p-1">
            {isPrivate && (
              <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm shadow-sm">
                <Lock size={14} className="text-white" />
              </div>
            )}
            <div
              className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/50 shadow-sm cursor-pointer"
              onClick={handleBookmarkClick}
            >
              <Bookmark
                size={16}
                className="text-cath-red-800 fill-cath-red-800/10"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4 pb-4">
          {/* Title & Link */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="text-lg font-bold line-clamp-1 text-black leading-snug">
              {translatedName}
            </h3>
            <div
              onClick={handleCopyLink}
              title={t?.rooms?.copyLinkTooltip || "Sao chép liên kết"}
              className="flex items-center justify-center text-cath-red-800 shrink-0 hover:scale-110 transition-all active:scale-95 cursor-pointer p-1.5 rounded-full hover:bg-red-50"
            >
              <LinkIcon size={18} />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-auto flex justify-between items-center gap-3 sm:gap-4 flex-wrap">
            {/* Participants */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-[#EDC589]">
                <Users size={14} className="text-[#8B5A2B]" />
              </div>
              <span className="text-[13px] sm:text-[14px] font-medium text-black whitespace-nowrap">
                {room.maxParticipants === null
                  ? `${room.currentParticipantCount || 0} ${t.rooms.people}`
                  : `${room.currentParticipantCount || 0}/${room.maxParticipants} ${t.rooms.people}`}
              </span>
            </div>

            {/* Date/Time */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex shrink-0 items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-[#EDC589]">
                <Clock size={14} className="text-[#8B5A2B]" />
              </div>
              <div className="flex items-center text-[13px] sm:text-[14px] font-medium text-black whitespace-nowrap">
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </Animated3DCard>
      <InDevelopmentModal
        open={showDevModal}
        onCancel={() => setShowDevModal(false)}
      />

      <RoomFullModal
        open={showFullModal}
        onClose={() => setShowFullModal(false)}
      />

      {showCopied &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] px-4 py-2 bg-black/75 text-white rounded-full text-[15px] font-medium pointer-events-none shadow-lg whitespace-nowrap">
            {t?.rooms?.copySuccess || "Đã sao chép liên kết!"}
          </div>,
          document.body,
        )}
    </>
  );
};

export default RoomCard;
