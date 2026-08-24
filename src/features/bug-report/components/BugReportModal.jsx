import React from "react"
import { Bug, ChevronDown, Image as ImageIcon, UploadCloud, Trash2, Loader2 } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Dropdown from "@/shared/components/ui/Dropdown"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useBugReportForm, MAX_BUG_IMAGES } from "../hooks/useBugReportForm"

export default function BugReportModal({
  isOpen,
  open,
  onClose,
  initialTitle = "",
  initialDescription = "",
}) {
  const isModalOpen = Boolean(open ?? isOpen)

  const {
    lang,
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    screenshots,
    isUploadingImage,
    fileInputRef,
    isLoading,
    categoryOptions,
    handleFileSelect,
    removeScreenshot,
    handleSubmit,
  } = useBugReportForm({
    isOpen: isModalOpen,
    initialTitle,
    initialDescription,
    onClose,
  })

  return (
    <Modal
      open={isModalOpen}
      onClose={onClose}
      fullScreenOnMobile={true}
      className="md:max-w-xl"
      title={
        <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
          <div className="p-2.5 rounded-2xl bg-red-50 text-cath-red-700 border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <Bug className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#2e2e2e] text-lg leading-snug">
              {lang.modalTitle || "Báo cáo sự cố / Góp ý lỗi"}
            </h3>
            <p className="text-xs text-[#7A7574] font-normal mt-0.5 break-words">
              {lang.modalSubtitle || "Gặp lỗi hoặc giao diện không hoạt động đúng? Hãy gửi phản hồi để đội ngũ kỹ thuật khắc phục ngay."}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <PillButton
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {lang.cancel || "Hủy"}
          </PillButton>
          <PillButton
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            loadingText={lang.submitting || "Đang gửi..."}
          >
            {lang.submit || "Gửi báo cáo"}
          </PillButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-[#515151] mb-1.5">
            {lang.categoryLabel || "Phân loại sự cố"}
          </label>
          <Dropdown
            options={categoryOptions}
            value={category}
            onChange={(val) => setCategory(val)}
            dropdownClassName="w-full min-w-0 max-w-full overflow-hidden"
            className="w-full"
            trigger={(isOpenDropdown, selected, toggle) => (
              <button
                type="button"
                onClick={toggle}
                className={`w-full h-11 px-3.5 text-sm rounded-xl bg-white border text-left flex items-center justify-between transition-colors focus:outline-none cursor-pointer ${
                  isOpenDropdown
                    ? "border-cath-red-700 ring-1 ring-cath-red-700/15"
                    : "border-[#E5E5E5] hover:border-cath-red-700"
                }`}
              >
                <span className="text-[#2e2e2e] font-medium">
                  {selected?.label || "Chọn phân loại"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#7A7574] shrink-0 transition-transform duration-200 ${
                    isOpenDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          />
        </div>

        {/* Title */}
        <TextInput
          label={lang.titleLabel || "Tiêu đề ngắn gọn về sự cố"}
          required
          placeholder={lang.titlePlaceholder || "Ví dụ: Không tải được danh sách bài tập, lỗi khi vào phòng học..."}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="rounded-xl"
          className="!h-11 text-sm bg-white"
          labelClassName="font-semibold text-[#515151]"
        />

        {/* Description */}
        <TextInput
          label={lang.descLabel || "Mô tả chi tiết sự cố"}
          required
          multiline
          placeholder={lang.descPlaceholder || "Mô tả các bước bạn đã làm trước khi bị lỗi, thông báo lỗi xuất hiện (nếu có)..."}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="rounded-xl"
          className="text-sm bg-white min-h-[110px] max-h-[180px] overflow-y-auto !py-3 !px-3.5 leading-relaxed"
          labelClassName="font-semibold text-[#515151]"
        />

        {/* Screenshots / Attachments */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#515151] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#7A7574]" />
              {lang.screenshotsLabel || "Hình ảnh minh họa sự cố"}
            </label>
            <span className="text-[11px] text-[#7A7574]">
              {screenshots.length}/{MAX_BUG_IMAGES}
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Thumbnails grid & Upload Trigger */}
          <div className="grid grid-cols-3 gap-3">
            {screenshots.map((imgSrc, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-xl border border-[#E5E5E5] overflow-hidden bg-gray-50 group"
              >
                <img
                  src={imgSrc}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title={lang.removeImage || "Xóa ảnh"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {screenshots.length < MAX_BUG_IMAGES && (
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-[#E5E5E5] hover:border-cath-red-700 hover:bg-red-50/20 transition-all flex flex-col items-center justify-center gap-1.5 text-[#7A7574] hover:text-cath-red-700 cursor-pointer p-2 text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-cath-red-700" />
                    <span className="text-[11px] font-medium leading-tight">Đang tải ảnh lên...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-tight">
                      {lang.screenshotsHint || "Tải ảnh lên hoặc bấm Ctrl+V để dán"}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#7A7574] mt-1.5">
            {lang.screenshotsLimit || "Tối đa 3 ảnh (mỗi ảnh ≤ 5MB), hỗ trợ chụp màn hình dán Ctrl+V."}
          </p>
        </div>
      </form>
    </Modal>
  )
}
