import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Play } from "lucide-react"
import CatIcon from "@/shared/assets/icons/logo/icon.svg"
import RegisteredEvents from "./RegisteredEvents"
import MyEvents from "./MyEvents"

const CalendarHeadline = ({ currentDate, onNextMonth, onPrevMonth }) => {
  const { t } = useLanguage()

  const monthString = currentDate ? currentDate.format("M") : "1"
  const yearString = currentDate ? currentDate.format("YYYY") : "2026"

  return (
    <div className="flex flex-col h-full w-full sm:w-[260px] shrink-0">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[38px] leading-[1.1] font-bold text-black tracking-tight">
          {t.calendar?.calendar || "LỊCH"}
        </h2>
        <h2 className="text-[38px] leading-[1.1] font-bold text-black tracking-tight">
          {t.calendar?.offline || "OFFLINE"}
        </h2>
        <h2 className="text-[38px] leading-[1.1] font-bold text-black tracking-tight">
          {t.calendar?.meeting || "MEETING"}
        </h2>
        <h2 className="text-[38px] leading-[1.1] font-bold text-[#990011] tracking-tight">
          {t.calendar?.month || "THÁNG"} {monthString}
        </h2>
        <div className="flex items-center gap-3">
          <h2 className="text-[38px] leading-[1.1] font-bold text-[#990011] tracking-tight">
            {yearString}
          </h2>
          <div className="flex items-center gap-1 mt-1">
            <Play
              onClick={onPrevMonth}
              className="w-5 h-5 fill-black rotate-180 cursor-pointer hover:scale-110 transition-transform"
            />
            <Play
              onClick={onNextMonth}
              className="w-5 h-5 fill-black cursor-pointer hover:scale-110 transition-transform"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#E5E5E5] my-5" />

      <div className="flex flex-col">
        {/*
        <h3 className="text-[32px] leading-[1.1] font-bold text-[#990011] tracking-tight">
          HCM, VN
        </h3>
        <div className="flex items-baseline gap-2 mt-2 mb-3">
          <span className="text-[36px] leading-[1.1] font-bold text-black">
            400
          </span>
          <span className="text-[15px] font-semibold text-black uppercase tracking-wide">
            Sự kiện
          </span>
        </div>
        */}
        <div className="flex items-center gap-2">
          <img
            src={CatIcon}
            className="w-6 h-6 min-w-[24px] z-10"
            alt="Cat Speak"
          />
          <span className="text-xs italic text-[#606060]">
            {t.calendar?.catSpeakEvent || "Sự kiện của Cat Speak"}
          </span>
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#E5E5E5] my-5" />

      <RegisteredEvents />
      <MyEvents />
    </div>
  )
}

export default CalendarHeadline
