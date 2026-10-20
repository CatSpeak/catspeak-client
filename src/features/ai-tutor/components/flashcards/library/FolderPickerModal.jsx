import React, { useState } from "react"
import { Check, FolderPlus, Lock } from "lucide-react"
import FlashcardModal from "../../flashcard/FlashcardModal"
import { useCreateFlashcardFolderMutation, useGetFlashcardFoldersQuery } from "../../../api/flashcardApi"

/**
 * Chọn thư mục cho một thẻ (thẻ nằm được trong nhiều thư mục). Thư mục chỉ đọc (vượt
 * giới hạn gói Free sau khi hạ gói) hiện khoá, không đổi được. Tạo thư mục mới ngay
 * trong hộp thoại; hết hạn mức thì báo E-FC-007.
 */
const FolderPickerModal = ({ isOpen, word, initialIds = [], onClose, onSave, onLimit, saving = false }) => {
  const { data } = useGetFlashcardFoldersQuery(undefined, { skip: !isOpen })
  const [createFolder, { isLoading: creating }] = useCreateFlashcardFolderMutation()
  const [selected, setSelected] = useState(() => new Set(initialIds))
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const folders = data?.items || []

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const create = async (e) => {
    e.preventDefault()
    setError("")
    if (!name.trim()) return
    if (data && !data.can_create) {
      onLimit?.(data.max_folders)
      return
    }
    try {
      const folder = await createFolder(name.trim()).unwrap()
      setName("")
      setSelected((prev) => new Set(prev).add(folder.id))
    } catch (err) {
      if (err?.code === "FLASHCARD_FOLDER_LIMIT") onLimit?.(err?.details?.max_folders || 3)
      else setError(err?.message || "Chưa tạo được thư mục.")
    }
  }

  return (
    <FlashcardModal
      isOpen={isOpen}
      onClose={onClose}
      title={word ? `Thêm "${word}" vào thư mục` : "Chọn thư mục"}
      labelledBy="flashcard-folder-picker-title"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave?.([...selected])}
            className="h-11 rounded-full bg-[#990011] px-6 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            Lưu
          </button>
        </>
      }
    >
      {folders.length === 0 ? (
        <p className="text-slate-500">Bạn chưa có thư mục nào. Tạo thư mục đầu tiên bên dưới.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {folders.map((f) => {
            const checked = selected.has(f.id)
            return (
              <li key={f.id}>
                <label
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    f.read_only ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400" : "cursor-pointer border-slate-200 hover:border-rose-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#990011]"
                    checked={checked}
                    disabled={f.read_only}
                    onChange={() => toggle(f.id)}
                  />
                  <span className="flex-1 font-medium text-slate-800">{f.name}</span>
                  {f.read_only ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Lock className="h-3.5 w-3.5" /> Chỉ đọc
                    </span>
                  ) : (
                    checked && <Check className="h-4 w-4 text-[#990011]" />
                  )}
                </label>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={create} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Tên thư mục mới"
          aria-label="Tên thư mục mới"
          className="h-10 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-[#990011]"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-bold text-[#680411] disabled:opacity-50"
        >
          <FolderPlus className="h-4 w-4" />
          Tạo
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </FlashcardModal>
  )
}

export default FolderPickerModal
