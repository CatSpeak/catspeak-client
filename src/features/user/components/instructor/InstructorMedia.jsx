import React, { useEffect, useMemo } from "react";
import { Upload, Trash2, Undo2 } from "lucide-react";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import FluentCard from "@/shared/components/ui/FluentCard";

const InstructorMedia = ({
  formData,
  onChange,
  onSelectVideo,
  onRemoveVideo,
  onUndoVideo,
  originalVideoUrl = null,
  readOnly = false,
  errors = {},
  t,
}) => {
  const ins = t.profile?.instructor || {};

  const videoFile = formData?.videoFile ?? null;

  const objectUrl = useMemo(() => {
    if (videoFile instanceof File) return URL.createObjectURL(videoFile);
    return null;
  }, [videoFile]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const videoSrc =
    videoFile instanceof File
      ? objectUrl
      : typeof videoFile === "string" && videoFile
        ? videoFile
        : null;

  const wasRemoved = !videoFile && !!originalVideoUrl;
  const fileName =
    videoFile instanceof File
      ? videoFile.name
      : videoSrc
        ? ins.videoUploaded || "Video đã tải lên"
        : "";

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction */}
      <FluentCard className="gap-6 !justify-start">
        <h2 className="text-xl font-bold text-gray-900">
          {ins.introduceYourself || "Giới thiệu bản thân"}
        </h2>

        <div id="field-introduction" className="flex flex-col gap-2">
          <textarea
            name="introduction"
            value={formData.introduction}
            onChange={onChange}
            rows={5}
            disabled={readOnly}
            placeholder={
              ins.introPlaceholder ||
              "Để duy trì hình ảnh chuyên nghiệp và phản ánh những phẩm chất lý tưởng của một giáo viên. (≤ 200-300 ký tự)"
            }
            className={`w-full bg-gray-50/50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-0 transition-all duration-200 resize-none disabled:text-gray-500 ${errors.introduction ? "border-red-500 focus:border-red-500 hover:!border-red-500" : "border-border focus:border-border hover:!border-cath-red-700"}`}
          />
          {errors.introduction && (
            <p className="text-xs text-red-500">{errors.introduction}</p>
          )}
          {!errors.introduction && (
            <p className="text-[11px] text-gray-400">
              {ins.introPlaceholder ||
                "Để duy trì hình ảnh chuyên nghiệp và phản ánh những phẩm chất lý tưởng của một giáo viên. (≤ 200-300 ký tự)"}
            </p>
          )}
        </div>
      </FluentCard>

      {/* Video */}
      <FluentCard id="field-videoFile" className="gap-4 !justify-start">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            {ins.uploadVideo || "Video giới thiệu bản thân"}
          </h2>
          {!readOnly && (
            <div className="flex items-center gap-2 shrink-0">
              {wasRemoved && onUndoVideo && (
                <button
                  type="button"
                  onClick={onUndoVideo}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 border border-border rounded-full transition cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                  {ins.undo || "Hoàn tác"}
                </button>
              )}
              {videoSrc && onRemoveVideo && (
                <button
                  type="button"
                  onClick={onRemoveVideo}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-full transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {ins.deleteVideo || "Xóa"}
                </button>
              )}
              <PillButton
                onClick={onSelectVideo}
                startIcon={<Upload className="w-4 h-4" />}
                className="!h-9 !px-4"
              >
                {videoSrc
                  ? ins.replaceVideo || "Thay video"
                  : ins.videoLabel || "Tải video"}
              </PillButton>
            </div>
          )}
        </div>

        {videoSrc ? (
          <div className="flex flex-col gap-2 w-full">
            <video
              key={videoSrc}
              src={videoSrc}
              controls
              preload="metadata"
              playsInline
              className="w-full max-h-[360px] rounded-xl bg-black"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-600 truncate">
                {fileName}
              </span>
              {videoFile instanceof File && (
                <span className="text-[11px] text-amber-600 shrink-0">
                  {ins.unsavedVideoHint || "Chưa lưu — nhấn Lưu để tải lên."}
                </span>
              )}
            </div>
            {errors.videoFile && (
              <p className="text-xs text-red-500">{errors.videoFile}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1 w-full">
            <div
              className={`flex flex-col items-center justify-center w-full bg-gray-50/50 border rounded-xl py-8 px-4 text-center ${errors.videoFile ? "border-red-500 bg-red-50/10 border-solid" : "border-border"}`}
            >
              <p
                className={`text-[12px] max-w-lg ${errors.videoFile ? "text-red-500" : "text-gray-400"}`}
              >
                {ins.videoNote ||
                  "Chúng tôi khuyến khích bạn tải lên video ngắn 1-3 phút giới thiệu bản thân để thu hút và gây ấn tượng với học viên tiềm năng. Video nên ở định dạng ngang (mp4) và dưới 500MB."}
              </p>
              {wasRemoved && (
                <p className="text-[12px] text-amber-600 mt-2">
                  {ins.videoRemovedHint ||
                    "Đã xóa video. Nhấn Lưu để áp dụng, hoặc Hoàn tác để khôi phục."}
                </p>
              )}
            </div>
            {errors.videoFile && (
              <p className="text-xs text-red-500">{errors.videoFile}</p>
            )}
          </div>
        )}
      </FluentCard>
    </div>
  );
};

export default InstructorMedia;
