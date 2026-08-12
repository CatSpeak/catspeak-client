import React, { useState, useMemo } from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetGameHistoryQuery } from "@/store/api/roomsApi"
import {
  Loader2,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import HistoryMatchItem from "./HistoryMatchItem"

const PAGE_SIZE = 4

// Format Date -> "YYYY-MM-DD" cho query param BE
const toDateParam = (date) => {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// Tính default: startDate = hôm nay - 3 ngày, endDate = hôm nay
const getDefaultDateRange = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  return { startDate: threeDaysAgo, endDate: today }
}

const GameHistoryModal = ({ open, onClose, roomName }) => {
  const { t } = useLanguage()
  const [page, setPage] = useState(1)
  const defaults = useMemo(() => getDefaultDateRange(), [])
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate, setEndDate] = useState(defaults.endDate)
  const [expandedMatch, setExpandedMatch] = useState(null)

  const queryArgs = useMemo(
    () => ({
      roomId: roomName,
      page,
      pageSize: PAGE_SIZE,
      startDate: toDateParam(startDate),
      endDate: toDateParam(endDate),
    }),
    [roomName, page, startDate, endDate],
  )

  const {
    data: historyResponse,
    isLoading: loading,
    isFetching,
  } = useGetGameHistoryQuery(queryArgs, {
    skip: !open || !roomName,
    refetchOnMountOrArgChange: true,
  })

  // Hỗ trợ cả 2 format: object mới {items,total,...} hoặc array cũ (fallback)
  const items = Array.isArray(historyResponse)
    ? historyResponse
    : historyResponse?.items || []
  const total = historyResponse?.total ?? items.length
  const totalPages = historyResponse?.totalPages ?? 1

  const toggleMatch = (matchId) => {
    setExpandedMatch((prev) => (prev === matchId ? null : matchId))
  }

  const handleStartDateChange = (newDate) => {
    if (!newDate) return
    setStartDate(newDate)
    setPage(1)
  }

  const handleEndDateChange = (newDate) => {
    if (!newDate) return
    setEndDate(newDate)
    setPage(1)
  }

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1))
  }

  const handleNextPage = () => {
    setPage((p) => Math.min(totalPages, p + 1))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.game?.crackIt?.historyTitle || "Lịch sử thi đấu"}
      className="bg-white text-slate-900 max-w-[625px] w-[100vw] md:rounded-3xl overflow-hidden md:border border-border md:shadow-2xl max-h-[100vh] md:max-h-[85vh] flex flex-col"
      headerClassName="flex items-center justify-between p-4 pl-6 border-b border-border shrink-0"
      fullScreenOnMobile={true}
    >
      {/* Date range filter */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-slate-50/60">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-slate-600">
              {t.rooms?.game?.crackIt?.startDateLabel || "Từ ngày"}
            </label>
            <DatePicker
              value={startDate}
              onChange={handleStartDateChange}
              maxDate={endDate}
              dateFormat="YYYY-MM-DD"
            />
          </div>
          <span className="text-slate-400 mt-5">→</span>
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-slate-600">
              {t.rooms?.game?.crackIt?.endDateLabel || "Đến ngày"}
            </label>
            <DatePicker
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate}
              dateFormat="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white min-h-[300px]">
        {loading || isFetching ? (
          <div className="h-full w-full flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-cath-red-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center min-h-[200px] text-slate-400">
            <Trophy className="w-12 h-12 mb-4 opacity-20" />
            <p>
              {t.rooms?.game?.crackIt?.noHistoryFound ||
                "Chưa có dữ liệu lịch sử cho phòng này."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((match) => (
              <HistoryMatchItem
                key={match.id}
                match={match}
                isExpanded={expandedMatch === match.id}
                onToggle={toggleMatch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination + close */}
      <div className="border-t border-border bg-white shrink-0">
        {total > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 md:px-6 py-3 text-sm">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1 || isFetching}
              className="flex items-center gap-1 h-9 px-3 rounded-lg border border-border text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.rooms?.pagination?.prev || "Trước"}
            </button>

            <span className="text-slate-600">
              {t.rooms?.pagination?.pageOf
                ?.replace("{page}", String(page))
                .replace("{totalPages}", String(totalPages)) ||
                `Trang ${page} / ${totalPages}`}
            </span>

            <button
              onClick={handleNextPage}
              disabled={page >= totalPages || isFetching}
              className="flex items-center gap-1 h-9 px-3 rounded-lg border border-border text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t.rooms?.pagination?.next || "Sau"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold bg-cath-red-500 hover:bg-cath-red-600 text-white transition-all shadow-sm shadow-cath-red-500/30"
          >
            {t.rooms?.game?.crackIt?.close || "Đóng"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default GameHistoryModal
