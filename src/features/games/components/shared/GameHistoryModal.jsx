import React, { useState, useMemo } from "react"
import Modal from "@/shared/components/ui/Modal"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import Label from "@/shared/components/ui/Label"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { StackTransition } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetGameHistoryQuery } from "@/store/api/roomsApi"
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import HistoryMatchItem from "./HistoryMatchItem"
import HistoryMatchDetail from "./HistoryMatchDetail"

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

  // 2-layer drilldown state
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [slideDirection, setSlideDirection] = useState(1)

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

  const rawData = historyResponse?.data ?? historyResponse
  const items = useMemo(() => {
    if (Array.isArray(rawData?.items)) return rawData.items
    if (Array.isArray(rawData)) return rawData
    return []
  }, [rawData])

  const total = rawData?.total ?? rawData?.totalCount ?? items.length
  const totalPages =
    rawData?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleSelectMatch = (match) => {
    setSlideDirection(1)
    setSelectedMatch(match)
  }

  const handleBackToList = () => {
    setSlideDirection(-1)
    setSelectedMatch(null)
  }

  const handleClose = () => {
    setSelectedMatch(null)
    setSlideDirection(1)
    onClose()
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
      onClose={handleClose}
      title={
        selectedMatch ? (
          <div className="flex items-center gap-1.5">
            <IconButton
              type="button"
              variant="ghost"
              onClick={handleBackToList}
              aria-label={t.rooms?.game?.crackIt?.back || "Quay lại"}
              className="-ml-2 shrink-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronLeft size={22} />
            </IconButton>
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t.rooms?.game?.crackIt?.matchDetails || "Chi tiết trận đấu"}
            </span>
          </div>
        ) : (
          t.rooms?.game?.crackIt?.historyTitle || "Lịch sử thi đấu"
        )
      }
      className="bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white max-w-[600px] w-[100vw] md:rounded-3xl overflow-hidden md:border border-border dark:border-[#3F3F3F] md:shadow-2xl h-full md:h-[620px] flex flex-col"
      headerClassName="flex items-center justify-between p-4 shrink-0"
      bodyClassName="!p-0 flex flex-col flex-1 !overflow-hidden relative"
      fullScreenOnMobile={true}
      footerClassName="bg-white dark:bg-[#1A1A1A] shrink-0"
      footer={
        !selectedMatch && total > 0 && totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2 p-4 text-sm">
            <span className="text-slate-600 dark:text-slate-400 text-sm">
              {t.rooms?.pagination?.pageOf
                ?.replace("{page}", String(page))
                .replace("{totalPages}", String(totalPages)) ||
                `Trang ${page} / ${totalPages}`}
            </span>

            <div className="flex items-center gap-2">
              <IconButton
                onClick={handlePrevPage}
                disabled={page <= 1 || isFetching}
                variant="secondary"
                aria-label={t.rooms?.pagination?.prev || "Trước"}
                title={t.rooms?.pagination?.prev || "Trước"}
              >
                <ChevronLeft />
              </IconButton>

              <IconButton
                onClick={handleNextPage}
                disabled={page >= totalPages || isFetching}
                variant="secondary"
                aria-label={t.rooms?.pagination?.next || "Sau"}
                title={t.rooms?.pagination?.next || "Sau"}
              >
                <ChevronRight />
              </IconButton>
            </div>
          </div>
        ) : null
      }
    >
      <StackTransition
        activeKey={selectedMatch ? selectedMatch.id : "list"}
        direction={slideDirection}
        className="relative flex-1 w-full h-full min-h-0 overflow-hidden bg-white dark:bg-[#1A1A1A]"
        screenClassName="absolute inset-0 flex flex-col w-full h-full bg-white dark:bg-[#1A1A1A] overflow-hidden"
      >
        {selectedMatch ? (
          <HistoryMatchDetail match={selectedMatch} />
        ) : (
          <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
            {/* Date range filter without nested borders */}
            <div className="px-4 py-3 bg-slate-50/60 dark:bg-[#222222] shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <Label>
                    {t.rooms?.game?.crackIt?.startDateLabel || "Từ ngày"}
                  </Label>
                  <DatePicker
                    value={startDate}
                    onChange={handleStartDateChange}
                    maxDate={endDate}
                    dateFormat="YYYY-MM-DD"
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                  <Label>
                    {t.rooms?.game?.crackIt?.endDateLabel || "Đến ngày"}
                  </Label>
                  <DatePicker
                    value={endDate}
                    onChange={handleEndDateChange}
                    minDate={startDate}
                    dateFormat="YYYY-MM-DD"
                  />
                </div>
              </div>
            </div>

            {/* Matches List */}
            <div
              className="flex-1 overflow-y-auto bg-white dark:bg-[#1A1A1A] min-h-[300px] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-[#3A3A3A] hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-[#555]"
              style={{ overflowY: "overlay" }}
            >
              {items.length === 0 && (loading || isFetching) ? (
                <LoadingSpinner className="h-full w-full flex items-center justify-center min-h-[200px]" />
              ) : items.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  message={
                    t.rooms?.game?.crackIt?.noHistoryFound ||
                    "Chưa có dữ liệu lịch sử cho phòng này."
                  }
                />
              ) : (
                <div>
                  {items.map((match) => (
                    <HistoryMatchItem
                      key={match.id}
                      match={match}
                      onSelect={handleSelectMatch}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </StackTransition>
    </Modal>
  )
}

export default GameHistoryModal
