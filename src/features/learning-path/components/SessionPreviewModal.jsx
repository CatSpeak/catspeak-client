import React from "react"
import dayjs from "dayjs"
import {
  Sparkles,
  AlertCircle,
  Play,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useGetSessionPreviewQuery } from "../api/learningPathApi"
import { parseTopic, getCategoryBadgeInfo } from "../utils/learningPathUtils"

const parseVocab = (vocabStr = "") => {
  if (!vocabStr) return { hanzi: "", pinyin: "", meaning: "" }
  // Match "Hanzi (pinyin): meaning" or "Hanzi - pinyin - meaning"
  const match = vocabStr.match(/^([^\(\-:]+)(?:\(([^\)]+)\))?\s*[-:]?\s*(.*)$/)
  if (match) {
    return {
      hanzi: (match[1] || "").trim(),
      pinyin: (match[2] || "").trim(),
      meaning: (match[3] || "").trim(),
    }
  }
  return { hanzi: vocabStr, pinyin: "", meaning: "" }
}

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
  const isCompleted = data?.status === "Completed"
  const isQuotaLocked = Boolean(data?.quota && !data?.quota.isAllowed)

  const quota = data?.quota
  const isFree = quota ? !quota.isPremium : true
  const usedToday = quota?.usedToday ?? 0
  const dailyLimit = quota?.dailyLimit ?? 2

  const catBadge = getCategoryBadgeInfo(data?.category)

  const handleLaunch = () => {
    if (cardId && onLaunchSession) {
      onLaunchSession(cardId)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      fullScreenOnMobile={false}
      className="md:max-w-xl bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-6 flex flex-col gap-5">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="animate-pulse flex flex-col gap-4 py-8">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md" />
            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl mt-4" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              Không thể tải thông tin xem trước buổi học.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && data && (
          <>
            {/* Top Badge & Day Info */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Buổi {data.dayIndex}
                </span>
                {data.scheduledDate && (
                  <span className="text-xs text-gray-400">
                    • {dayjs(data.scheduledDate).format("DD/MM/YYYY")}
                  </span>
                )}
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catBadge.bgColor} ${catBadge.textColor} ${catBadge.borderColor}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${catBadge.dotColor}`}
                />
                {catBadge.label}
              </span>
            </div>

            {/* Topic Header: Hanzi, Pinyin, Meaning */}
            <div className="bg-gradient-to-br from-cath-red-50/50 via-white to-orange-50/30 dark:from-gray-800 dark:to-gray-800/80 p-5 rounded-2xl border border-cath-red-100/60 dark:border-gray-700">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-900 dark:text-white leading-tight">
                {hanzi}
              </h2>
              {pinyin && (
                <p className="text-sm font-semibold text-cath-red-600 dark:text-cath-red-400 mt-1">
                  {pinyin}
                </p>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">
                {vietnamese}
              </p>

              {data.topicDescription && data.topicDescription !== vietnamese && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 leading-relaxed">
                  {data.topicDescription}
                </p>
              )}
            </div>

            {/* Early Study / Catch-up Notice Banners */}
            {isEarlyStudy && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Học sớm:</strong> Buổi này chưa đến lịch, nhưng bạn có
                  thể học sớm nếu muốn để đẩy nhanh tiến độ chu kỳ.
                </p>
              </div>
            )}

            {isCatchUp && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Học bù:</strong> Buổi học này đã lỡ hạn. Bạn có thể học
                  bù hôm nay để giữ trọn vẹn điểm số chu kỳ.
                </p>
              </div>
            )}

            {/* Target Vocabulary */}
            {data.targetVocabulary && data.targetVocabulary.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-3.5 h-3.5 text-cath-red-600" />
                  <span>Từ vựng trọng tâm</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.targetVocabulary.map((vocab, index) => {
                    const item = parseVocab(vocab)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-serif text-gray-900 dark:text-white text-sm">
                            {item.hanzi}
                          </span>
                          {item.pinyin && (
                            <span className="text-[11px] text-cath-red-600 dark:text-cath-red-400">
                              {item.pinyin}
                            </span>
                          )}
                        </div>
                        {item.meaning && (
                          <span className="text-gray-600 dark:text-gray-300 font-medium truncate ml-2">
                            {item.meaning}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Speaking Goals / Focus */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
              <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white">
                  Mục tiêu luyện nói:
                </span>{" "}
                Thực hành giao tiếp tương tác 1-1 với trợ lý AI, nhận phản hồi
                phát âm, sửa lỗi ngữ pháp và tăng phản xạ câu hoàn chỉnh.
              </div>
            </div>

            {/* Quota Notice Banner */}
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700/40">
              {isFree ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    Hôm nay:{" "}
                    <strong className="text-gray-800 dark:text-gray-200">
                      {usedToday}/{dailyLimit} buổi miễn phí
                    </strong>{" "}
                    đã dùng
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Premium: Không giới hạn buổi học</span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Để sau
              </button>

              <button
                type="button"
                disabled={isLaunching || isQuotaLocked}
                onClick={handleLaunch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cath-red-700 via-cath-red-600 to-cath-red-700 hover:brightness-110 shadow-md shadow-cath-red-600/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isQuotaLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Đã hết lượt hôm nay</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {isLaunching
                        ? "Đang vào phòng..."
                        : isCompleted
                          ? "Luyện tập lại"
                          : "Bắt đầu buổi học"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default SessionPreviewModal
