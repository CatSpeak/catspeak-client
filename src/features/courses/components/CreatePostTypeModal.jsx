import React, { useState, useEffect } from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { FileText, CheckSquare, X, Plus } from "lucide-react"

const CreatePostTypeModal = ({ open, onClose, onSelect }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const ce = c.createExam || {}
  const dict = t.courses.lectureHall.modals?.addActivity || {}
  
  const [selectedType, setSelectedType] = useState(null)

  useEffect(() => {
    if (open) setSelectedType(null)
  }, [open])

  const options = [
    {
      id: "assignment",
      title: ce.postTypeModalAssignmentTitle || "Bài tập",
      description: ce.postTypeModalAssignmentDesc || "Tạo bài tập tự luận hoặc nộp file cho học sinh",
      icon: FileText,
      badgeColor: "bg-[#FFDAD6] text-[#93000A]",
    },
    {
      id: "exam",
      title: ce.postTypeModalExamTitle || "Bài kiểm tra",
      description: ce.postTypeModalExamDesc || "Tạo bài kiểm tra trắc nghiệm, tự luận có tính điểm và hẹn giờ",
      icon: CheckSquare,
      badgeColor: "bg-[#FFDCBD] text-[#2C1600]",
    },
  ]

  const handleSubmit = () => {
    if (selectedType) {
      onSelect(selectedType)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="w-full relative flex items-center justify-center">
          <h2 className="text-[22px] md:text-[28px] font-medium text-[#191C1D]">
            {ce.postTypeModalTitle || "Tạo hoạt động mới"}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            className="absolute right-0 -mr-2 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
      }
      showCloseButton={false}
      fullScreenOnMobile={false}
      className="md:max-w-2xl rounded-[24px] h-auto max-h-[95vh] md:max-h-[800px]"
      headerClassName="flex items-center justify-between px-6 md:px-10 py-6 md:py-8"
      bodyClassName="px-6 md:px-10 pb-10 flex-1 overflow-y-auto"
      footer={
        <div className="flex justify-between gap-4 px-1 pb-1 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[52px] rounded-full border border-[#990011] text-[#990011] font-medium text-base flex justify-center items-center gap-2 hover:bg-red-50 transition-colors"
          >
            {dict.cancel || "Hủy"} <X size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedType}
            className="flex-1 h-[52px] rounded-full bg-[#990011] text-white font-medium text-base flex justify-center items-center gap-2 hover:bg-[#80000e] transition-colors disabled:opacity-70"
          >
            {dict.add || "Tạo hoạt động"} <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {options.map((opt) => {
          const isChecked = selectedType === opt.id
          const Icon = opt.icon
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedType(opt.id)}
              className={`border rounded-lg p-5 flex items-center justify-between transition-all cursor-pointer ${
                isChecked
                  ? "border-[#990011] bg-red-50/20 shadow-sm"
                  : "border-[#E2E2E2] bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <input
                  type="radio"
                  checked={isChecked}
                  onChange={() => setSelectedType(opt.id)}
                  className="w-[18px] h-[18px] accent-[#990011] rounded-full border-gray-300 flex-shrink-0 cursor-pointer"
                />
                
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap min-h-5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${opt.badgeColor}`}>
                      <Icon size={12} /> {opt.title}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-[#191C1D]">
                    {opt.description}
                  </h5>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export default CreatePostTypeModal
