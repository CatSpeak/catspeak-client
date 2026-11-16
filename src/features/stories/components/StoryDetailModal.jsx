import React from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTimezone } from "@/shared/hooks/useTimezone";

import Avatar from "@/shared/components/ui/Avatar";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import Modal from "@/shared/components/ui/Modal";
import { AlertCircle } from "lucide-react";

const StoryDetailModal = ({ open, story, onConnect, onReport, onClose }) => {
  const { t } = useLanguage();
  const { formatRelative } = useTimezone();

  const handleClose = () => {
    onClose();
  };

  const handleReport = () => {
    if (story) onReport(story);
    handleClose();
  };

  const handleConnect = () => {
    if (story) onConnect(story);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.catSpeak?.story || "Story"}
      className="md:max-w-[525px]"
      footer={
        <div className="flex items-center gap-2 w-full">
          <PillButton
            variant="secondary"
            onClick={handleReport}
            className="flex-1"
          >
            {t.catSpeak?.report || "Báo cáo"}
          </PillButton>
          <PillButton onClick={handleConnect} className="flex-1">
            {t.catSpeak?.connect || "Connect"}
          </PillButton>
        </div>
      }
    >
      <div className="space-y-4">
        {story?.isReported && (
          <div className="flex items-center gap-4 h-[56px] px-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 text-base text-red-700 dark:text-red-400">
            <AlertCircle className="shrink-0 text-red-500 dark:text-red-400" />
            <span>{t.catSpeak?.reportedWarning || "Bị báo cáo"}</span>
          </div>
        )}

        {/* User Info Header */}
        <div className="flex items-center gap-4">
          <Avatar
            src={story?.avatarImageUrl}
            name={story?.username || t.catSpeak?.anonymous || "Anonymous"}
            size={40}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-base text-[#1a1a1a] dark:text-white truncate">
              {story?.username || t.catSpeak?.anonymous || "Anonymous"}
            </span>
            <div className="text-sm text-secondary dark:text-[#AAAAAA]">
              <span>{t.story?.posted} {story?.createDate ? formatRelative(story.createDate) : ""}</span>
            </div>
          </div>
        </div>

        <div className="w-full break-words text-base whitespace-pre-wrap text-gray-800 dark:text-neutral-200">
          {story?.storyContent}
        </div>
      </div>
    </Modal>
  );
};

export default StoryDetailModal;

