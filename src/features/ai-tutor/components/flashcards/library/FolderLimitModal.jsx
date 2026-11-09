import React from "react"
import { Crown } from "lucide-react"
import FlashcardModal from "../../flashcard/FlashcardModal"

/** E-FC-007: Free đã có đủ 3 thư mục tự tạo. */
const FolderLimitModal = ({ isOpen, maxFolders = 3, onClose, onUpgrade }) => (
  <FlashcardModal
    isOpen={isOpen}
    onClose={onClose}
    title={`Gói Free tạo tối đa ${maxFolders} thư mục`}
    labelledBy="flashcard-folder-limit-title"
    footer={
      <>
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-full border border-slate-300 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] px-6 text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#333333] transition-colors"
        >
          Dùng thư mục có sẵn
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#990011] px-6 text-sm font-semibold text-white hover:brightness-95 transition-all"
        >
          <Crown className="h-4 w-4" />
          Nâng cấp Premium
        </button>
      </>
    }
  >
    <p className="text-gray-700 dark:text-neutral-300 leading-relaxed">
      Bạn đã dùng hết {maxFolders} thư mục của gói Free. Hãy thêm thẻ vào thư mục có sẵn, hoặc nâng cấp Premium để tạo
      thư mục không giới hạn.
    </p>
  </FlashcardModal>
)

export default FolderLimitModal
