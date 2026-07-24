import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { Checkbox, TextInput } from "@/shared/components/ui/inputs"
import { Search, ChevronDown, FileText, CheckSquare, MessageSquare } from "lucide-react"
import { MOCK_ACTIVITIES } from "./mockData"

const AddActivityModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  sessionName = "Buổi 1: Introduction & Greetings",
}) => {
  const [activeTab, setActiveTab] = useState("all") // "all" | "submission" | "quiz"
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const filteredActivities = MOCK_ACTIVITIES.filter((act) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "submission" && act.type === "submission") ||
      (activeTab === "quiz" && act.type === "quiz")

    const matchesSearch = act.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  const handleSubmit = () => {
    const chosenActivities = MOCK_ACTIVITIES.filter((a) =>
      selectedIds.includes(a.id)
    )
    onSubmit(chosenActivities)
    onClose()
  }

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "submission":
        return "bg-[#FFDAD6] text-[#93000A]"
      case "quiz":
        return "bg-[#FFDCBD] text-[#2C1600]"
      case "forum":
      default:
        return "bg-[#FFDBCF] text-[#380D00]"
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm hoạt động học tập"
      className="md:max-w-[900px] rounded-xl"
      headerClassName="flex items-center justify-between px-6 py-4 border-b border-[#E2E2E2]"
      bodyClassName="p-6 flex-1 overflow-y-auto border-b border-[#E2E2E2]"
      footer={
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 flex-wrap">
          <div className="relative dropdown-container">
            <PillButton
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              endIcon={<ChevronDown size={14} />}
            >
              Tạo hoạt động mới
            </PillButton>

            {isCreateOpen && (
              <div className="absolute left-0 bottom-10 z-30 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 text-xs text-gray-700 font-medium space-y-1">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-xl"
                >
                  Tạo Bài nộp
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-xl"
                >
                  Tạo Bài kiểm tra
                </button>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <PillButton
              type="button"
              variant="outline"
              onClick={onClose}
              bgColor={"white"}
              textColor={"#72000d"}
              borderColor={"#E2E2E2"}
            >
              Hủy
            </PillButton>
            <PillButton
              type="button"
              onClick={handleSubmit}
            >
              Thêm các hoạt động đã chọn ({selectedIds.length})
            </PillButton>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Banner session info */}
        <div className="bg-[#F9FAFB] text-[#4B5563] text-sm p-3 rounded-xl font-medium">
          Đang thêm vào: <span className="font-semibold text-[#111827]">{sessionName}</span>
        </div>

        {/* Filter Tabs & Search Bar Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left Tabs using standard button tags */}
          <div className="flex items-center bg-[#F3F4F5] p-1 rounded-xl gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer select-none ${activeTab === "all"
                ? "bg-white text-[#191C1D] shadow-xs"
                : "text-[#5B403C] hover:text-[#191C1D] bg-transparent"
                }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("submission")}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer select-none ${activeTab === "submission"
                ? "bg-white text-[#191C1D] shadow-xs"
                : "text-[#5B403C] hover:text-[#191C1D] bg-transparent"
                }`}
            >
              Bài nộp
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer select-none ${activeTab === "quiz"
                ? "bg-white text-[#191C1D] shadow-xs"
                : "text-[#5B403C] hover:text-[#191C1D] bg-transparent"
                }`}
            >
              Bài kiểm tra
            </button>
          </div>

          {/* Right Search Input */}
          <div className="relative max-w-[256px] w-full">
            <TextInput
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hoạt động..."
              className="rounded-xl !h-[40px] px-4 text-sm"
            />
          </div>
        </div>

        {/* Activity Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredActivities.map((act) => {
            const isChecked = selectedIds.includes(act.id)
            return (
              <div
                key={act.id}
                onClick={() => handleToggleSelect(act.id)}
                className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all ${isChecked
                  ? "border-cath-red-700 shadow-faq-card"
                  : "border-[#E2E2E2] bg-white hover:border-[#F3F4F5]"
                  }`}
              >
                {/* Checkbox & Left info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Checkbox
                    checked={isChecked}
                    onChange={() => { }}
                  />

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap min-h-5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${getTypeBadgeStyle(
                          act.type
                        )}`}
                      >
                        {act.type === "submission" && <FileText size={12} />}
                        {act.type === "quiz" && <CheckSquare size={10} />}
                        {act.type === "forum" && <MessageSquare size={10} />}
                        {act.typeLabel}
                      </span>

                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#E2E2E2] text-[#5B403C]">
                        {act.statusLabel}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-[#191C1D] truncate">
                      {act.title}
                    </h5>
                  </div>
                </div>

                {/* Right info (Due Date) */}
                <div className="text-right">
                  <span className="text-xs text-[#5B403C] block font-medium">
                    Hạn nộp
                  </span>
                  <span className="text-sm text-[#191C1D] font-normal">
                    {act.dueDate}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default AddActivityModal
