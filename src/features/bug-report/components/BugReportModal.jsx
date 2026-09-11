import React from "react"
import { Bug, ChevronDown, Loader2, Check, LayoutDashboard, WifiOff, Video, CreditCard, GraduationCap, MoreHorizontal, X } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useBugReportForm } from "../hooks/useBugReportForm"

const categoryIconMap = {
  ui_issue: LayoutDashboard,
  api_error: WifiOff,
  video_audio: Video,
  payment: CreditCard,
  course_exam: GraduationCap,
  other: MoreHorizontal,
}

export default function BugReportModal({ isOpen, open, onClose, initialTitle = "", initialDescription = "", roomContext = null }) {
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

  // Q2/Q3: modal luôn giữ nguyên khi chụp (không unmount gây chớp).
  // Form + backdrop đã gắn data-html2canvas-ignore nên bị loại khỏi ảnh,
  // chỉ giữ nền web phía sau.

  // enrich options with icons for dropdown
  const enrichedOptions = categoryOptions.map((opt) => {
    const Icon = categoryIconMap[opt.value] || MoreHorizontal
    return {
      ...opt,
      icon: <Icon size={16} className={category === opt.value ? "text-[#9E1C25]" : "text-[#9CA3AF]"} />,
    }
  })

  const viewDisabled = !includeScreenshot || (!screenshotDataUrl && !screenshotUrl) || isCapturing

  return (
    <>
      <Modal
        open={isModalOpen}
        onClose={handleRequestClose}
        fullScreenOnMobile={true}
        className="md:max-w-[620px] !rounded-[28px] overflow-hidden"
        headerClassName="flex items-start justify-between px-7 pt-7 pb-2"
        bodyClassName="px-7 pb-2 flex-1 overflow-y-auto"
        footerClassName="px-7 pt-4 pb-7 flex justify-end"
        title={
          <div className="flex items-start gap-3.5 min-w-0 flex-1 pr-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDF2F2] border border-red-50 text-[#9E1C25]">
              <Bug size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[20px] font-bold leading-[27.5px] text-[#111827]">
                {lang.modalTitle || "Báo cáo sự cố / Góp ý lỗi"}
              </h3>
              <p className="mt-1 text-[13.5px] leading-[21.9px] text-[#6B7280]">
                {lang.modalSubtitle || "Gặp lỗi hoặc giao diện không hoạt động đúng? Hãy gửi phản hồi để đội ngũ kỹ thuật khắc phục ngay."}
              </p>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isLoading || isCapturing}
              className="rounded-full border border-[#E5E7EB] bg-white px-6 py-2 text-[14.5px] font-medium leading-[21.75px] text-[#374151] shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              {lang.cancel || "Hủy"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isCapturing}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8B0816] px-6 py-2 text-[14.5px] font-medium leading-[21.75px] text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
            >
              {(isLoading || isCapturing) && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? (lang.submitting || "Đang gửi...") : isCapturing ? (lang.capturing || "Đang chụp...") : (lang.submit || "Gửi báo cáo")}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-[15px] pt-3">
          {/* Q6: dòng xám room context, không cho sửa */}
          {(roomContext?.roomId || roomContext?.roomName) && (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Báo lỗi từ phòng: {roomContext.roomName || roomContext.roomId}
            </div>
          )}
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] font-medium leading-5 text-[#374151]">
              {lang.categoryLabel || "Phân loại sự cố"}
            </label>
            <Dropdown
              options={enrichedOptions}
              value={category}
              onChange={(val) => setCategory(val)}
              dropdownClassName="w-full min-w-0 max-w-full overflow-hidden"
              className="w-full"
              trigger={(isOpenDropdown, selected, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  className={`flex h-[46px] w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-[14.5px] shadow-sm transition focus:outline-none ${
                    isOpenDropdown ? "border-[#9E1C25] ring-1 ring-[#9E1C25]/10" : "border-[#E5E7EB] hover:border-[#9E1C25]/50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-[#111827]">
                    {selected?.icon}
                    <span>{selected?.label || "Chọn phân loại"}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[#4B5563] transition-transform ${isOpenDropdown ? "rotate-180" : ""}`} />
                </button>
              )}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] font-medium leading-5 text-[#374151]">
              {lang.descLabel || "Mô tả chi tiết sự cố"} <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang.descPlaceholder || "Mô tả các bước bạn đã làm trước khi bị lỗi, thông báo lỗi xuất hiện (nếu có)..."}
              rows={5}
              className="min-h-[140px] w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] leading-6 text-[#111827] placeholder:text-[#9CA3AF] shadow-sm focus:border-[#9E1C25] focus:outline-none focus:ring-1 focus:ring-[#9E1C25]/10"
            />
          </div>

          {/* Q9: wording rõ chỉ chụp nền phía sau, form giữ nguyên (Q2/Q3) */}
          <div className="flex flex-col gap-1 pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={includeScreenshot}
                onClick={() => handleToggleScreenshot(!includeScreenshot)}
                disabled={isCapturing}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border shadow-sm transition ${
                  includeScreenshot ? "bg-[#1877F2] border-[#1877F2] text-white" : "bg-white border-[#E5E7EB] hover:border-[#1877F2]/50"
                } disabled:opacity-60`}
              >
                {includeScreenshot && <Check size={14} strokeWidth={3} />}
              </button>
              <span className="text-[15px] leading-[22.5px] text-[#1F2937]"> {lang.includeScreenshot || "Attach current view (excluding this form)"}</span>
              <button
                type="button"
                onClick={() => !viewDisabled && setPreviewOpen(true)}
                disabled={viewDisabled}
                className={`pl-1 text-[15px] font-medium leading-[22.5px] transition ${viewDisabled ? "text-slate-300 cursor-not-allowed" : "text-[#1A73E8] hover:underline"}`}
              >
                {lang.viewScreenshot || "View screenshot"}
              </button>
              {isCapturing && <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#6B7280]"><Loader2 size={12} className="animate-spin" /> {lang.capturing || "Đang chụp..."}</span>}
            </div>
            <p className="pl-8 text-[12px] leading-5 text-[#6B7280]">
              {lang.includeScreenshotHint || "Ảnh chỉ lấy nền phía sau, form vẫn giữ nguyên khi chụp."}
            </p>
          </div>

          {/* Q7: thumbnail + Chụp lại / Xóa. Q8: ghi chú video có thể đen */}
          {(screenshotDataUrl || screenshotUrl) && (
            <div className="flex flex-col gap-2 rounded-2xl border border-[#E5E7EB] bg-gray-50 p-3">
              <img
                src={screenshotDataUrl || screenshotUrl}
                alt="Screenshot preview"
                className="max-h-40 w-full rounded-xl border border-slate-200 object-contain bg-white"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetakeScreenshot}
                  disabled={isCapturing || isLoading}
                  className="rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-[13px] font-medium text-[#374151] shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
                >
                  Chụp lại
                </button>
                <button
                  type="button"
                  onClick={handleRemoveScreenshot}
                  disabled={isCapturing || isLoading}
                  className="rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-[13px] font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
                >
                  Xóa ảnh
                </button>
              </div>
              <p className="text-[12px] leading-5 text-[#6B7280]">
                Phần video có thể hiển thị đen do giới hạn trình duyệt — header/chat/lỗi UI vẫn đủ để debug.
              </p>
            </div>
          )}
        </form>
      </Modal>

      {/* Screenshot Preview */}
      {previewOpen && (screenshotDataUrl || screenshotUrl) && (
        <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} className="md:max-w-3xl" title={lang.screenshotPreviewTitle || "Xem trước ảnh chụp"}>
          <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
            <img src={screenshotDataUrl || screenshotUrl} alt="Screenshot preview" className="max-h-[70vh] w-full object-contain rounded-lg" />
          </div>
        </Modal>
      )}

      {/* Confirm discard */}
      {showConfirm && (
        <Modal open={showConfirm} onClose={cancelDiscard} className="md:max-w-md" title={lang.closeConfirmTitle || "Bỏ báo cáo?"}>
          <p className="text-sm text-slate-600">{lang.closeConfirmDesc || "Bạn đã nhập nội dung, đóng bây giờ sẽ mất dữ liệu đã nhập."}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={cancelDiscard} className="rounded-full border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50">
              {lang.closeConfirmKeep || "Tiếp tục chỉnh sửa"}
            </button>
            <button type="button" onClick={confirmDiscard} className="rounded-full bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700">
              {lang.closeConfirmDiscard || "Bỏ thay đổi"}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
