import React from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import { IconLogoOutlined } from "@/shared/assets/icons/logo";

const QueueStatusCard = ({
  statusText,
  isConnected,
  position,
  onCancel,
  roomType = "OneToOne",
}) => {
  const { t } = useLanguage();

  const isGroup = roomType === "Group";
  const subtitle = isGroup
    ? t.rooms?.queue?.findingGroup || "Looking for a study group…"
    : t.rooms.queue.findingMatch;

  return (
    <div className="max-w-[800px] h-auto w-full rounded-3xl overflow-hidden relative bg-[#FFFEFE]">
      {/* Header / Loading State */}
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="relative inline-flex items-center justify-center">
          <Loader2
            className="w-[68px] h-[68px] text-[#FF8B98] opacity-80 animate-spin"
            strokeWidth={2}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={IconLogoOutlined}
              alt="Cat Speak Logo"
              className="h-[30px] w-auto object-contain"
            />
          </div>
        </div>

        <div className="text-center">
          <h6 className="text-xl font-bold mb-1.5 text-black">{statusText}</h6>
          <p className="text-lg font-medium text-[#7B7979]">{subtitle}</p>
        </div>
      </div>

      {/* <div className="h-px w-full bg-[#C6C6C6]" /> */}

      <div className="flex flex-col items-center pb-8">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-[60px] mb-6">
          <div className="p-4 rounded-xl bg-[#F5F5F5] flex flex-col items-center w-[200px] h-auto shadow-faq-card">
            <span className="text-xl font-bold text-black mb-2">
              {t.rooms.queue.status}
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full shadow-sm ${isConnected ? "bg-green-500" : "bg-orange-500 animate-pulse"}`}
              />
              <span className="text-lg font-medium text-black">
                {isConnected
                  ? t.rooms.queue.connected
                  : t.rooms.queue.connectingStatus}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F5] flex flex-col items-center w-[200px] h-auto shadow-faq-card">
            <span className="text-xl font-bold text-black mb-2">
              {t.rooms.queue.position}
            </span>
            <div className="text-[1.25rem] font-bold text-cath-red-700 leading-none">
              {position > 0 ? `#${position}` : "--"}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <PillButton
          onClick={onCancel}
          className="h-[45px] w-[230px] text-[#F5F5F5]"
        >
          {t.rooms.queue.cancelSearch}
        </PillButton>
      </div>
    </div>
  );
};

export default QueueStatusCard;
