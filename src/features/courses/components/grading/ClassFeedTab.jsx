import React, { useState } from "react"
import { Pencil, PlusCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PillButton } from "@/shared/components/ui/buttons"
import SectionCard from "./SectionCard"
import CreateFeedModal from "./CreateFeedModal"
import AddMaterialModal from "./AddMaterialModal"
import AddActivityModal from "./AddActivityModal"
import AddLinkModal from "./AddLinkModal"
import SectionModal from "./SectionModal"
import { MOCK_SECTIONS } from "./mockData"

const ClassFeedTab = ({ id, isStudent }) => {
  const { t } = useLanguage()

  // Main State for Sections and Editing
  const [sections, setSections] = useState(MOCK_SECTIONS)
  const [sectionsBackup, setSectionsBackup] = useState(MOCK_SECTIONS)
  const [isEdit, setIsEdit] = useState(false)

  // Active Modal state
  const [activeModal, setActiveModal] = useState(null) // null | 'announcement' | 'material' | 'assignment' | 'link'
  const [targetSectionId, setTargetSectionId] = useState(null)
  const [targetSectionName, setTargetSectionName] = useState("")

  // Section Modal State
  const [sectionModal, setSectionModal] = useState({
    open: false,
    mode: "create", // "create" | "edit"
    sectionId: null,
    title: "",
    subtitle: "",
    isHidden: false,
  })

  // Edit Controls
  const handleStartEdit = () => {
    setSectionsBackup(JSON.parse(JSON.stringify(sections)))
    setIsEdit(true)
  }

  const handleCancelEdit = () => {
    setSections(JSON.parse(JSON.stringify(sectionsBackup)))
    setIsEdit(false)
    toast.success("Đã hủy các thay đổi!")
  }

  const handleSaveEdit = () => {
    setSectionsBackup(JSON.parse(JSON.stringify(sections)))
    setIsEdit(false)
    toast.success("Đã lưu thay đổi nội dung khóa học thành công!")
  }

  // Open Modal for adding content to a section
  const handleOpenAddItemModal = (sectionId, itemType) => {
    const section = sections.find((s) => s.id === sectionId)
    setTargetSectionId(sectionId)
    setTargetSectionName(section ? section.title : "Section")
    setActiveModal(itemType) // "announcement" | "material" | "assignment" | "link"
  }

  // --- SUBMIT HANDLERS FOR MODALS ---
  // 1. Create Feed / Announcement
  const handleSaveFeedPost = (data) => {
    const newItem = {
      id: `item-${Date.now()}`,
      type: "announcement",
      title: data.title,
      meta: `Bài viết mới nhất: ${new Date().toLocaleDateString("vi-VN")}`,
      metaType: "clock",
      isHidden: !data.isVisible,
      content: data.content,
      allowReply: data.allowReply,
    }
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === targetSectionId
          ? { ...sec, items: [newItem, ...sec.items] }
          : sec
      )
    )
    toast.success("Đã tạo bảng tin mới!")
  }

  // 2. Add Material
  const handleSaveMaterial = (data) => {
    const fileExt = data.file?.name
      ? data.file.name.split(".").pop().toUpperCase()
      : "PDF"
    const fileSize = data.file?.size
      ? `${(data.file.size / (1024 * 1024)).toFixed(1)} MB`
      : "2.4 MB"

    const newItem = {
      id: `item-${Date.now()}`,
      type: "material",
      title: data.title,
      meta: `${fileExt} • ${fileSize}`,
      metaType: "file",
      isHidden: !data.isVisible,
    }

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === targetSectionId
          ? { ...sec, items: [...sec.items, newItem] }
          : sec
      )
    )
    toast.success("Đã thêm học liệu thành công!")
  }

  // 3. Add Activity (Assignment/Quiz/Forum)
  const handleSaveActivities = (activities) => {
    if (!activities || activities.length === 0) return
    const newItems = activities.map((act) => ({
      id: `item-${Date.now()}-${act.id}`,
      type: "assignment",
      title: act.title,
      meta: `Hạn nộp: ${act.dueDate}`,
      metaType: "clock",
      isHidden: false,
    }))

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === targetSectionId
          ? { ...sec, items: [...sec.items, ...newItems] }
          : sec
      )
    )
    toast.success(`Đã thêm ${activities.length} hoạt động học tập!`)
  }

  // 4. Add Link
  const handleSaveLink = (data) => {
    const newItem = {
      id: `item-${Date.now()}`,
      type: "link",
      title: data.title,
      meta: data.url || "",
      metaType: "none",
      isHidden: !data.isVisible,
    }

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === targetSectionId
          ? { ...sec, items: [...sec.items, newItem] }
          : sec
      )
    )
    toast.success("Đã thêm liên kết mới!")
  }

  // --- SECTION / CHAPTER HANDLERS ---
  const handleOpenAddSection = () => {
    setSectionModal({
      open: true,
      mode: "create",
      sectionId: null,
      title: "",
      subtitle: "",
      isHidden: false,
    })
  }

  const handleOpenEditSection = (chapter) => {
    setSectionModal({
      open: true,
      mode: "edit",
      sectionId: chapter.id,
      title: chapter.title,
      subtitle: chapter.subtitle || "",
      isHidden: chapter.isHidden || false,
    })
  }

  const handleSaveSectionModal = (e) => {
    e.preventDefault()
    if (!sectionModal.title.trim()) {
      toast.error("Vui lòng nhập tên section")
      return
    }

    if (sectionModal.mode === "create") {
      const newSection = {
        id: `sec-${Date.now()}`,
        title: sectionModal.title.trim(),
        subtitle: sectionModal.subtitle.trim(),
        isHidden: sectionModal.isHidden,
        items: [],
      }
      setSections((prev) => [...prev, newSection])
      toast.success("Đã thêm section mới!")
    } else {
      setSections((prev) =>
        prev.map((sec) =>
          sec.id === sectionModal.sectionId
            ? {
              ...sec,
              title: sectionModal.title.trim(),
              subtitle: sectionModal.subtitle.trim(),
              isHidden: sectionModal.isHidden,
            }
            : sec
        )
      )
      toast.success("Đã cập nhật section!")
    }

    setSectionModal({ open: false, mode: "create", sectionId: null, title: "", subtitle: "", isHidden: false })
  }

  const handleToggleHideChapter = (chapterId) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === chapterId ? { ...sec, isHidden: !sec.isHidden } : sec
      )
    )
    toast.success("Đã cập nhật trạng thái hiển thị section")
  }

  const handleDeleteChapter = (chapterId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa section này?")) {
      setSections((prev) => prev.filter((sec) => sec.id !== chapterId))
      toast.success("Đã xóa section")
    }
  }

  const handleMoveChapter = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return
    const updated = [...sections]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setSections(updated)
  }

  // --- ITEM HANDLERS ---
  const handleToggleHideItem = (chapterId, itemId) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === chapterId
          ? {
            ...sec,
            items: sec.items.map((it) =>
              it.id === itemId ? { ...it, isHidden: !it.isHidden } : it
            ),
          }
          : sec
      )
    )
    toast.success("Đã cập nhật trạng thái bài học")
  }

  const handleDeleteItem = (chapterId, itemId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      setSections((prev) =>
        prev.map((sec) =>
          sec.id === chapterId
            ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) }
            : sec
        )
      )
      toast.success("Đã xóa bài học")
    }
  }

  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      {/* Top Edit Bar */}
      {!isStudent && (
        <div className="flex justify-end">
          {isEdit ? (
            <div className="flex items-center gap-3">
              <PillButton
                variant="outline"
                onClick={handleCancelEdit}
                className="!rounded-xl"
              >
                Hủy
              </PillButton>
              <PillButton onClick={handleSaveEdit} className="!rounded-xl">
                Lưu
              </PillButton>
            </div>
          ) : (
            <PillButton
              onClick={handleStartEdit}
              startIcon={<Pencil size={14} />}
              className="rounded-xl"
            >
              Chỉnh sửa
            </PillButton>
          )}
        </div>
      )}

      {/* Chapters / Sections List */}
      <div className="space-y-6">
        {sections.map((chapter, secIdx) => (
          <SectionCard
            key={chapter.id}
            chapter={chapter}
            secIdx={secIdx}
            totalSections={sections.length}
            isEdit={isEdit}
            isStudent={isStudent}
            onOpenAddItem={handleOpenAddItemModal}
            onEditChapter={handleOpenEditSection}
            onToggleHideChapter={handleToggleHideChapter}
            onDeleteChapter={handleDeleteChapter}
            onMoveChapter={handleMoveChapter}
            onToggleHideItem={handleToggleHideItem}
            onDeleteItem={handleDeleteItem}
          />
        ))}
      </div>

      {/* Add New Section Button */}
      {isEdit && !isStudent && (
        <div className="flex justify-center pt-2">
          <PillButton
            variant="secondary-no-outline"
            onClick={handleOpenAddSection}
            startIcon={<PlusCircle size={18} className="text-[#5B403C]" />}
            className="rounded-xl font-semibold text-sm px-8 py-4 border-2 border-[#E2E2E2] min-w-[240px] border-dashed hover:border-[#5B403C]"
            textColor={"#5B403C"}
            bgColor="white"
          >
            Tạo section mới
          </PillButton>
        </div>
      )}

      {/* --- ALL CONNECTED MODALS --- */}
      {/* 1. Create Feed / Announcement Modal */}
      <CreateFeedModal
        open={activeModal === "announcement"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSaveFeedPost}
        sessionName={targetSectionName}
      />

      {/* 2. Add Material Modal */}
      <AddMaterialModal
        open={activeModal === "material"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSaveMaterial}
        sessionName={targetSectionName}
      />

      {/* 3. Add Activity Modal */}
      <AddActivityModal
        open={activeModal === "assignment"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSaveActivities}
        sessionName={targetSectionName}
      />

      {/* 4. Add Link Modal */}
      <AddLinkModal
        open={activeModal === "link"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSaveLink}
        sessionName={targetSectionName}
      />

      {/* 5. Section Modal */}
      <SectionModal
        sectionModal={sectionModal}
        setSectionModal={setSectionModal}
        onSaveSection={handleSaveSectionModal}
      />
    </div>
  )
}

export default ClassFeedTab
