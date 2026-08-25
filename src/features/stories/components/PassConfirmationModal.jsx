import React from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTimezone } from "@/shared/hooks/useTimezone";

import Avatar from "@/shared/components/ui/Avatar";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import Modal from "@/shared/components/ui/Modal";
import { AlertCircle } from "lucide-react";

const PassConfirmationModal = ({ open, story, onConnect, onReport, onClose }) => {
  const { t } = useLanguage();
  const { formatRelative } = useTimezone();

  const handleClose = () => {
    onClose();
  };

  const handleReport = () => {
    onReport(story);
    handleClose();
  };

  const handleConnect = () => {
    onConnect(story);
    handleClose();
  };

  if (!story) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2.5">
          <h2 className="text-[20px] leading-[26px] font-semibold">
            {t.catSpeak?.story || "Story"}
          </h2>
          {story.isReported && (
            <div
              className="group relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold shrink-0 cursor-help"
            >
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <span>{t.catSpeak?.reportedWarning || "Bị báo cáo"}</span>

              {/* Tooltip */}
              <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                {t.catSpeak?.reportedTooltip || "Thư này đã bị người dùng báo cáo vi phạm"}
              </div>
            </div>
          )}
        </div>
      }
      bodyClassName="px-4 md:px-6"
      className="md:max-w-[525px]"
      footer={
        <div className="flex justify-center gap-3 flex-1">
          <PillButton
            variant="secondary"
            onClick={handleReport}
            className="md:h-12 h-11 w-56"
          >
            {t.catSpeak?.report || "Báo cáo"}
          </PillButton>
          <PillButton onClick={handleConnect} className="md:h-12 h-11 w-56">
            {t.catSpeak?.connect || "Connect"}
          </PillButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* User Info Header */}
        <div className="flex items-center gap-4">
          <Avatar
            src={story.avatarImageUrl}
            name={story.username || t.catSpeak?.anonymous || "Anonymous"}
            size={56}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-lg text-[#1a1a1a] truncate">
              {story.username || t.catSpeak?.anonymous || "Anonymous"}
            </span>
            <div className="flex items-center gap-4 text-sm text-secondary">
              <span>{t.story?.posted} {formatRelative(story.createDate)}</span>
            </div>
          </div>
        </div>

        <div className="w-full break-words text-base whitespace-pre-wrap">
          {story.storyContent}
        </div>
      </div>
    </Modal>
  );
};

export default PassConfirmationModal;
