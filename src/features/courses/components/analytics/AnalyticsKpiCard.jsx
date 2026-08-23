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
  red: "bg-[#FFEBED] text-[#E11D2E]",
  green: "bg-[#E8FAED] text-[#0D9E3D]",
  blue: "bg-[#E5F0FF] text-[#2563EB]",
  purple: "bg-[#F0E5FF] text-[#7C3AED]",
  orange: "bg-[#FFF2E0] text-[#F97316]",
}

const AnalyticsKpiCard = ({
  label,
  value,
  delta = "↑ 12%",
  tone = "red",
  note = "so với kỳ trước",
}) => {
  let symbolKey = "user"
  const lower = (label || "").toLowerCase()
  if (lower.includes("doanh") || lower.includes("thực nhận")) symbolKey = "money"
  else if (lower.includes("đánh giá") || lower.includes("rating")) symbolKey = "star"
  else if (lower.includes("phí")) symbolKey = "fee"
  else if (lower.includes("lấp đầy")) symbolKey = "fill"
  else if (lower.includes("chuyển đổi")) symbolKey = "convert"
  else if (lower.includes("hủy")) symbolKey = "cancel"
  else if (lower.includes("khóa") || lower.includes("lớp")) symbolKey = "book"
  else if (lower.includes("đăng ký lại") || lower.includes("quay lại") || lower.includes("duy trì")) symbolKey = "repeat"

  const IconComponent = iconMap[symbolKey] || Users
  const isDown = delta.includes("↓")

  return (
    <article className="min-h-[104px] min-w-0 bg-white border border-[#DEE0E5] rounded-xl p-3.5 flex gap-3 items-center shadow-sm hover:shadow transition-shadow">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          toneStyles[tone] || toneStyles.red
        }`}
      >
        <IconComponent size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[#667085] text-xs font-normal truncate">{label}</p>
        <strong className="text-lg sm:text-xl font-bold leading-tight block text-[#14171F] truncate tracking-tight my-0.5" title={value}>
          {value}
        </strong>
        {delta ? (
          <small className="block text-[11px] truncate">
            <span
              className={`font-semibold ${
                isDown ? "text-[#BF1F1F]" : "text-[#0D9E3D]"
              }`}
            >
              {delta}
            </span>{" "}
            {note && <span className="text-[#667085] font-normal">{note}</span>}
          </small>
        ) : (
          note && <small className="block text-[11px] text-[#667085] truncate font-normal">{note}</small>
        )}
      </div>
    </article>
  )
}

export default AnalyticsKpiCard
