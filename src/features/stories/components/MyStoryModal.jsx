import React, { useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import Modal from "@/shared/components/ui/Modal";
import { MessageSquare } from "lucide-react";
import { useTimezone } from "@/shared/hooks/useTimezone";

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

  // const createdAt = dayjs(story.createDate)
  // const expiresAt = dayjs(story.expiresAt)
  // const now = dayjs()
  // const timeRemaining = expiresAt.diff(now, "minute")
  // const hoursRemaining = Math.floor(timeRemaining / 60)
  // const minutesRemaining = timeRemaining % 60

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.story?.myStory || "My Story"}
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
          {/* <span className="flex items-center gap-1">
            <MessageSquare size={13} className="shrink-0" />
            {story.commentCount || 0} {t.story?.replies}
          </span> */}
          <span>{t.story?.posted || "Posted: "}{formatRelative(story.createDate)}</span>
        </div>

        {/* <div className="space-y-4 text-sm">
          <div>
            <p className="text-[#7A7574]">{t.story?.created || "Created"}:</p>
            <p>{createdAt.format("MMM D, YYYY h:mm A")}</p>
          </div>

          <div>
            <p className="text-[#7A7574]">
              {t.story?.expiresIn || "Expires in"}:
            </p>

            <div className="flex items-center gap-2">
              <p>
                {hoursRemaining > 0 && `${hoursRemaining}h `}
                {minutesRemaining}m
              </p>
              <p>{expiresAt.format("MMM D, YYYY h:mm A")}</p>
            </div>
          </div>
        </div> */}
      </div>
    </Modal>
  );
};

export default MyStoryModal;
