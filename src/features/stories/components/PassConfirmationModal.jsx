import React, { } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTimezone } from "@/shared/hooks/useTimezone";

import Avatar from "@/shared/components/ui/Avatar";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import Modal from "@/shared/components/ui/Modal";
import { MessageSquare } from "lucide-react";

const PassConfirmationModal = ({ open, story, onConnect, onReport, onClose }) => {
  const { t } = useLanguage();
  const { formatRelative } = useTimezone();
  // const [confirmPass, setConfirmPass] = useState(false);

  const handleClose = () => {
    // setConfirmPass(false);
    onClose();
  };

  // const handlePass = () => {
  //   // if (confirmPass) {
  //   onPass(story);
  //   handleClose();
  // };

  const handleReport = () => {
    // if (confirmPass) {
    onReport(story);
    handleClose();
  };

  const handleConnect = () => {
    onConnect(story);
    handleClose();
  };

  if (!story) return null;

  // const createdAt = dayjs(story.createDate)
  // const expiresAt = dayjs(story.expiresAt)
  // const now = dayjs()
  // const timeRemaining = expiresAt.diff(now, "minute")
  // const hoursRemaining = Math.max(0, Math.floor(timeRemaining / 60))
  // const minutesRemaining = Math.max(0, timeRemaining % 60)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t.catSpeak?.story || "Story"}
      bodyClassName="px-4 md:px-6"
      className="md:max-w-[525px]"
      footer={
        <div className="flex justify-center gap-3 flex-1">
          <PillButton
            variant="secondary"
            onClick={handleReport}
            className="md:h-12 h-11 w-56"
          >
            {/* {confirmPass
              ? t.catSpeak?.confirm || "Confirm Pass"
              : t.catSpeak?.pass || "Pass"} */}
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
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-[#1a1a1a] truncate">
              {story.username || t.catSpeak?.anonymous || "Anonymous"}
            </span>
            <div className="flex items-center gap-4 text-sm text-secondary">
              {/* <span className="flex items-center gap-1">
                <MessageSquare size={13} className="shrink-0" />
                {story.commentCount || 0} {t.story?.replies}
              </span> */}
              <span>{t.story?.posted} {formatRelative(story.createDate)}</span>
            </div>
          </div>
        </div>

        <div className="w-full break-words text-base whitespace-pre-wrap">
          {story.storyContent}
        </div>

        {/* <div className="space-y-4 text-sm">
          <div>
            <p className="text-[#7A7574]">
              {t.catSpeak?.created || "Created"}:
            </p>
            <p>{createdAt.format("MMM D, YYYY h:mm A")}</p>
          </div>

          <div>
            <p className="text-[#7A7574]">
              {t.catSpeak?.expiresIn || "Expires in"}:
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

export default PassConfirmationModal;
