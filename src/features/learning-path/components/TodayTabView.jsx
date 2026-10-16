import React from "react"
import dayjs from "dayjs"
import { parseTopic, getDayOfWeekFull } from "../utils/learningPathUtils"

const TodayTabView = ({
  cards = [],
  hskLevel = "HSK 2",
  onLaunchCard,
  onSelectCard,
  onSkipCard,
  isLaunching = false,
}) => {
  const today = dayjs()
  const todayDateString = `${getDayOfWeekFull(today)}, ${today.format("DD/MM")}`

  // Find today's card (Scheduled or isToday)
  const todayCard = cards.find((c) => c.isToday || c.status === "Scheduled") || cards[0]
  const missedCards = cards.filter((c) => c.status === "Missed")
  const upcomingCards = cards.filter((c) => c.status === "Upcoming")
  const nextUpcomingCard = upcomingCards[0]

  const todayParsed = todayCard ? parseTopic(todayCard.topicTitle, todayCard.topicDescription) : {}

  return (
    <div className="w-full flex flex-col gap-6 text-left animate-fadeIn">
      {/* 1. Hôm nay section */}
      {todayCard && (
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
            Hôm nay · {todayDateString}
          </h2>

          <div className="relative rounded-2xl border-2 border-[#980019] p-6 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
            <span className="absolute top-4 right-4 bg-[#980019] text-white text-xs px-2.5 py-0.5 rounded-md font-semibold">
              Hôm nay
            </span>

            <div className="flex flex-col gap-1 max-w-xl">
              <h3 className="text-lg font-bold text-gray-900">
                Ngày {todayCard.dayIndex} · {todayParsed.vietnamese || todayCard.topicTitle}
              </h3>

              <p className="text-xs text-gray-500">
                {todayParsed.hanzi && <span>{todayParsed.hanzi} · </span>}
                <span>{todayCard.topicDescription || todayParsed.pinyin || "Chủ đề đàm thoại"}</span>
                <span> · ~10 phút · {hskLevel}</span>
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Mục tiêu: phản xạ tự nhiên, phát âm chuẩn và hoàn thành hội thoại với AI Tutor
              </p>
            </div>

            <button
              type="button"
              disabled={isLaunching}
              onClick={() => onLaunchCard?.(todayCard)}
              className="bg-[#980019] text-white hover:bg-[#800014] rounded-xl px-7 py-3 font-medium text-sm flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 shrink-0"
            >
              <span>{isLaunching ? "Đang kết nối..." : "Vào học"}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Làm bù trong chu kỳ section */}
      {missedCards.length > 0 && (
        <div className="mt-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
            Làm bù trong chu kỳ
          </h2>

          <div className="flex flex-col gap-3">
            {missedCards.map((card) => {
              const parsed = parseTopic(card.topicTitle, card.topicDescription)
              return (
                <div
                  key={card.cardId || card.dayIndex}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="bg-[#FEF6EE] text-[#D97706] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                      Làm bù
                    </span>
                    <span className="font-bold text-sm text-gray-900">
                      Ngày {card.dayIndex} · {parsed.vietnamese || card.topicTitle}
                    </span>
                    <span className="text-xs text-gray-400">
                      {parsed.hanzi} · đã lỡ buổi học
                    </span>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onSelectCard?.(card)}
                      className="text-[#D97706] font-semibold text-xs sm:text-sm hover:underline cursor-pointer"
                    >
                      Học bù
                    </button>
                    {onSkipCard && (
                      <button
                        type="button"
                        onClick={() => onSkipCard?.(card)}
                        className="text-gray-400 font-medium text-xs sm:text-sm hover:text-gray-600 cursor-pointer"
                      >
                        Bỏ qua
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Sắp tới preview line */}
      {nextUpcomingCard && (
        <div className="text-xs text-gray-500 mt-1">
          Sắp tới: Ngày {nextUpcomingCard.dayIndex} · {nextUpcomingCard.topicTitle} — mở vào{" "}
          {nextUpcomingCard.scheduledDate
            ? dayjs(nextUpcomingCard.scheduledDate).format("dddd, DD/MM")
            : "ngày mai"}
        </div>
      )}
    </div>
  )
}

export default TodayTabView
