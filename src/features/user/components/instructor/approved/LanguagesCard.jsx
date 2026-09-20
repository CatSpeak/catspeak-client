import React, { useMemo } from "react"
import { Loader2, Plus } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { DISABLED_TEXT_CLASS } from "../ProfileDrawer"
import {
  fileNameFromUrl,
  formatUtcDate,
  normalizeLanguagesTeach,
  pick,
  requestStatus,
} from "./utils"

const GRID_COLS = "grid-cols-[260px_215px_390px_225px_118px]"

const STATUS_STYLES = {
  Approved: {
    labelKey: "approvedStatusApproved",
    className: "bg-[#ECFDF3] text-[#039855]",
  },
  Pending: {
    labelKey: "approvedStatusPending",
    className: "bg-[#FFF7E8] text-[#D97706]",
  },
  Rejected: {
    labelKey: "approvedStatusRejected",
    className: "bg-[#FEF3F2] text-[#F52235]",
  },
  Cancelled: {
    labelKey: "approvedStatusCancelled",
    className: "bg-[#F2F4F7] text-[#667085]",
  },
}

const SUB_LABELS = {
  Pending: { labelKey: "approvedUpdate", className: "text-[#D97706]" },
  Rejected: { labelKey: "approvedStatusRejected", className: "text-[#F52235]" },
  Cancelled: {
    labelKey: "approvedStatusCancelled",
    className: "text-[#667085]",
  },
}

const StatusBadge = ({ status, ins }) => {
  const config = STATUS_STYLES[status] || STATUS_STYLES.Pending
  return (
    <span
      className={`inline-flex h-[26px] items-center rounded-[7px] px-2.5 text-[11px] font-semibold ${config.className}`}
    >
      {ins[config.labelKey] || status}
    </span>
  )
}

const CredentialCell = ({ url }) =>
  url ? (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-6 w-5 shrink-0 items-center justify-center rounded border border-[#D0D5DD] bg-[#FFF1F2] text-[6px] font-bold text-[#F52235]">
        PDF
      </span>
      <span className="min-w-0 truncate text-xs text-[#667085]">
        {fileNameFromUrl(url)}
      </span>
    </div>
  ) : (
    <span className="text-xs text-[#98A2B3]">—</span>
  )

const LanguagesCard = ({
  languagesTeach,
  requests,
  t,
  isLoading = false,
  isError = false,
  onRetry,
  onAddLanguage,
  onUpdateLanguage,
  onViewRequest,
}) => {
  const ins = t.profile?.instructor || {}

  const languageLabel = (language) =>
    t.courses?.student?.languages?.[language] || language

  const rows = useMemo(() => {
    const list = Array.isArray(requests) ? requests : []
    const byLanguage = new Map()
    for (const request of list) {
      const language = pick(request, "language", "Language")
      if (!language) continue
      if (!byLanguage.has(language)) byLanguage.set(language, [])
      byLanguage.get(language).push(request)
    }

    const result = []
    for (const live of normalizeLanguagesTeach(languagesTeach)) {
      const languageRequests = byLanguage.get(live.language) || []
      result.push({
        type: "live",
        key: `live-${live.language}`,
        live,
        hasPending: languageRequests.some(
          (request) => requestStatus(request) === "Pending",
        ),
      })
      for (const request of languageRequests) {
        result.push({
          type: "sub",
          key: `sub-${pick(request, "requestId", "RequestId", "id", "Id")}-${live.language}`,
          request,
        })
      }
      byLanguage.delete(live.language)
    }

    for (const [language, languageRequests] of byLanguage) {
      for (const request of languageRequests) {
        result.push({
          type: "request",
          key: `req-${pick(request, "requestId", "RequestId", "id", "Id")}-${language}`,
          request,
        })
      }
    }
    return result
  }, [languagesTeach, requests])

  return (
    <FluentCard
      rounded="rounded-[10px]"
      padding="px-5 py-3"
      className="!justify-start gap-1.5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#101828]">
          {ins.languageTeach || "Ngôn ngữ giảng dạy"}
        </h2>
        <button
          type="button"
          onClick={onAddLanguage}
          className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[7px] border border-[#990011] px-3 text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5"
        >
          <Plus size={15} />
          <span>{ins.approvedAddLanguage || "Thêm ngôn ngữ"}</span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#667085]">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {ins.loadErrorDesc || "Vui lòng kiểm tra kết nối và thử lại."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-[#990011] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#7a000e]"
          >
            {ins.retry || "Thử lại"}
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className={`grid ${GRID_COLS} items-center`}>
              {[
                ins.approvedLanguageCol || "Ngôn ngữ",
                ins.approvedLevelCol || "Trình độ",
                ins.approvedCredentialCol || "Chứng chỉ",
                ins.approvedStatusCol || "Trạng thái",
                ins.approvedActionsCol || "Thao tác",
              ].map((label) => (
                <div
                  key={label}
                  className="py-2 text-[11px] font-semibold text-[#101828]"
                >
                  {label}
                </div>
              ))}
            </div>

            {rows.map((row) => {
              if (row.type === "live") {
                const { live, hasPending } = row
                return (
                  <div
                    key={row.key}
                    className={`grid ${GRID_COLS} min-h-[39px] items-center border-b border-[#F2F4F7]`}
                  >
                    <div className="flex items-center gap-2.5 pr-3">
                      <span className="truncate text-xs text-[#101828]">
                        {languageLabel(live.language)}
                      </span>
                    </div>
                    <div className="text-xs text-[#101828]">
                      {live.level || "—"}
                    </div>
                    <div className="pr-3">
                      <CredentialCell url={null} />
                    </div>
                    <div>
                      <StatusBadge status="Approved" ins={ins} />
                    </div>
                    <div>
                      <button
                        type="button"
                        disabled={hasPending}
                        onClick={
                          hasPending
                            ? undefined
                            : () => onUpdateLanguage?.(live)
                        }
                        className={`text-xs font-semibold transition-colors ${
                          hasPending
                            ? DISABLED_TEXT_CLASS
                            : "text-[#F52235] hover:text-[#c9182a]"
                        }`}
                      >
                        {ins.approvedUpdate || "Cập nhật"}
                      </button>
                    </div>
                  </div>
                )
              }

              const status = requestStatus(row.request)
              const isSub = row.type === "sub"
              const subConfig = SUB_LABELS[status] || SUB_LABELS.Pending
              const language = pick(row.request, "language", "Language")
              const level = pick(row.request, "level", "Level")
              const credentialUrl = pick(
                row.request,
                "credentialUrl",
                "CredentialUrl",
              )
              const createdAt = pick(row.request, "createdAt", "CreatedAt")

              return (
                <div
                  key={row.key}
                  className={`grid ${GRID_COLS} min-h-[39px] items-center ${
                    isSub ? "bg-[#FFF7E8]" : "border-b border-[#F2F4F7]"
                  }`}
                >
                  <div className="flex min-w-0 flex-col justify-center pr-3">
                    {isSub ? (
                      <span
                        className={`truncate text-xs font-medium ${subConfig.className}`}
                      >
                        ↳ {ins[subConfig.labelKey] || status}
                      </span>
                    ) : (
                      <span className="truncate text-xs text-[#101828]">
                        {languageLabel(language)}
                      </span>
                    )}
                    <span className="truncate text-[10px] text-[#667085]">
                      {ins.approvedSentAt || "Ngày gửi"}:{" "}
                      {formatUtcDate(createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-[#101828]">{level || "—"}</div>
                  <div className="pr-3">
                    <CredentialCell url={credentialUrl} />
                  </div>
                  <div>
                    <StatusBadge status={status} ins={ins} />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => onViewRequest?.(row.request)}
                      className="text-xs font-semibold text-[#F52235] transition-colors hover:text-[#c9182a]"
                    >
                      {ins.approvedView || "Xem"}
                    </button>
                  </div>
                </div>
              )
            })}

            {rows.length === 0 && (
              <div className="py-8 text-center text-sm text-[#667085]">—</div>
            )}
          </div>
        </div>
      )}
    </FluentCard>
  )
}

export default LanguagesCard
