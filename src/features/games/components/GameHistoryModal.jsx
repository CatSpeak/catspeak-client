import React, { useState } from "react";
import Modal from "@/shared/components/ui/Modal";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetGameHistoryQuery } from "@/store/api/roomsApi";
import { Loader2, Trophy } from "lucide-react";
import HistoryMatchItem from "./HistoryMatchItem";

const GameHistoryModal = ({ open, onClose, roomName }) => {
  const { t } = useLanguage();
  const { data: historyData = [], isLoading: loading } = useGetGameHistoryQuery(
    roomName,
    {
      skip: !open || !roomName,
      refetchOnMountOrArgChange: true,
    },
  );
  const [expandedMatch, setExpandedMatch] = useState(null);

  const toggleMatch = (matchId) => {
    setExpandedMatch((prev) => (prev === matchId ? null : matchId));
  };



  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.game?.crackIt?.historyTitle || "Lịch sử thi đấu"}
      className="bg-white text-slate-900 max-w-[625px] w-[100vw] md:rounded-3xl overflow-hidden md:border border-gray-200 md:shadow-2xl max-h-[100vh] md:max-h-[85vh] flex flex-col"
      headerClassName="flex items-center justify-between p-4 pl-6 border-b border-gray-100 shrink-0"
      fullScreenOnMobile={true}
    >
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white min-h-[300px]">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-cath-red-500" />
          </div>
        ) : historyData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center min-h-[200px] text-slate-400">
            <Trophy className="w-12 h-12 mb-4 opacity-20" />
            <p>
              {t.rooms?.game?.crackIt?.noHistoryFound ||
                "Chưa có dữ liệu lịch sử cho phòng này."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyData.map((match) => (
              <HistoryMatchItem
                key={match.id}
                match={match}
                isExpanded={expandedMatch === match.id}
                onToggle={toggleMatch}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold bg-cath-red-500 hover:bg-cath-red-600 text-white transition-all shadow-sm shadow-cath-red-500/30"
        >
          {t.rooms?.game?.crackIt?.close || "Đóng"}
        </button>
      </div>
    </Modal>
  );
};

export default GameHistoryModal;
