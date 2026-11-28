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

// ISS-27: fluid desktop grid (>= 768px) instead of the fixed 1,208px table.
const DESKTOP_GRID_COLS =
  "grid-cols-[minmax(120px,1.25fr)_minmax(84px,0.85fr)_minmax(140px,1.55fr)_minmax(110px,1fr)_minmax(72px,auto)] gap-x-3"

const STATUS_STYLES = {
  Approved: {
    labelKey: "approvedStatusApproved",
    className:
      "bg-[#ECFDF3] text-[#039855] dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  Pending: {
    labelKey: "approvedStatusPending",
    className:
      "bg-[#FFF7E8] text-[#B45309] dark:bg-amber-950/50 dark:text-amber-300",
  },
  Rejected: {
    labelKey: "approvedStatusRejected",
    className:
      "bg-[#FEF3F2] text-[#D92D20] dark:bg-rose-950/50 dark:text-rose-300",
  },
  Cancelled: {
    labelKey: "approvedStatusCancelled",
    className:
      "bg-[#F2F4F7] text-[#475467] dark:bg-[#272727] dark:text-neutral-300",
  },
}

const SUB_LABELS = {
  Pending: {
    labelKey: "approvedUpdate",
    className: "text-[#B45309] dark:text-amber-300",
  },
  Rejected: {
    labelKey: "approvedStatusRejected",
    className: "text-[#D92D20] dark:text-rose-400",
  },
  Cancelled: {
    labelKey: "approvedStatusCancelled",
    className: "text-[#475467] dark:text-neutral-400",
  },
}

const StatusBadge = ({ status, ins }) => {
  const config = STATUS_STYLES[status] || STATUS_STYLES.Pending
  return (
    <span
      className={`inline-flex h-[26px] shrink-0 items-center rounded-[7px] px-2.5 text-[11px] font-semibold ${config.className}`}
    >
      {ins[config.labelKey] || status}
    </span>
  )
}

const CredentialCell = ({ url }) =>
  url ? (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-6 w-5 shrink-0 items-center justify-center rounded border border-[#D0D5DD] bg-[#FFF1F2] text-[6px] font-bold text-[#F52235] dark:border-[#3F3F3F] dark:bg-rose-950/50 dark:text-rose-300">
        PDF
      </span>
      <span className="min-w-0 truncate text-xs text-[#667085] dark:text-neutral-300">
        {fileNameFromUrl(url)}
      </span>
    </div>
  ) : (
    <span className="text-xs text-[#98A2B3] dark:text-neutral-500">—</span>
  )

const InfoLine = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="shrink-0 text-[11px] text-[#667085] dark:text-neutral-400">
      {label}
    </span>
    <span className="min-w-0 text-right">{children}</span>
  </div>
)

const MobileActionButton = ({ onClick, disabled = false, children }) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`mt-1 inline-flex h-8 items-center justify-center rounded-[7px] border px-3 text-xs font-semibold transition-colors ${
      disabled
        ? `${DISABLED_TEXT_CLASS} border-[#E2E2E2] dark:border-[#333333]`
        : "border-[#990011] text-[#990011] hover:bg-[#990011]/5 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30"
    }`}
  >
    {children}
  </button>
)

const LanguagesCard = ({
  languagesTeach,
  requests,
  currentCredentialUrl,
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
          type: "add",
          key: `add-${pick(request, "requestId", "RequestId", "id", "Id")}-${language}`,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#101828] dark:text-white">
          {ins.languageTeach || "Ngôn ngữ giảng dạy"}
        </h2>
        <button
          type="button"
          onClick={onAddLanguage}
          className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-[7px] border border-[#990011] px-3 text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Plus size={15} />
          <span>{ins.approvedAddLanguage || "Thêm ngôn ngữ"}</span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#667085] dark:text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/70 dark:bg-red-950/35">
          <p className="text-sm text-red-700 dark:text-red-300">
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
        <>
          {/* Mobile (< 768px): stacked cards */}
          <div className="flex flex-col gap-2.5 pt-1 md:hidden">
            {rows.map((row) => {
              if (row.type === "live") {
                const { live, hasPending } = row
                return (
                  <div
                    key={row.key}
                    className="flex flex-col gap-2 rounded-lg border border-[#E4E7EC] bg-white p-3.5 dark:border-[#3F3F3F] dark:bg-[#222222]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-semibold text-[#101828] dark:text-white">
                        {languageLabel(live.language)}
                      </span>
                      <StatusBadge status="Approved" ins={ins} />
                    </div>
                    <InfoLine label={ins.approvedLevelCol || "Trình độ"}>
                      <span className="text-xs text-[#101828] dark:text-neutral-200">
                        {live.level || "—"}
                      </span>
                    </InfoLine>
                    <div className="flex items-center justify-between gap-2">
                      <span className="shrink-0 text-[11px] text-[#667085] dark:text-neutral-400">
                        {ins.approvedCredentialCol || "Chứng chỉ"}
                      </span>
                      <span className="min-w-0 text-right">
                        <CredentialCell url={currentCredentialUrl} />
                      </span>
                    </div>
                    <MobileActionButton
                      disabled={hasPending}
                      onClick={() => onUpdateLanguage?.(live)}
                    >
                      {ins.approvedUpdate || "Cập nhật"}
                    </MobileActionButton>
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
                  className={
                    isSub
                      ? "ml-3 flex flex-col gap-2 rounded-lg border border-amber-200/80 bg-[#FFF7E8] p-3 dark:border-amber-800/60 dark:bg-amber-950/25"
                      : "flex flex-col gap-2 rounded-lg border border-[#E4E7EC] bg-white p-3.5 dark:border-[#3F3F3F] dark:bg-[#222222]"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`min-w-0 truncate text-xs font-semibold ${
                        isSub
                          ? subConfig.className
                          : "text-sm font-semibold text-[#101828] dark:text-white"
                      }`}
                    >
                      {isSub
                        ? `↳ ${ins[subConfig.labelKey] || status}`
                        : languageLabel(language)}
                    </span>
                    <StatusBadge status={status} ins={ins} />
                  </div>
                  <span className="text-[10px] text-[#667085] dark:text-neutral-400">
                    {ins.approvedSentAt || "Ngày gửi"}:{" "}
                    {formatUtcDate(createdAt)}
                  </span>
                  <InfoLine label={ins.approvedLevelCol || "Trình độ"}>
                    <span className="text-xs text-[#101828] dark:text-neutral-200">
                      {level || "—"}
                    </span>
                  </InfoLine>
                  <div className="flex items-center justify-between gap-2">
                    <span className="shrink-0 text-[11px] text-[#667085] dark:text-neutral-400">
                      {ins.approvedCredentialCol || "Chứng chỉ"}
                    </span>
                    <span className="min-w-0 text-right">
                      <CredentialCell url={credentialUrl} />
                    </span>
                  </div>
                  <MobileActionButton
                    onClick={() => onViewRequest?.(row.request)}
                  >
                    {ins.approvedView || "Xem"}
                  </MobileActionButton>
                </div>
              )
            })}

            {rows.length === 0 && (
              <div className="py-8 text-center text-sm text-[#667085] dark:text-neutral-400">
                —
              </div>
            )}
          </div>

          {/* Desktop & tablet (>= 768px): fluid grid */}
          <div className="hidden md:block overflow-x-auto">
            <div className={`grid ${DESKTOP_GRID_COLS} items-center`}>
              {[
                ins.approvedLanguageCol || "Ngôn ngữ",
                ins.approvedLevelCol || "Trình độ",
                ins.approvedCredentialCol || "Chứng chỉ",
                ins.approvedStatusCol || "Trạng thái",
                ins.approvedActionsCol || "Thao tác",
              ].map((label) => (
                <div
                  key={label}
                  className="min-w-0 py-2 text-[11px] font-semibold text-[#101828] dark:text-neutral-400"
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
                    className={`grid ${DESKTOP_GRID_COLS} min-h-[39px] items-center border-b border-[#F2F4F7] dark:border-[#2E2E2E]`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5 pr-3">
                      <span className="truncate text-xs text-[#101828] dark:text-white">
                        {languageLabel(live.language)}
                      </span>
                    </div>
                    <div className="min-w-0 text-xs text-[#101828] dark:text-neutral-200">
                      {live.level || "—"}
                    </div>
                    <div className="min-w-0 pr-3">
                      <CredentialCell url={currentCredentialUrl} />
                    </div>
                    <div className="min-w-0">
                      <StatusBadge status="Approved" ins={ins} />
                    </div>
                    <div className="min-w-0">
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
                            : "text-[#B42318] hover:text-[#912018] dark:text-red-400 dark:hover:text-red-300"
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
                  className={`grid ${DESKTOP_GRID_COLS} min-h-[39px] items-center ${
                    isSub
                      ? "bg-[#FFF7E8] dark:bg-amber-950/25"
                      : "border-b border-[#F2F4F7] dark:border-[#2E2E2E]"
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
                      <span className="truncate text-xs text-[#101828] dark:text-white">
                        {languageLabel(language)}
                      </span>
                    )}
                    <span className="truncate text-[10px] text-[#667085] dark:text-neutral-400">
                      {ins.approvedSentAt || "Ngày gửi"}:{" "}
                      {formatUtcDate(createdAt)}
                    </span>
                  </div>
                  <div className="min-w-0 text-xs text-[#101828] dark:text-neutral-200">
                    {level || "—"}
                  </div>
                  <div className="min-w-0 pr-3">
                    <CredentialCell url={credentialUrl} />
                  </div>
                  <div className="min-w-0">
                    <StatusBadge status={status} ins={ins} />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onViewRequest?.(row.request)}
                      className="text-xs font-semibold text-[#B42318] transition-colors hover:text-[#912018] dark:text-red-400 dark:hover:text-red-300"
                    >
                      {ins.approvedView || "Xem"}
                    </button>
                  </div>
                </div>
              )
            })}

            {rows.length === 0 && (
              <div className="py-8 text-center text-sm text-[#667085] dark:text-neutral-400">
                —
              </div>
            )}
          </div>
        </>
      )}
    </FluentCard>
  )
}

export default LanguagesCard
