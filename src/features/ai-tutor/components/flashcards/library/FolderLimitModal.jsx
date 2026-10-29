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
          className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Dùng thư mục có sẵn
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#990011] px-6 text-sm font-semibold text-white hover:brightness-95"
        >
          <Crown className="h-4 w-4" />
          Nâng cấp Premium
        </button>
      </>
    }
  >
    <p>
      Bạn đã dùng hết {maxFolders} thư mục của gói Free. Hãy thêm thẻ vào thư mục có sẵn, hoặc nâng cấp Premium để tạo
      thư mục không giới hạn.
    </p>
  </FlashcardModal>
)

export default FolderLimitModal
