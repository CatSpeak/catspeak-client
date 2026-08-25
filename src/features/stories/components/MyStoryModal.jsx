import React, { useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTimezone } from "@/shared/hooks/useTimezone";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import Modal from "@/shared/components/ui/Modal";
import { AlertCircle } from "lucide-react";

const MyStoryModal = ({ open, story, onClose, onDelete }) => {
  const { t } = useLanguage();
  const { formatRelative } = useTimezone();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(story?.storyId);
      handleClose();
    } else {
      setConfirmDelete(true);
    }
  };

  if (!story) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2.5">
          <h2 className="text-[20px] leading-[26px] font-semibold">
            {t.story?.myStory || "My Story"}
          </h2>
          {story.isReported && (
            <div
              className="group relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold shrink-0 cursor-help"
            >
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <span>{t.catSpeak?.reportedWarning || "Bị báo cáo"}</span>

              {/* Tooltip */}
              <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                {t.catSpeak?.myReportedTooltip || "Thư của bạn đã bị người dùng báo cáo"}
              </div>
            </div>
          )}
        </div>
      }
      showCloseButton={false}
      bodyClassName="px-4 md:px-6"
      className="md:max-w-[525px]"
      footer={
        <div className="flex justify-center gap-3 flex-1">
          <PillButton
            variant="secondary"
            onClick={handleClose}
            className="md:h-12 h-11 w-56"
          >
            {t.messages?.close || "Close"}
          </PillButton>
          <PillButton onClick={handleDelete} className="md:h-12 h-11 w-56">
            {confirmDelete
              ? t.story?.confirmDelete || "Confirm Delete"
              : t.story?.deleteStory || "Delete Story"}
          </PillButton>
        </div>
      }
    >
      <div className="md:space-y-1 space-y-0">
        <div className="w-full break-words text-base whitespace-pre-wrap">
          {story.storyContent}
        </div>
        <div className="flex items-center gap-4 text-sm text-secondary">
          <span>{t.story?.posted || "Posted: "}{formatRelative(story.createDate)}</span>
        </div>
      </div>
    </Modal>
  );
};

export default MyStoryModal;
