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
      if (story?.storyId) onDelete(story.storyId);
      handleClose();
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.story?.myStory || "My Story"}
      showCloseButton={false}
      className="md:max-w-[525px]"
      footer={
        <div className="flex items-center gap-2 w-full">
          <PillButton
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            {t.messages?.close || "Close"}
          </PillButton>
          <PillButton onClick={handleDelete} className="flex-1">
            {confirmDelete
              ? t.story?.confirmDelete || "Confirm Delete"
              : t.story?.deleteStory || "Delete Story"}
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
        <div className="w-full break-words text-base whitespace-pre-wrap text-gray-800 dark:text-neutral-200">
          {story?.storyContent}
        </div>
        <div className="text-sm text-secondary dark:text-[#AAAAAA]">
          <span>{t.story?.posted || "Posted: "}{story?.createDate ? formatRelative(story.createDate) : ""}</span>
        </div>
      </div>
    </Modal>
  );
};

export default MyStoryModal;
