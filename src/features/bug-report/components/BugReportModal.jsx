import React, { useRef, useEffect } from "react"
import {
  Loader2,
  Check,
  LayoutDashboard,
  WifiOff,
  Video,
  CreditCard,
  GraduationCap,
  MoreHorizontal,
  Info,
  Maximize2,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Dropdown from "@/shared/components/ui/Dropdown"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { useBugReportForm } from "../hooks/useBugReportForm"

const categoryIconMap = {
  ui_issue: LayoutDashboard,
  api_error: WifiOff,
  video_audio: Video,
  payment: CreditCard,
  course_exam: GraduationCap,
  other: MoreHorizontal,
}

export default function BugReportModal({
  isOpen,
  open,
  onClose,
  initialTitle = "",
  initialDescription = "",
  roomContext = null,
}) {
  const isModalOpen = Boolean(open ?? isOpen)

  const {
    lang,
    description,
    setDescription,
    category,
    setCategory,
    includeScreenshot,
    screenshotDataUrl,
    screenshotUrl,
    isCapturing,
    previewOpen,
    setPreviewOpen,
    showConfirm,
    isLoading,
    categoryOptions,
    handleToggleScreenshot,
    handleRetakeScreenshot,
    handleRemoveScreenshot,
    handleRequestClose,
    confirmDiscard,
    cancelDiscard,
    handleSubmit,
  } = useBugReportForm({
    isOpen: isModalOpen,
    initialTitle,
    initialDescription,
    onClose,
    roomContext,
  })

  const screenshotRef = useRef(null)

  const isRoomContext =
    Boolean(roomContext) ||
    (typeof window !== "undefined" &&
      (window.location.pathname.includes("/meet") ||
        window.location.pathname.includes("/room") ||
        window.location.pathname.includes("/video-call")))

  useEffect(() => {
    if (includeScreenshot && (screenshotDataUrl || screenshotUrl)) {
      const timer = setTimeout(() => {
        screenshotRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [includeScreenshot, screenshotDataUrl, screenshotUrl])

  // enrich options with icons for dropdown
  const enrichedOptions = categoryOptions.map((opt) => {
    const Icon = categoryIconMap[opt.value] || MoreHorizontal
    return {
      ...opt,
      icon: (
        <Icon
          size={20}
          className={
            category === opt.value
              ? "text-cath-red-700 dark:text-red-400"
              : "text-[#9CA3AF] dark:text-[#AAAAAA]"
          }
        />
      ),
    }
  })

  return (
    <>
      <Modal
        open={isModalOpen}
        onClose={handleRequestClose}
        fullScreenOnMobile={true}
        className="md:max-w-[620px] !rounded-3xl border border-border dark:border-[#3F3F3F] overflow-hidden"
        headerClassName="flex items-start justify-between p-4"
        bodyClassName="px-4 flex-1 overflow-y-auto"
        footerClassName="p-4 flex justify-end"
        title={
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="text-xl font-bold text-[#111827] dark:text-white">
              {lang.modalTitle || "Báo cáo sự cố / Góp ý lỗi"}
            </h3>
            <p className="mt-1 text-sm text-[#6B7280] dark:text-[#AAAAAA]">
              {lang.modalSubtitle ||
                "Gặp lỗi hoặc giao diện không hoạt động đúng? Hãy gửi phản hồi để đội ngũ kỹ thuật khắc phục ngay."}
            </p>
          </div>
        }
        footer={
          <div className="flex items-center justify-end w-full">
            <PillButton
              onClick={handleSubmit}
              loading={isLoading || isCapturing}
              loadingText={
                isLoading
                  ? lang.submitting || "Đang gửi..."
                  : isCapturing
                    ? lang.capturing || "Đang chụp..."
                    : undefined
              }
              className="w-full sm:w-auto"
            >
              {lang.submit || "Gửi báo cáo"}
            </PillButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Room context header */}
          {(roomContext?.roomId || roomContext?.roomName) && (
            <div className="flex items-center gap-4 min-h-[56px] rounded-xl bg-neutral-100 dark:bg-white/5 border border-border dark:border-[#3F3F3F] px-4 py-2 text-base text-neutral-600 dark:text-[#AAAAAA]">
              <Info className="shrink-0 text-cath-red-700 dark:text-red-400" />
              <span>
                Báo lỗi từ phòng:{" "}
                <strong className="font-semibold text-neutral-900 dark:text-white">
                  {roomContext.roomName || roomContext.roomId}
                </strong>
              </span>
            </div>
          )}
          {/* Category */}
          <div className="flex flex-col">
            <label className="text-xs text-[#374151] dark:text-neutral-200">
              {lang.categoryLabel || "Phân loại sự cố"}
            </label>
            <Dropdown
              options={enrichedOptions}
              value={category}
              onChange={(val) => setCategory(val)}
              placeholder={lang.categoryLabel || "Chọn phân loại"}
              fullWidth
              roundedClass="rounded-xl"
            />
          </div>

          {/* Description */}
          <TextInput
            multiline
            required
            label={lang.descLabel || "Mô tả chi tiết sự cố"}
            labelClassName="text-[#374151] dark:text-neutral-200"
            variant="rounded-xl"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              lang.descPlaceholder ||
              "Mô tả các bước bạn đã làm trước khi bị lỗi, thông báo lỗi xuất hiện (nếu có)..."
            }
            rows={5}
            className="min-h-[140px]"
          />

          {/* Screenshot option */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Checkbox
                id="include-screenshot"
                checked={includeScreenshot}
                onChange={() => handleToggleScreenshot(!includeScreenshot)}
                disabled={isCapturing}
                withWrapper
              />

              <div
                className="flex flex-col cursor-pointer select-none"
                onClick={() =>
                  !isCapturing && handleToggleScreenshot(!includeScreenshot)
                }
              >
                <span className="text-base text-[#1F2937] dark:text-neutral-200">
                  {lang.includeScreenshot ||
                    "Attach current view (excluding this form)"}
                </span>
                <p className="text-sm text-[#6B7280] dark:text-[#AAAAAA]">
                  {lang.includeScreenshotHint ||
                    "Ảnh chỉ lấy nền phía sau, form vẫn giữ nguyên khi chụp."}
                </p>
              </div>
            </div>

            {/* Thumbnail preview, Retake/Remove actions, and contextual video note */}
            {includeScreenshot && (screenshotDataUrl || screenshotUrl) && (
              <div ref={screenshotRef} className="flex flex-col gap-2">
                <div className="relative group/preview overflow-hidden rounded-xl border border-border dark:border-[#3F3F3F] bg-neutral-100 dark:bg-[#1A1A1A]">
                  <img
                    src={screenshotDataUrl || screenshotUrl}
                    alt="Screenshot preview"
                    onClick={() => setPreviewOpen(true)}
                    className="max-h-40 w-full object-contain cursor-pointer transition hover:opacity-95"
                  />
                  <IconButton
                    type="button"
                    variant="overlay"
                    onClick={() => setPreviewOpen(true)}
                    title={lang.viewScreenshot || "View screenshot"}
                    className="absolute top-2 right-2 opacity-80 hover:opacity-100 transition shadow-sm"
                  >
                    <Maximize2 />
                  </IconButton>
                </div>

                <div className="flex items-center gap-2">
                  <PillButton
                    type="button"
                    variant="secondary"
                    onClick={handleRetakeScreenshot}
                    disabled={isCapturing || isLoading}
                    startIcon={<RotateCcw />}
                  >
                    {lang.retakeScreenshot || "Chụp lại"}
                  </PillButton>
                  <PillButton
                    type="button"
                    variant="secondary"
                    onClick={handleRemoveScreenshot}
                    disabled={isCapturing || isLoading}
                    startIcon={<Trash2 />}
                  >
                    {lang.removeScreenshot || "Xóa ảnh"}
                  </PillButton>
                </div>

                {isRoomContext && (
                  <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Info className="w-5 h-5 shrink-0 text-neutral-400" />
                    <span>
                      {lang.videoBlackNotice ||
                        "Phần video có thể hiển thị đen do giới hạn trình duyệt — header/chat/lỗi UI vẫn đủ để debug."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Screenshot Preview (Fullscreen Lightbox) */}
      {previewOpen && (screenshotDataUrl || screenshotUrl) && (
        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          showCloseButton={false}
          fullScreenOnMobile={false}
          className="!fixed !inset-0 !w-screen !h-screen !max-w-none !max-h-none !rounded-none !bg-black/90 !border-none !p-0 !m-0 !shadow-none flex flex-col justify-center items-center"
          bodyClassName="w-full h-full p-4 md:p-8 flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 z-50">
            <IconButton
              type="button"
              variant="overlay"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close preview"
              title="Close preview"
            >
              <X />
            </IconButton>
          </div>
          <img
            src={screenshotDataUrl || screenshotUrl}
            alt="Screenshot preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] max-w-[95vw] object-contain rounded-xl shadow-2xl select-none"
          />
        </Modal>
      )}

      {/* Confirm discard */}
      {showConfirm && (
        <Modal
          open={showConfirm}
          onClose={cancelDiscard}
          className="md:max-w-md"
          title={lang.closeConfirmTitle || "Bỏ báo cáo?"}
        >
          <p className="text-sm text-slate-600 dark:text-[#AAAAAA]">
            {lang.closeConfirmDesc ||
              "Bạn đã nhập nội dung, đóng bây giờ sẽ mất dữ liệu đã nhập."}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelDiscard}
              className="rounded-full border border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] px-5 py-2 text-sm text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#3D3D3D]"
            >
              {lang.closeConfirmKeep || "Tiếp tục chỉnh sửa"}
            </button>
            <button
              type="button"
              onClick={confirmDiscard}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-sm"
            >
              {lang.closeConfirmDiscard || "Bỏ thay đổi"}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
