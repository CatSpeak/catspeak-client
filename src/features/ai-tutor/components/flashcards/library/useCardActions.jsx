import React, { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/components/ui/toast"
import {
  useDeleteFlashcardCardMutation,
  useRestoreFlashcardCardMutation,
  useSetFlashcardCardFoldersMutation,
  useSetFlashcardKnownMutation,
} from "../../../api/flashcardApi"
import FolderLimitModal from "./FolderLimitModal"
import FolderPickerModal from "./FolderPickerModal"
import UndoBar from "./UndoBar"

/**
 * Thao tác quản lý thẻ dùng chung (fc11): Đã biết rồi, xoá có Hoàn tác, thêm vào thư mục.
 * Trả về `handlers` cho FlashcardCardList và `ui` (hộp thoại, thanh hoàn tác) để render.
 */
const useCardActions = () => {
  const navigate = useNavigate()
  const [setKnown] = useSetFlashcardKnownMutation()
  const [deleteCard] = useDeleteFlashcardCardMutation()
  const [restoreCard] = useRestoreFlashcardCardMutation()
  const [setFolders, { isLoading: savingFolders }] = useSetFlashcardCardFoldersMutation()
  const [undo, setUndo] = useState(null) // { card }
  const [picker, setPicker] = useState(null) // card
  const [limit, setLimit] = useState(null) // max folders

  const onKnown = useCallback(
    async (card) => {
      try {
        await setKnown({ cardId: card.card_id, known: !card.is_known }).unwrap()
        toast.success(card.is_known ? "Đã bỏ đánh dấu Đã biết" : "Đã đánh dấu Đã biết", {
          description: card.is_known ? "Thẻ quay lại lịch ôn." : "Thẻ sẽ không xuất hiện trong phiên ôn nữa.",
        })
      } catch (err) {
        toast.error("Chưa cập nhật được thẻ", { description: err?.message })
      }
    },
    [setKnown],
  )

  const onDelete = useCallback(
    async (card) => {
      try {
        await deleteCard(card.card_id).unwrap()
        setUndo({ card })
      } catch (err) {
        toast.error("Chưa xoá được thẻ", { description: err?.message })
      }
    },
    [deleteCard],
  )

  const doUndo = useCallback(async () => {
    const card = undo?.card
    setUndo(null)
    if (!card) return
    try {
      await restoreCard(card.card_id).unwrap()
      toast.success("Đã khôi phục thẻ")
    } catch (err) {
      toast.error("Không hoàn tác được", { description: err?.message })
    }
  }, [undo, restoreCard])

  const saveFolders = useCallback(
    async (folderIds) => {
      const card = picker
      if (!card) return
      try {
        await setFolders({ cardId: card.card_id, folderIds }).unwrap()
        setPicker(null)
        toast.success("Đã cập nhật thư mục")
      } catch (err) {
        toast.error("Chưa lưu được thư mục", { description: err?.message })
      }
    },
    [picker, setFolders],
  )

  const ui = (
    <>
      {picker && (
        <FolderPickerModal
          key={picker.card_id}
          isOpen
          word={picker.word}
          initialIds={picker.folder_ids || []}
          saving={savingFolders}
          onClose={() => setPicker(null)}
          onSave={saveFolders}
          onLimit={(max) => setLimit(max || 3)}
        />
      )}
      <FolderLimitModal
        isOpen={limit != null}
        maxFolders={limit || 3}
        onClose={() => setLimit(null)}
        onUpgrade={() => navigate("/pricing")}
      />
      <UndoBar
        message={undo ? `Đã xoá thẻ "${undo.card.word}"` : null}
        onUndo={doUndo}
        onClose={() => setUndo(null)}
      />
    </>
  )

  return {
    handlers: { onKnown, onDelete, onFolders: (card) => setPicker(card) },
    ui,
    showLimit: (max) => setLimit(max || 3),
  }
}

export default useCardActions
