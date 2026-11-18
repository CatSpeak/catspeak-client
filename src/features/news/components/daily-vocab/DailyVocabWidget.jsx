import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { Sparkles, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/toast"
import {
  useGetDailyVocabularyQuery,
  useMarkVocabKnownMutation,
  useSaveDailyVocabMutation,
  useSubmitVocabReviewMutation,
} from "@/store/api/dailyVocabApi"
import DailyVocabCard from "./DailyVocabCard"
import LoginRequiredModal from "./LoginRequiredModal"

const DailyVocabWidget = ({ lang = "en" }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useSelector((state) => state.auth || {})
  const isAuthenticated = Boolean(token)

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useGetDailyVocabularyQuery(lang, {
    refetchOnMountOrArgChange: true,
  })

  const [markKnown] = useMarkVocabKnownMutation()
  const [saveVocab, { isLoading: isSaving }] = useSaveDailyVocabMutation()
  const [submitReview, { isLoading: isReviewing }] = useSubmitVocabReviewMutation()

  // Thao tác Lưu từ vựng
  const handleSave = async () => {
    if (!isAuthenticated) {
      // BR-VOCAB-08: Chưa đăng nhập -> hiện popup
      setIsLoginModalOpen(true)
      return
    }

    if (!data?.vocabulary?.id) return

    try {
      const res = await saveVocab(data.vocabulary.id).unwrap()
      // BR-VOCAB-10, BR-VOCAB-12: Toast thành công 3s
      toast.success(res.message || "Lưu từ thành công")
    } catch {
      // BR-VOCAB-11: Toast thất bại
      toast.error("Không thể lưu từ vựng. Vui lòng thử lại")
    }
  }

  // Thao tác Đã biết
  const handleKnown = async () => {
    if (!data?.vocabulary?.id) return
    try {
      await markKnown({ bankId: data.vocabulary.id, lang }).unwrap()
    } catch {
      // ignore
    }
  }

  // Thao tác Ôn tập
  const handleReview = async (action) => {
    if (!data?.vocabulary?.id) return
    try {
      await submitReview({
        vocabularyId: data.vocabulary.id,
        action,
      }).unwrap()
    } catch {
      toast.error("Không thể cập nhật tiến độ ôn tập")
    }
  }

  // Chuyển sang trang đăng nhập và lưu returnUrl để quay lại bản tin (BR-VOCAB-08)
  const handleGoToLogin = () => {
    setIsLoginModalOpen(false)
    navigate(`/auth/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`)
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-cardBg rounded-2xl border border-border p-5 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-hoverBg rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 dark:bg-hoverBg rounded w-2/3"></div>
        <div className="h-16 bg-gray-100 dark:bg-hoverBg/50 rounded"></div>
        <div className="h-8 bg-gray-200 dark:bg-hoverBg rounded"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-cardBg rounded-2xl border border-border p-5 text-center space-y-3 text-xs text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
        <p>Lỗi tải từ vựng hàng ngày</p>
        <button
          onClick={() => refetch()}
          className="text-cath-red-600 font-medium underline"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // BR-VOCAB-03: Nếu không có từ hợp lệ
  if (data?.mode === "empty") {
    return (
      <div className="bg-white dark:bg-cardBg rounded-2xl border border-border p-6 text-center space-y-2">
        <Sparkles className="w-8 h-8 mx-auto text-gray-400" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {data.message || "Hôm nay không có từ vựng nào!"}
        </p>
      </div>
    )
  }

  return (
    <>
      <DailyVocabCard
        data={data}
        onSave={handleSave}
        onKnown={handleKnown}
        onReview={handleReview}
        isSaving={isSaving}
        isReviewing={isReviewing}
      />

      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleGoToLogin}
      />
    </>
  )
}

export default DailyVocabWidget
