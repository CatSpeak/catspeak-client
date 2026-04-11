import React from "react"
import { useParams, Link } from "react-router-dom"
import {
  Globe,
  Lock,
  RefreshCw,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { useGetSharedEventQuery } from "@/store/api/eventsApi"
import { IconLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"

const formatTime = (isoString) => {
  if (!isoString) return ""
  const date = new Date(isoString)
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

const formatDate = (isoString) => {
  if (!isoString) return ""
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

const SharedEventPage = () => {
  const { t } = useLanguage()
  const { token } = useParams()
  const { data, isLoading, isError } = useGetSharedEventQuery(token, {
    skip: !token,
  })

  const getFrequencyLabel = (freq) => {
    switch (freq) {
      case "DAILY":
        return t.calendar?.recurrence?.daily || "Hàng ngày"
      case "WEEKLY":
        return t.calendar?.recurrence?.weekly || "Hàng tuần"
      case "MONTHLY":
        return t.calendar?.recurrence?.monthly || "Hàng tháng"
      case "YEARLY":
        return t.calendar?.recurrence?.yearly || "Hàng năm"
      default:
        return freq
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">
            {t.calendar?.shared?.loadingEventInfo ||
              "Đang tải thông tin sự kiện…"}
          </p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <AlertTriangle
            className="mx-auto mb-4 text-red-400"
            size={48}
            strokeWidth={1.5}
          />
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {t.calendar?.shared?.invalidLink || "Liên kết không hợp lệ"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {t.calendar?.shared?.invalidLinkDesc ||
              "Liên kết chia sẻ này đã hết hạn, đã đạt giới hạn lượt xem, hoặc không tồn tại."}
          </p>
          <Link
            to="/"
            className="inline-block bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700 transition-colors"
          >
            {t.calendar?.shared?.backToHome || "Về trang chủ"}
          </Link>
        </div>
      </div>
    )
  }

  const { event, shareLink } = data
  const headerColor = event.color || "#B91264"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[680px]">
        {/* Share link validity badge */}
        {shareLink && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {shareLink.isValid ? (
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                <CheckCircle2 size={13} />
                {t.calendar?.shared?.validLink || "Liên kết hợp lệ"}
                {shareLink.remainingUses > 0 &&
                  ` · ${(t.calendar?.shared?.remainingUses || "Còn {{count}} lượt").replace("{{count}}", shareLink.remainingUses)}`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                <AlertTriangle size={13} />
                {t.calendar?.shared?.expiredLink || "Liên kết hết hạn"}
              </span>
            )}
            {shareLink.expiresAt && (
              <span className="text-xs text-slate-400">
                {t.calendar?.shared?.expiresAt || "Hết hạn:"}{" "}
                {formatDate(shareLink.expiresAt)}
              </span>
            )}
          </div>
        )}

        <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="relative text-white pt-10 pb-8 px-8 overflow-hidden"
            style={{ backgroundColor: headerColor }}
          >
            {/* Decorative circle */}
            <div
              className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10"
              style={{ backgroundColor: "#fff" }}
            />

            <div className="flex items-center gap-2 mb-3 relative z-10">
              {event.visibilityScope === "PUBLIC" ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  <Globe size={10} /> {t.calendar?.public || "Công khai"}
                </span>
              ) : event.visibilityScope ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  <Lock size={10} /> {t.calendar?.private || "Riêng tư"}
                </span>
              ) : null}
              {event.isRecurring && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  <RefreshCw size={10} /> {t.calendar?.recurring || "Lặp lại"}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold uppercase tracking-wide leading-tight mb-4 relative z-10">
              {event.title || (
                <span className="opacity-60 italic text-xl">
                  {t.calendar?.noTitle || "Không có tiêu đề"}
                </span>
              )}
            </h1>

            <div className="flex items-center gap-2 text-sm font-medium opacity-90 relative z-10">
              <img
                src={IconLogo}
                alt="Location"
                className="w-5 h-5 object-cover"
              />
              <span>
                {event.location || t.calendar?.locationDefault || "Đại học FPT"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-7 flex flex-col gap-5 text-sm text-gray-700">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 text-slate-400 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">
                  {formatDate(event.startTime)}
                </p>
                <p className="text-gray-500">
                  {formatTime(event.startTime)} – {formatTime(event.endTime)}{" "}
                  (GMT +07:00)
                </p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-slate-400 shrink-0" />
                <span className="text-gray-800 font-medium">
                  {event.location}
                </span>
              </div>
            )}

            {/* Participants */}
            {event.maxParticipants != null && (
              <div className="flex items-start gap-3">
                <Users size={18} className="mt-0.5 text-slate-400 shrink-0" />
                <span>
                  {(
                    t.calendar?.shared?.maxParticipantsCount ||
                    "Tối đa {{count}} người tham gia"
                  ).replace("{{count}}", event.maxParticipants)}
                </span>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="font-semibold text-gray-900 mb-1">
                  {t.calendar?.description || "Mô tả"}
                </p>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Conditions */}
            {event.conditions && event.conditions.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  {t.calendar?.shared?.conditionsJoin || "Điều kiện tham gia"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.conditions.map((c) => (
                    <span
                      key={c.id}
                      title={c.description || undefined}
                      className="italic px-3 py-1 rounded-lg text-white text-xs shadow-sm"
                      style={{ backgroundColor: headerColor }}
                    >
                      {c.title || c.conditionType || c.category || `#${c.id}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recurrence */}
            {event.isRecurring && event.recurrenceRule && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="font-semibold text-gray-900 mb-1">
                  {t.calendar?.recurring || "Lặp lại"}
                </p>
                <p className="text-gray-600">
                  {getFrequencyLabel(event.recurrenceRule.frequency)}
                  {event.recurrenceRule.interval > 1
                    ? ` (${t.calendar?.every || "mỗi"} ${event.recurrenceRule.interval} ${t.calendar?.intervalUnit?.default || "lần"})`
                    : ""}
                </p>
                {event.recurrenceRule.recurrenceStartDate &&
                  event.recurrenceRule.recurrenceEndDate && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(
                        event.recurrenceRule.recurrenceStartDate,
                      ).toLocaleDateString("vi-VN")}{" "}
                      –{" "}
                      {new Date(
                        event.recurrenceRule.recurrenceEndDate,
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-8 pb-8">
            <Link
              to="/"
              className="block w-full text-center text-white font-bold py-3 rounded-xl text-base transition-all hover:opacity-90 active:scale-[.98]"
              style={{ backgroundColor: headerColor }}
            >
              {t.calendar?.shared?.seeMoreEvents ||
                "Xem thêm sự kiện trên CatSpeak"}
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          © CatSpeak – Đại học FPT
        </p>
      </div>
    </div>
  )
}

export default SharedEventPage
