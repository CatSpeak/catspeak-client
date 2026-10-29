import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookOpen, Check, Loader2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "@/components/ui/toast"
import {
  useAddFlashcardCardMutation,
  useGetFlashcardFoldersQuery,
  useLazyLookupFlashcardWordQuery,
} from "../api/flashcardApi"
import FolderLimitModal from "../components/flashcards/library/FolderLimitModal"
import { notebookPaths } from "../utils/flashcardReview"

const HAN = /[㐀-䶿一-鿿豈-﫿]/

/**
 * fc09 Thêm từ thủ công (FR-FC-017 cách b). Gõ chữ Hán: tra bảng HSK để điền sẵn pinyin,
 * cấp HSK, nghĩa gợi ý; từ không có trong từ điển thì học viên tự nhập nghĩa (OQ-FC-20).
 * Thẻ mới vào Hộp 1, đến hạn ngày mai như thẻ tự động.
 */
const AddFlashcardPage = () => {
  const navigate = useNavigate()
  const { lang: paramLang } = useParams()
  const { language } = useLanguage()
  const lang = paramLang || language || "vi"
  const paths = notebookPaths(lang)

  const [word, setWord] = useState("")
  const [pinyin, setPinyin] = useState("")
  const [meaning, setMeaning] = useState("")
  const [folderIds, setFolderIds] = useState(() => new Set())
  const [error, setError] = useState("")
  const [limit, setLimit] = useState(null)
  const [lookup, { data: info, isFetching: looking, reset }] = useLazyLookupFlashcardWordQuery()
  const [addCard, { isLoading: saving }] = useAddFlashcardCardMutation()
  const { data: folders } = useGetFlashcardFoldersQuery()

  const clean = word.replace(/\s+/g, "")
  const validWord = clean.length > 0 && clean.length <= 12 && HAN.test(clean)

  useEffect(() => {
    if (!validWord) return undefined
    const t = setTimeout(() => {
      lookup(clean)
        .unwrap()
        .then((res) => {
          setPinyin((p) => p || res.pinyin || "")
          setMeaning((m) => m || res.meaning_vi || "")
        })
        .catch(() => {})
    }, 350)
    return () => clearTimeout(t)
  }, [clean, validWord, lookup])

  const resetForm = () => {
    setWord("")
    setPinyin("")
    setMeaning("")
    setError("")
    reset?.()
  }

  const submit = async (e, { stay = false } = {}) => {
    e?.preventDefault()
    setError("")
    if (!validWord) {
      setError("Nhập từ bằng chữ Hán (tối đa 12 ký tự).")
      return
    }
    if (!meaning.trim()) {
      setError("Nhập nghĩa tiếng Việt cho từ này nhé.")
      return
    }
    try {
      const res = await addCard({
        word: clean,
        pinyin: pinyin.trim() || null,
        meaning_vi: meaning.trim(),
        folder_ids: [...folderIds],
      }).unwrap()
      toast.success(res.restored ? "Đã khôi phục thẻ" : "Đã thêm vào sổ", {
        description: `${clean} sẽ đến hạn ôn từ ngày mai.`,
      })
      if (stay) resetForm()
      else navigate(paths.home)
    } catch (err) {
      if (err?.code === "FLASHCARD_CARD_EXISTS") setError("Từ này đã có trong sổ của bạn.")
      else if (err?.code === "FLASHCARD_FOLDER_LIMIT") setLimit(3)
      else setError(err?.message || "Chưa thêm được từ, bạn thử lại nhé.")
    }
  }

  const toggleFolder = (id) =>
    setFolderIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#680411]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>
      <h1 className="text-2xl font-black text-slate-900">Thêm từ thủ công</h1>

      <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-slate-700">Từ (chữ Hán) *</span>
          <div className="relative">
            <input
              value={word}
              lang="zh"
              autoFocus
              maxLength={24}
              onChange={(e) => {
                setWord(e.target.value)
                setPinyin("")
                setMeaning("")
              }}
              placeholder="Ví dụ: 学习"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 text-xl outline-none focus:border-[#990011]"
            />
            {looking && <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" />}
          </div>
        </label>

        {validWord && info && info.word === clean && (
          <div className="flex flex-wrap items-center gap-2 text-sm" data-testid="lookup-result">
            {info.in_dictionary ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                <BookOpen className="h-4 w-4" /> HSK {info.hsk_level}
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600">Ngoài HSK - tự nhập nghĩa</span>
            )}
            {info.definition_en && <span className="text-slate-500">({info.definition_en})</span>}
            {info.in_notebook && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700">
                <Check className="h-4 w-4" /> Đã có trong sổ
              </span>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-slate-700">Pinyin</span>
          <input
            value={pinyin}
            maxLength={80}
            onChange={(e) => setPinyin(e.target.value)}
            placeholder="Tự điền khi tra được, có thể sửa"
            className="h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#990011]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-slate-700">Nghĩa tiếng Việt *</span>
          <input
            value={meaning}
            maxLength={200}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="Ví dụ: học, học tập"
            className="h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#990011]"
          />
        </label>

        {folders?.items?.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-bold text-slate-700">Thêm vào thư mục (tuỳ chọn)</legend>
            <div className="flex flex-wrap gap-2">
              {folders.items.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  disabled={f.read_only}
                  aria-pressed={folderIds.has(f.id)}
                  onClick={() => toggleFolder(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${
                    folderIds.has(f.id) ? "bg-[#680411] text-white" : "bg-slate-100 text-slate-600"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={(e) => submit(e, { stay: true })}
            className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Lưu và thêm từ khác
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-full bg-[#990011] px-6 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Thêm vào sổ"}
          </button>
        </div>
      </form>

      <FolderLimitModal isOpen={limit != null} maxFolders={limit || 3} onClose={() => setLimit(null)} onUpgrade={() => navigate("/pricing")} />
    </div>
  )
}

export default AddFlashcardPage
