import React from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const STATUS_CONFIG = {
  Pending: {
    icon: Clock,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-500",
    titleColor: "text-amber-800",
    textColor: "text-amber-700",
  },
  Approved: {
    icon: CheckCircle,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-800",
    textColor: "text-emerald-700",
  },
  Rejected: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
    titleColor: "text-red-800",
    textColor: "text-red-700",
  },
  RequestEdit: {
    icon: AlertTriangle,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
    textColor: "text-blue-700",
  },
};

const InstructorStatusBanner = ({
  status,
  rejectReason,
  banUntil,
  editRequestNote,
  t,
}) => {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-5`}
    >
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

      {/* Rejected: reason + ban date */}
      {status === "Rejected" && (
        <div className="mt-3 ml-8 space-y-2">
          {rejectReason && (
            <div className="bg-white/60 rounded-lg px-4 py-3 border border-red-100">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                {ins.rejectReason}
              </span>
              <p className="text-sm text-red-800 mt-1">{rejectReason}</p>
            </div>
          )}
          {banUntil && (
            <p className="text-xs text-red-600">
              {ins.bannedUntil}:{" "}
              <span className="font-semibold">{formatDate(banUntil)}</span>
            </p>
          )}
        </div>
      )}

      {/* RequestEdit: note from admin */}
      {status === "RequestEdit" && editRequestNote && (
        <div className="mt-3 ml-8">
          <div className="bg-white/60 rounded-lg px-4 py-3 border border-blue-100">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              {ins.editNote}
            </span>
            <p className="text-sm text-blue-800 mt-1">{editRequestNote}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorStatusBanner;
