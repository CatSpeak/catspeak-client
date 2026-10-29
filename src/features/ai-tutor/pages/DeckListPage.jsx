import React, { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, ChevronRight, Folder, FolderPlus, Lock, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "@/components/ui/toast"
import {
  isNetworkError,
  useCreateFlashcardFolderMutation,
  useDeleteFlashcardFolderMutation,
  useGetDeckCardsQuery,
  useGetFlashcardDecksQuery,
  useGetFlashcardFoldersQuery,
  useRenameFlashcardFolderMutation,
} from "../api/flashcardApi"
import { SystemDecksSection } from "../components/flashcards"
import { FlashcardLoadError } from "../components/flashcards/FlashcardPageState"
import FlashcardCardList from "../components/flashcards/library/FlashcardCardList"
import FolderLimitModal from "../components/flashcards/library/FolderLimitModal"
import useCardActions from "../components/flashcards/library/useCardActions"
import FlashcardModal from "../components/flashcard/FlashcardModal"
import { useReportQueryNetwork } from "../hooks/useOnlineStatus"
import { notebookPaths } from "../utils/flashcardReview"

/** Kết quả tìm từ trên toàn sổ (ô "Tìm từ vựng..." ở header, CHK-125). */
const SearchResults = ({ term, onClear }) => {
  const { data = { items: [], total: 0 }, isLoading } = useGetDeckCardsQuery({ deckId: "all", search: term, limit: 50 })
  const { handlers, ui } = useCardActions()
  return (
    <section className="space-y-3" aria-label="Kết quả tìm từ">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">
          Kết quả cho "{term}" <span className="text-sm font-semibold text-slate-500">({data.total})</span>
        </h2>
        <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-700">
          <X className="h-4 w-4" /> Xoá tìm kiếm
        </button>
      </div>
      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
          Không tìm thấy từ nào trong sổ. Bạn có thể thêm từ này thủ công.
        </div>
      ) : (
        <FlashcardCardList items={data.items} {...handlers} />
      )}
      {ui}
    </section>
  )
}

/**
 * fc04 Danh mục deck (FR-FC-015): deck hệ thống HSK 1-6, Ngoài HSK, Từ sai gần đây,
 * deck chủ đề buổi nói, và thư mục tự tạo (FR-FC-017, Free tối đa 3 - E-FC-007).
 */
const DeckListPage = () => {
  const navigate = useNavigate()
  const { lang: paramLang } = useParams()
  const { language } = useLanguage()
  const lang = paramLang || language || "vi"
  const paths = notebookPaths(lang)
  const [params, setParams] = useSearchParams()
  const term = (params.get("search") || "").trim()

  const decksQuery = useGetFlashcardDecksQuery()
  const { data: decks = [], isLoading, isError, error, refetch } = decksQuery
  const { data: folders } = useGetFlashcardFoldersQuery()
  useReportQueryNetwork(decksQuery)
  const [createFolder, { isLoading: creating }] = useCreateFlashcardFolderMutation()
  const [renameFolder] = useRenameFlashcardFolderMutation()
  const [deleteFolder] = useDeleteFlashcardFolderMutation()

  const [editor, setEditor] = useState(null) // { mode: "create" | "rename", folder?, name }
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [limit, setLimit] = useState(null)
  const [formError, setFormError] = useState("")

  const openCreate = () => {
    if (folders && !folders.can_create) {
      setLimit(folders.max_folders || 3)
      return
    }
    setFormError("")
    setEditor({ mode: "create", name: "" })
  }

  const submitEditor = async (e) => {
    e.preventDefault()
    const name = editor.name.trim()
    if (!name) {
      setFormError("Nhập tên thư mục.")
      return
    }
    try {
      if (editor.mode === "create") await createFolder(name).unwrap()
      else await renameFolder({ folderId: editor.folder.id, name }).unwrap()
      toast.success(editor.mode === "create" ? "Đã tạo thư mục" : "Đã đổi tên thư mục")
      setEditor(null)
    } catch (err) {
      if (err?.code === "FLASHCARD_FOLDER_LIMIT") {
        setEditor(null)
        setLimit(err?.details?.max_folders || 3)
      } else setFormError(err?.message || "Chưa lưu được thư mục.")
    }
  }

  const doDelete = async () => {
    const folder = confirmDelete
    setConfirmDelete(null)
    try {
      await deleteFolder(folder.id).unwrap()
      toast.success("Đã xoá thư mục", { description: "Các thẻ vẫn còn trong sổ." })
    } catch (err) {
      toast.error("Chưa xoá được thư mục", { description: err?.message })
    }
  }

  const submitSearch = (e) => {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get("q") || "").trim()
    setParams(q ? { search: q } : {})
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
      <button
        type="button"
        onClick={() => navigate(paths.home)}
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#680411]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại Sổ tay từ vựng
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">Danh mục bộ thẻ</h1>
        <button
          type="button"
          onClick={() => navigate(paths.add)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-[#680411] hover:bg-rose-50"
        >
          <Plus className="h-4 w-4" /> Thêm thủ công
        </button>
      </div>

      <form onSubmit={submitSearch} className="relative" role="search">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          key={term}
          name="q"
          defaultValue={term}
          placeholder="Tìm từ vựng... (chữ Hán, pinyin hoặc nghĩa)"
          aria-label="Tìm từ vựng"
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#990011]"
        />
      </form>

      {term && (
        <SearchResults
          term={term}
          onClear={() => setParams({})}
        />
      )}

      <section className="space-y-3" aria-label="Thư mục của bạn">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-slate-900">
            Thư mục của bạn
            {folders?.max_folders != null && (
              <span className="ml-2 text-sm font-semibold text-slate-500">
                ({folders.items.length}/{folders.max_folders} - gói Free)
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={openCreate}
            disabled={creating}
            data-testid="create-folder"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#680411] px-4 py-2 text-sm font-bold text-white hover:brightness-95"
          >
            <FolderPlus className="h-4 w-4" /> Tạo thư mục
          </button>
        </div>
        {!folders?.items?.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Chưa có thư mục nào. Tạo thư mục để gom các từ theo cách của bạn.
          </div>
        ) : (
          <div className="space-y-2">
            {folders.items.map((f) => (
              <div
                key={f.id}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-3.5 shadow-xs hover:border-rose-100"
              >
                <button
                  type="button"
                  onClick={() => navigate(paths.deck(f.deck_id))}
                  className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50/80 text-rose-800">
                    {f.read_only ? <Lock className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                  </div>
                  <span className="truncate font-bold text-slate-900 group-hover:text-[#680411]">{f.name}</span>
                  {f.read_only && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Chỉ đọc</span>
                  )}
                </button>
                <span className="shrink-0 text-sm font-semibold text-slate-500">{f.card_count} thẻ</span>
                {!f.read_only && (
                  <button
                    type="button"
                    aria-label={`Đổi tên thư mục ${f.name}`}
                    onClick={() => {
                      setFormError("")
                      setEditor({ mode: "rename", folder: f, name: f.name })
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Xoá thư mục ${f.name}`}
                  onClick={() => setConfirmDelete(f)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
              </div>
            ))}
          </div>
        )}
      </section>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : isError && !decksQuery.data ? (
        <FlashcardLoadError offline={isNetworkError(error)} onRetry={refetch} what="danh mục bộ thẻ" />
      ) : (
        <SystemDecksSection decks={decks} onSelectDeck={(id) => navigate(paths.deck(id))} />
      )}

      <FlashcardModal
        isOpen={Boolean(editor)}
        onClose={() => setEditor(null)}
        title={editor?.mode === "rename" ? "Đổi tên thư mục" : "Tạo thư mục mới"}
        labelledBy="flashcard-folder-editor-title"
      >
        {editor && (
          <form onSubmit={submitEditor} className="flex flex-col gap-3">
            <input
              autoFocus
              value={editor.name}
              maxLength={60}
              onChange={(e) => setEditor({ ...editor, name: e.target.value })}
              placeholder="Ví dụ: Từ đi du lịch"
              aria-label="Tên thư mục"
              className="h-11 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-[#990011]"
            />
            {formError && <p className="text-sm text-rose-700">{formError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditor(null)} className="h-10 rounded-full border border-slate-300 px-5 text-sm font-semibold">
                Huỷ
              </button>
              <button type="submit" className="h-10 rounded-full bg-[#990011] px-5 text-sm font-semibold text-white">
                Lưu
              </button>
            </div>
          </form>
        )}
      </FlashcardModal>

      <FlashcardModal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={`Xoá thư mục "${confirmDelete?.name || ""}"?`}
        labelledBy="flashcard-folder-delete-title"
        footer={
          <>
            <button type="button" onClick={() => setConfirmDelete(null)} className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold">
              Huỷ
            </button>
            <button type="button" onClick={doDelete} className="h-11 rounded-full bg-rose-700 px-6 text-sm font-semibold text-white">
              Xoá thư mục
            </button>
          </>
        }
      >
        Chỉ xoá thư mục. Các thẻ bên trong vẫn còn trong sổ và trong các bộ thẻ hệ thống.
      </FlashcardModal>

      <FolderLimitModal
        isOpen={limit != null}
        maxFolders={limit || 3}
        onClose={() => setLimit(null)}
        onUpgrade={() => navigate("/pricing")}
      />
    </div>
  )
}

export default DeckListPage
