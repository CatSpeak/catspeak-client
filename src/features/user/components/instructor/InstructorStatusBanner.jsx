import React from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useTimezone } from "@/shared/hooks/useTimezone";

const STATUS_CONFIG = {
  Pending: {
    icon: Clock,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/40",
    iconColor: "text-amber-500 dark:text-amber-400",
    titleColor: "text-amber-800 dark:text-amber-200",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  Approved: {
    icon: CheckCircle,
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    titleColor: "text-emerald-800 dark:text-emerald-200",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  Rejected: {
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800/40",
    iconColor: "text-red-500 dark:text-red-400",
    titleColor: "text-red-800 dark:text-red-200",
    textColor: "text-red-700 dark:text-red-300",
  },
  RequestEdit: {
    icon: AlertTriangle,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/40",
    iconColor: "text-blue-500 dark:text-blue-400",
    titleColor: "text-blue-800 dark:text-blue-200",
    textColor: "text-blue-700 dark:text-blue-300",
  },
};

const InstructorStatusBanner = ({
  status,
  rejectReason,
  banUntil,
  editRequestNote,
  isRevision,
  t,
  onReapply,
  isReapplying,
  onDismiss,
  dismissLabel,
}) => {
  const { formatDate } = useTimezone();
  const ins = t.profile?.instructor || {};
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;

  const statusLabels = {
    Pending: ins.statusPending,
    Approved: ins.statusApproved,
    Rejected: ins.statusRejected,
    RequestEdit: ins.statusRequestEdit,
  };

  const statusDescriptions = {
    Pending: ins.statusPendingDesc,
    Approved: ins.statusApprovedDesc,
    Rejected: ins.statusRejectedDesc,
    RequestEdit: ins.statusRequestEditDesc,
  };

  return (
    <div
      className={`relative rounded-xl border ${config.borderColor} ${config.bgColor} p-5`}
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel || "Đóng"}
          title={dismissLabel || "Đóng"}
          className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-gray-400 dark:text-neutral-400 hover:bg-white/70 dark:hover:bg-neutral-800/70 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
        >
          ✕
        </button>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
        <h3 className={`text-sm font-bold ${config.titleColor}`}>
          {statusLabels[status]}
        </h3>
      </div>

      {/* Description */}
      <p className={`text-sm ${config.textColor} ml-8`}>
        {statusDescriptions[status]}
      </p>

      {/* Legacy Pending (pre-revision cutover): nudge to resubmit as a revision.
          Revision-based Pending rows already use the new queue — no nudge. */}
      {status === "Pending" && !isRevision && onReapply && !isReapplying && (
        <div className="mt-3 ml-8">
          <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-3 border border-amber-100 dark:border-amber-900/40">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {ins.legacyPendingHint ||
                "Hồ sơ cũ của bạn chưa được xử lý qua hệ thống mới. Hãy gửi lại đơn để tiếp tục."}
            </p>
            <div className="pt-2">
              <button
                onClick={onReapply}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
              >
                {ins.resubmit || "Gửi lại đơn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejected: reason + ban date */}
      {status === "Rejected" && (
        <div className="mt-3 ml-8 space-y-2">
          {rejectReason && (
            <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-3 border border-red-100 dark:border-red-900/40">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                {ins.rejectReason}
              </span>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">{rejectReason}</p>
            </div>
          )}
          {banUntil && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {ins.bannedUntil}:{" "}
              <span className="font-semibold">{formatDate(banUntil)}</span>
            </p>
          )}
          {(!banUntil || new Date(banUntil) <= new Date()) && onReapply && !isReapplying && (
            <div className="pt-2">
              <button
                onClick={onReapply}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                {ins.resubmit || "Gửi lại đơn"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* RequestEdit: note from admin */}
      {status === "RequestEdit" && editRequestNote && (
        <div className="mt-3 ml-8">
          <div className="bg-white/60 dark:bg-black/20 rounded-lg px-4 py-3 border border-blue-100 dark:border-blue-900/40">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {ins.editNote}
            </span>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{editRequestNote}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorStatusBanner;
