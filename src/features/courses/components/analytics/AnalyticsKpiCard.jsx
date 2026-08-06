import React from "react"
import {
  Users,
  DollarSign,
  Star,
  Percent,
  TrendingUp,
  TrendingDown,
  BookOpen,
  XCircle,
  RotateCcw,
  CreditCard,
  Target,
} from "lucide-react"

const iconMap = {
  user: Users,
  money: DollarSign,
  star: Star,
  fee: CreditCard,
  fill: Percent,
  convert: Target,
  cancel: XCircle,
  book: BookOpen,
  repeat: RotateCcw,
}

const toneStyles = {
  red: "bg-[#ffecef] text-[#e11d2e]",
  green: "bg-[#eaf8ef] text-[#16a34a]",
  blue: "bg-[#edf4ff] text-[#2563eb]",
  purple: "bg-[#f2edff] text-[#7c3aed]",
  orange: "bg-[#fff4e8] text-[#f97316]",
}

const AnalyticsKpiCard = ({ label, value, delta = "↑ 5%", tone = "red", note = "so với kỳ trước" }) => {
  let symbolKey = "user"
  const lower = label.toLowerCase()
  if (lower.includes("doanh") || lower.includes("thực nhận")) symbolKey = "money"
  else if (lower.includes("đánh giá")) symbolKey = "star"
  else if (lower.includes("phí")) symbolKey = "fee"
  else if (lower.includes("lấp đầy")) symbolKey = "fill"
  else if (lower.includes("chuyển đổi")) symbolKey = "convert"
  else if (lower.includes("hủy")) symbolKey = "cancel"
  else if (lower.includes("khóa")) symbolKey = "book"
  else if (lower.includes("đăng ký lại")) symbolKey = "repeat"

  const IconComponent = iconMap[symbolKey] || Users
  const isDown = delta.includes("↓")

  return (
    <article className="min-h-[104px] min-w-0 bg-white border border-[#e6e7ea] rounded-2xl p-4 flex gap-3 items-start shadow-[0_4px_14px_rgba(15,23,42,0.03)] hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${toneStyles[tone] || toneStyles.red}`}>
        <IconComponent size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 mb-1 text-[#5f6b7e] text-xs font-medium truncate">{label}</p>
        <strong className="text-xl font-bold leading-tight block text-[#111827] whitespace-nowrap tracking-tight">
          {value}
        </strong>
        <small className="mt-2 block text-[#7b8494] text-xs truncate">
          <span className={`font-bold ${isDown ? "text-red-600" : "text-emerald-600"}`}>
            {delta}
          </span>{" "}
          {note}
        </small>
      </div>
    </article>
  )
}

export default AnalyticsKpiCard
