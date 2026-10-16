import React from "react"
import dayjs from "dayjs"
import { AlertCircle } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useGetSessionPreviewQuery } from "../api/learningPathApi"
import { parseTopic } from "../utils/learningPathUtils"

const SessionPreviewModal = ({
  cardId,
  isOpen,
  onClose,
  onLaunchSession,
  isLaunching = false,
}) => {
  const { data, isLoading, isError } = useGetSessionPreviewQuery(cardId, {
    skip: !cardId || !isOpen,
  })

  if (!isOpen) return null

  const { hanzi, pinyin, vietnamese } = parseTopic(
    data?.topicTitle,
    data?.topicDescription,
  )

  const isEarlyStudy = Boolean(data?.isEarlyStudy)
  const isCatchUp = Boolean(data?.isCatchUp)
  const formattedDate = data?.scheduledDate
    ? dayjs(data.scheduledDate).format("DD/MM")
    : ""

  const handleLaunch = () => {
    if (cardId && onLaunchSession) {
      onLaunchSession(cardId)
    }
  }

  // Derive goal and sample sentence based on topic title/desc
  const goalText =
    data?.topicDescription || "hỏi đường + hiểu chỉ dẫn"
  const sampleSentence =
    data?.sampleSentence || "你好，请问去图书馆怎么走？"

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      fullScreenOnMobile={false}
      className="md:max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-7 sm:p-8 flex flex-col text-left">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="animate-pulse flex flex-col gap-4 py-8">
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
            <div className="h-8 w-3/4 bg-gray-200 rounded-xl" />
            <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
            <div className="h-24 bg-gray-100 rounded-2xl mt-4" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 font-semibold text-sm">
              Không thể tải thông tin xem trước buổi học.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Content matching Figma screens 02 & 17 100% */}
        {!isLoading && data && (
          <>
            {/* Top Badge: "Học bù" or "Học sớm" or "Hôm nay" */}
            <div className="mb-3">
              {isCatchUp ? (
                <span className="bg-[#FEF6EE] text-[#D97706] text-xs font-bold px-3 py-1 rounded-full inline-block">
                  Học bù
                </span>
              ) : isEarlyStudy ? (
                <span className="bg-[#F0F9FF] text-[#026AA2] text-xs font-bold px-3 py-1 rounded-full inline-block">
                  Học sớm
                </span>
              ) : (
                <span className="bg-[#FFF0F2] text-[#980019] text-xs font-bold px-3 py-1 rounded-full inline-block">
                  Hôm nay
                </span>
              )}
            </div>

            {/* Title: Ngày X · Tên buổi */}
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              Ngày {data.dayIndex} · {vietnamese || data.topicTitle}
            </h2>

            {/* Subtitle: Hanzi · Desc · Level */}
            <p className="text-xs text-gray-500 mt-1 mb-6">
              {hanzi && <span>{hanzi} · </span>}
              <span>{pinyin || data.topicDescription || "luyện đàm thoại"}</span>
              <span> · HSK 3.0</span>
            </p>

            <div className="border-t border-gray-100 my-1" />

            {/* Details List */}
            <div className="flex flex-col gap-2.5 py-4 text-xs sm:text-sm text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20 shrink-0">Thời lượng:</span>
                <span className="text-gray-900">~10 phút</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-gray-500 w-20 shrink-0">Mục tiêu:</span>
                <span className="text-gray-900">{goalText}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-gray-500 w-20 shrink-0">Câu mẫu:</span>
                <span className="text-gray-900 italic">"{sampleSentence}"</span>
              </div>
            </div>

            {/* Callout box */}
            <div className="bg-[#F8F9FA] rounded-2xl p-4 text-xs text-gray-600 mt-2 mb-8 leading-relaxed">
              {isCatchUp ? (
                <span>
                  Học bù: đạt ≥ 50 điểm sẽ ghi nhận hoàn thành buổi Ngày {data.dayIndex}.
                </span>
              ) : isEarlyStudy ? (
                <span>
                  Học sớm: buổi này dự kiến mở {formattedDate || "ngày mai"} — học trước vẫn tính hoàn thành.
                </span>
              ) : (
                <span>
                  Buổi học hôm nay: luyện tập cùng AI Tutor và đạt ≥ 50 điểm để ghi nhận hoàn thành.
                </span>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={isLaunching}
                onClick={handleLaunch}
                className="bg-[#980019] text-white hover:bg-[#800014] rounded-xl py-3 px-6 font-medium text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isLaunching ? "Đang kết nối..." : "Bắt đầu buổi học →"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium px-2 py-3 transition-colors cursor-pointer"
              >
                Quay lại lộ trình
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default SessionPreviewModal
