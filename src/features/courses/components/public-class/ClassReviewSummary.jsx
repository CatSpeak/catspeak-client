import React from "react"
import { Star } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetReviewSummaryQuery } from "@/store/api/reviewApi"

const ClassReviewSummary = ({ classId }) => {
  const { t } = useLanguage()
  const rv = t?.profile?.review || {}
  const { data: summary } = useGetReviewSummaryQuery(classId, {
    skip: !classId,
  })

  const average = summary?.averageScore
  const count = summary?.reviewCount ?? 0

  if (!average || count === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-black text-slate-900">
        {Number(average).toFixed(1)}
      </span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= Math.round(Number(average))
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-500">
        {(rv.reviewCount || "({count} đánh giá)").replace("{count}", String(count))}
      </span>
    </div>
  )
}

export default ClassReviewSummary
