import React from "react";
import Modal from "@/shared/components/ui/Modal";

const ExitConfirmModal = ({ showExitConfirm, setShowExitConfirm, t, exitGame }) => {
  return (
    <Modal
      open={showExitConfirm}
      onClose={() => setShowExitConfirm(false)}
      title={t.rooms?.game?.crackIt?.exitConfirmTitle || "Xác nhận thoát"}
      className="bg-white text-slate-900 max-w-sm rounded-3xl overflow-hidden border border-gray-200 shadow-2xl"
      headerClassName="flex items-center justify-between p-4 pl-6 border-b border-gray-100"
      fullScreenOnMobile={false}
    >
      <div className="py-6 px-6 text-center text-slate-600">
        <p>{t.rooms?.game?.crackIt?.exitConfirmDesc1 || "Bạn có chắc chắn muốn thoát khỏi trò chơi này không?"}</p>
        <p className="text-cath-red-600 font-semibold mt-2">{t.rooms?.game?.crackIt?.exitConfirmDesc2 || "Bạn sẽ không thể tham gia lại ván chơi này nữa!"}</p>
      </div>
      <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
        <button 
          onClick={() => setShowExitConfirm(false)}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-slate-700 transition-all"
        >
          {t.rooms?.game?.crackIt?.cancel || "Hủy"}
        </button>
        <button 
          onClick={() => {
            setShowExitConfirm(false);
            exitGame();
          }}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-cath-red-500 hover:bg-cath-red-600 text-white shadow-lg shadow-cath-red-500/25 transition-all"
        >
          {t.rooms?.game?.crackIt?.confirmExit || "Đồng ý thoát"}
        </button>
      </div>
    </Modal>
  );
};

export default ExitConfirmModal;
