import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGame } from "@/features/games/context/GameContext"

const ExitConfirmModal = ({ showExitConfirm, setShowExitConfirm }) => {
  const { t } = useLanguage()
  const { exitGame, gameType, effectiveIsSpectator } = useGame()

  const isPictureIt = gameType === 'picture_it' || gameType === 'picture-it'
  const tm = isPictureIt ? (t.rooms?.game?.pictureIt?.modals || {}) : (t.rooms?.game?.crackIt || {})

  return (
    <Modal
      open={showExitConfirm}
      onClose={() => setShowExitConfirm(false)}
      title={tm.exitConfirmTitle || "Xác nhận thoát"}
      className="bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white max-w-sm rounded-3xl overflow-hidden border border-border dark:border-[#3F3F3F] shadow-2xl"
      headerClassName="flex items-center justify-between p-4 pl-6 border-b border-border dark:border-[#3F3F3F]"
      fullScreenOnMobile={false}
    >
      <div className="py-6 px-6 text-center text-slate-600 dark:text-neutral-300">
        {!effectiveIsSpectator ? (
          <>
            <p>{tm.exitConfirmDesc1 || "Bạn có chắc chắn muốn rời khỏi trận đấu không?"}</p>
            <p className="text-cath-red-600 dark:text-red-400 font-semibold mt-2">
              {tm.exitConfirmDescSpectator || "Bạn sẽ chuyển sang chế độ Quan sát (theo dõi trận đấu)."}
            </p>
          </>
        ) : (
          <>
            <p>Bạn có chắc chắn muốn đóng màn hình theo dõi trò chơi không?</p>
            <p className="text-slate-500 dark:text-neutral-400 font-medium text-xs mt-2">
              Bạn có thể mở lại bất cứ lúc nào khi trận đấu chưa kết thúc.
            </p>
          </>
        )}
      </div>
      <div className="flex gap-3 p-4 border-t border-border dark:border-[#3F3F3F] bg-gray-50 dark:bg-[#202020]">
        <button
          onClick={() => setShowExitConfirm(false)}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 dark:bg-[#2D2D2D] dark:hover:bg-[#383838] text-slate-700 dark:text-neutral-200 transition-all cursor-pointer"
        >
          {tm.cancel || "Hủy"}
        </button>
        <button
          onClick={() => {
            setShowExitConfirm(false)
            exitGame()
          }}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-cath-red-500 hover:bg-cath-red-600 text-white shadow-lg shadow-cath-red-500/25 transition-all cursor-pointer"
        >
          {tm.confirmExit || "Đồng ý"}
        </button>
      </div>
    </Modal>
  )
}

export default ExitConfirmModal
