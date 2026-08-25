import React, { } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLanguage } from "@/shared/context/LanguageContext";

import Avatar from "@/shared/components/ui/Avatar";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import Modal from "@/shared/components/ui/Modal";
import { MessageSquare, AlertCircle } from "lucide-react";

dayjs.extend(relativeTime);

const PassConfirmationModal = ({ open, story, onConnect, onReport, onClose }) => {
  const { t } = useLanguage();
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
      bodyClassName="p-4 md:p-6 pt-0 md:pt-0"
      className="md:max-w-[525px]"
    >
      <div className="md:space-y-6 space-y-4">
        {/* User Info Header */}
        <div className="flex items-center gap-3 pr-10">
          <Avatar
            src={story.avatarImageUrl}
            name={story.username || t.catSpeak?.anonymous || "Anonymous"}
            size={44}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lg text-[#1a1a1a] truncate">
                {story.username || t.catSpeak?.anonymous || "Anonymous"}
              </span>
              {story.isReported && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-semibold shrink-0 shadow-2xs"
                  title={t.catSpeak?.reportedWarning || "Bị báo cáo"}
                >
                  <AlertCircle size={13} className="text-red-500 shrink-0" />
                  <span>{t.catSpeak?.reportedWarning || "Bị báo cáo"}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[#9e9e9e] mt-1">
              {/* <span className="flex items-center gap-1">
                <MessageSquare size={13} className="shrink-0" />
                {story.commentCount || 0} {t.story?.replies}
              </span> */}
              <span>{dayjs(story.createDate).fromNow()}</span>
            </div>
          </div>
        </div>

        <div className="min-h-[40px] w-full break-words text-base leading-relaxed whitespace-pre-wrap">
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
      </div>
    </Modal>
  );
};

export default PassConfirmationModal;
