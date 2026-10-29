import React from "react"
import CalendarCardItem from "./CalendarCardItem"

const FiveCardCalendar = ({
  cards = [],
  onSelectCard,
  onLaunchCard,
  onSkipCard,
  isLaunching = false,
  startsTomorrow = false,
}) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="w-full py-12 text-center text-gray-500">
        Không có buổi học nào trong chu kỳ này.
      </div>
    )
  }

  // Sort cards by DayIndex (1 to 5)
  const sortedCards = [...cards].sort((a, b) => (a.dayIndex || 0) - (b.dayIndex || 0))

  return (
    <div className="w-full">
      {/* Mobile Hint */}
      <div className="flex md:hidden items-center justify-between text-[11px] text-gray-400 px-1 mb-2">
        <span>Chu kỳ 5 buổi</span>
        <span>Vuốt ngang để xem đủ 5 ngày ➔</span>
      </div>

      {/* Responsive layout: Snap carousel on mobile, 5-col grid on desktop */}
      <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-3.5 lg:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {sortedCards.map((card) => (
          <div
            key={card.cardId || card.dayIndex}
            className="flex-shrink-0 w-[80vw] sm:w-[48vw] md:w-auto snap-start"
          >
            <CalendarCardItem
              card={card}
              isToday={card.isToday}
              onSelectCard={onSelectCard}
              onLaunchCard={onLaunchCard}
              onSkipCard={onSkipCard}
              isLaunching={isLaunching}
              startsTomorrow={startsTomorrow}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FiveCardCalendar
