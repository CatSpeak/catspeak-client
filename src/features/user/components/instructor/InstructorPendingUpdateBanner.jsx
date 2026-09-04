import React, { useMemo } from "react";
import { Info, X, Loader2 } from "lucide-react";

/**
 * Banner shown to Approved teachers while a teaching-content draft awaits
 * admin review. The live profile keeps serving — this only reflects the draft.
 */
const field = (value) => (typeof value === "string" ? value : value ? JSON.stringify(value) : "");

const InstructorPendingUpdateBanner = ({ live, pending, onCancel, isCancelling, t }) => {
  const ins = t.profile?.instructor || {};

  const changedFields = useMemo(() => {
    if (!live || !pending) return [];
    const out = [];
    const pairs = [
      ["languagesTeach", "LanguagesTeach"],
      ["nativeLanguage", "NativeLanguage"],
      ["introduction", "Introduction"],
      ["credentialUrls", "CredentialUrls"],
      ["introVideoUrl", "IntroVideoUrl"],
    ];
    for (const [camel, pascal] of pairs) {
      if (field(pending[camel] ?? pending[pascal]) !== field(live[camel] ?? live[pascal])) {
        out.push(camel);
      }
    }
    return out;
  }, [live, pending]);

  if (!pending) return null;

  const labels = {
    languagesTeach: ins.teachingLanguages || "Ngôn ngữ giảng dạy",
    nativeLanguage: ins.teachingNative || "Ngôn ngữ mẹ đẻ",
    introduction: ins.teachingIntro || "Lời giới thiệu",
    credentialUrls: ins.teachingCredentials || "Chứng chỉ",
    introVideoUrl: ins.teachingVideo || "Video giới thiệu",
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-blue-800">
          {ins.pendingUpdateTitle || "Thay đổi nội dung giảng dạy đang chờ admin duyệt"}
        </p>
      </div>
      <p className="text-sm text-blue-700 ml-8">
        {ins.pendingUpdateDesc ||
          "Hồ sơ đã duyệt của bạn vẫn hiển thị và nhận học viên bình thường. Thay đổi sẽ có hiệu lực sau khi được duyệt."}
      </p>
      {changedFields.length > 0 && (
        <p className="text-sm text-blue-700 ml-8">
          {(ins.pendingUpdateFields || "Nội dung chờ duyệt:")}{" "}
          {changedFields.map((f) => labels[f] || f).join(", ")}
        </p>
      )}
      <div className="ml-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelling}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer disabled:opacity-50"
        >
          {isCancelling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X size={14} />
          )}
          <span>{isCancelling ? ins.cancelling || "Đang hủy..." : ins.cancelUpdate || "Hủy bản nháp"}</span>
        </button>
      </div>
    </div>
  );
};

export default InstructorPendingUpdateBanner;
