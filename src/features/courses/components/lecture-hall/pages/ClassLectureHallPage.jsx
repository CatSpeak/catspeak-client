import React, { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "react-hot-toast"
import { PillButton } from "@/shared/components/ui/buttons"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import {
  useGetCurriculumByClassQuery,
  useDeleteCurriculumSectionMutation,
  useUpdateCurriculumSectionMutation,
  useUploadMaterialToSectionMutation,
  useAddLinkToSectionMutation,
  useCreateBulletinBoardMutation,
  useAddAssignmentToSectionMutation,
  useAddQuizToSectionMutation,
  useChangeVisibilityOfItemMutation,
  useDeleteItemInCurriculumMutation
} from "@/store/api/coursesApi"
import SectionCard from "../components/curriculum/SectionCard"
import CreateBulletinBoardModal from "../components/modals/CreateBulletinBoardModal"
import AddMaterialModal from "../components/modals/AddMaterialModal"
import AddActivityModal from "../components/modals/AddActivityModal"
import AddLinkModal from "../components/modals/AddLinkModal"
import SectionModal from "../components/modals/SectionModal"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
const ClassLectureHallPage = ({ id, isStudent }) => {
  const {
    data: apiSections = [],
    isLoading,
    isError,
    error,
  } = useGetCurriculumByClassQuery(id, { skip: !id })

  const [deleteSection] = useDeleteCurriculumSectionMutation()
  const [updateSection] = useUpdateCurriculumSectionMutation()
  const [uploadMaterial] = useUploadMaterialToSectionMutation()
  const [addLink] = useAddLinkToSectionMutation()
  const [createBulletinBoard] = useCreateBulletinBoardMutation()
  const [addAssignment] = useAddAssignmentToSectionMutation()
  const [addQuiz] = useAddQuizToSectionMutation()
  const [changeItemVisibility] = useChangeVisibilityOfItemMutation()
  const [deleteItem] = useDeleteItemInCurriculumMutation()

  const [sectionsOverride, setSectionsOverride] = useState(null)
  const sections = sectionsOverride ?? apiSections

  const updateSections = (updater) => {
    setSectionsOverride((prev) => {
      const current = prev ?? apiSections
      return typeof updater === "function" ? updater(current) : updater
    })
  }
  // Active Modal state
  const [activeModal, setActiveModal] = useState(null) // null | 'bulletin-board' | 'material' | 'assignment' | 'link'
  const [targetSectionId, setTargetSectionId] = useState(null)
  const [targetSectionName, setTargetSectionName] = useState("")

  // Section Modal State
  const [sectionModal, setSectionModal] = useState({
    open: false,
    mode: "create", // "create" | "edit"
    sectionId: null,
    name: "",
    description: "",
    isVisibleToStudents: true,
  })

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: "section", // "section" | "item"
    sectionId: null,
    itemId: null,
  })

  // Open Modal for adding content to a section
  const handleOpenAddItemModal = (sectionId, itemType) => {
    const section = sections.find((s) => s.id === sectionId)
    setTargetSectionId(sectionId)
    setTargetSectionName(section ? section.name : "Section")
    setActiveModal(itemType) // "bulletin-board" | "material" | "assignment" | "link"
  }

  // --- SUBMIT HANDLERS FOR MODALS ---
  // 1. Add Bulletin Board
  const handleSaveBulletinBoard = async (data) => {
    if (id) {
      try {
        await createBulletinBoard({
          classId: id,
          sectionId: targetSectionId,
          title: data.title,
          content: data.content,
          allowStudentReply: data.allowReply,
          isVisibleToStudents: data.isVisible,
        }).unwrap()
        toast.success("Đã tạo bảng tin mới!")
        setSectionsOverride(null)
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Lỗi khi tạo bảng tin.")
      }
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        type: "announcement",
        title: data.title,
        meta: `Bài viết mới nhất: ${new Date().toLocaleDateString("vi-VN")}`,
        metaType: "clock",
        isVisibleToStudents: data.isVisible,
        content: data.content,
        allowReply: data.allowReply,
      }
      updateSections((prev) =>
        prev.map((sec) =>
          sec.id === targetSectionId
            ? { ...sec, items: [newItem, ...sec.items] }
            : sec
        )
      )
      toast.success("Đã tạo bảng tin mới!")
    }
  }

  // 2. Add Material
  const handleSaveMaterial = async (data) => {
    if (id) {
      if (!data.files || data.files.length === 0) {
        toast.error("Vui lòng chọn ít nhất một file học liệu.")
        return
      }
      try {
        await uploadMaterial({
          classId: id,
          sectionId: targetSectionId,
          title: data.title,
          files: data.files,
          isVisibleToStudents: data.isVisible,
        }).unwrap()
        toast.success("Đã thêm học liệu thành công!")
        setSectionsOverride(null)
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Lỗi khi thêm học liệu.")
      }
    } else {
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
        isVisibleToStudents: data.isVisible,
      }

      updateSections((prev) =>
        prev.map((sec) =>
          sec.id === targetSectionId
            ? { ...sec, items: [...sec.items, newItem] }
            : sec
        )
      )
      toast.success("Đã thêm học liệu thành công!")
    }
  }

  // 3. Add Activity (Assignment/Quiz)
  const handleSaveActivities = async (activities) => {
    if (!activities || activities.length === 0) return

    if (id) {
      try {
        await Promise.all(
          activities.map((act) => {
            if (act._activityType === "quiz") {
              return addQuiz({
                classId: id,
                sectionId: targetSectionId,
                quizId: act.id,
              }).unwrap()
            }
            return addAssignment({
              classId: id,
              sectionId: targetSectionId,
              assignmentId: act.id,
            }).unwrap()
          })
        )
        toast.success(`Đã thêm ${activities.length} hoạt động học tập!`)
        setSectionsOverride(null)
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Lỗi khi thêm hoạt động học tập.")
      }
    } else {
      const newItems = activities.map((act) => ({
        id: `item-${Date.now()}-${act.id}`,
        type: act._activityType === "quiz" ? "quiz" : "assignment",
        title: act.title,
        meta: `Hạn nộp: ${act.dueDate}`,
        metaType: "clock",
        isVisibleToStudents: true,
      }))

      updateSections((prev) =>
        prev.map((sec) =>
          sec.id === targetSectionId
            ? { ...sec, items: [...sec.items, ...newItems] }
            : sec
        )
      )
      toast.success(`Đã thêm ${activities.length} hoạt động học tập!`)
    }
  }

  // 4. Add Link
  const handleSaveLink = async (data) => {
    if (id) {
      try {
        await addLink({
          classId: id,
          sectionId: targetSectionId,
          title: data.title,
          url: data.url,
          isVisibleToStudents: data.isVisible,
        }).unwrap()
        toast.success("Đã thêm liên kết mới!")
        setSectionsOverride(null)
      } catch (err) {
        toast.error(err?.data?.message || err?.message || "Lỗi khi thêm liên kết.")
      }
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        type: "link",
        title: data.title,
        meta: data.url || "",
        metaType: "none",
        isVisibleToStudents: data.isVisible,
      }

      updateSections((prev) =>
        prev.map((sec) =>
          sec.id === targetSectionId
            ? { ...sec, items: [...sec.items, newItem] }
            : sec
        )
      )
      toast.success("Đã thêm liên kết mới!")
    }
  }

  // --- SECTION HANDLERS ---
  const handleOpenAddSection = () => {
    setSectionModal({
      open: true,
      mode: "create",
      sectionId: null,
      name: "",
      description: "",
      isVisibleToStudents: true,
    })
  }

  const handleOpenEditSection = (section) => {
    setSectionModal({
      open: true,
      mode: "edit",
      sectionId: section.id,
      name: section.name,
      description: section.description || "",
      isVisibleToStudents: section.isVisibleToStudents ?? true,
    })
  }

  const handleSaveSectionModal = async (e) => {
    e.preventDefault()
    if (!sectionModal.name.trim()) {
      toast.error("Vui lòng nhập tên section")
      return
    }

    if (sectionModal.mode === "create") {
      const newSection = {
        id: `sec-${Date.now()}`,
        name: sectionModal.name.trim(),
        description: sectionModal.description.trim(),
        isVisibleToStudents: sectionModal.isVisibleToStudents,
        items: [],
      }
      setSectionsOverride((prev) => [...(prev ?? apiSections), newSection])
      toast.success("Đã thêm section mới!")
    } else if (sectionModal.mode === "edit") {
      if (id) {
        try {
          await updateSection({
            classId: id,
            sectionId: sectionModal.sectionId,
            name: sectionModal.name.trim(),
            description: sectionModal.description.trim() || null,
            isVisibleToStudents: sectionModal.isVisibleToStudents,
          }).unwrap()
          setSectionsOverride(null)
          toast.success("Đã cập nhật section!")
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Lỗi khi cập nhật section.")
          return
        }
      } else {
        updateSections((prev) =>
          prev.map((sec) =>
            sec.id === sectionModal.sectionId
              ? {
                  ...sec,
                  name: sectionModal.name.trim(),
                  description: sectionModal.description.trim(),
                  isVisibleToStudents: sectionModal.isVisibleToStudents,
                }
              : sec
          )
        )
        toast.success("Đã cập nhật section!")
      }
    }

    setSectionModal({ open: false, mode: "create", sectionId: null, name: "", description: "", isVisibleToStudents: true })
  }

  const handleToggleSectionVisibility = async (sectionId) => {
    const section = sections.find((sec) => sec.id === sectionId)
    if (!section) return

    if (!id) {
      updateSections((prev) =>
        prev.map((sec) =>
          sec.id === sectionId ? { ...sec, isVisibleToStudents: !sec.isVisibleToStudents } : sec
        )
      )
      toast.success("Đã cập nhật trạng thái hiển thị section")
      return
    }

    try {
      await updateSection({
        classId: id,
        sectionId: sectionId,
        name: section.name,
        description: section.description || null,
        isVisibleToStudents: !section.isVisibleToStudents,
      }).unwrap()
      setSectionsOverride(null)
      toast.success("Đã cập nhật trạng thái hiển thị section")
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Không thể cập nhật section. Vui lòng thử lại.")
    }
  }

  const handleDeleteSection = (sectionId) => {
    setDeleteConfirm({
      open: true,
      type: "section",
      sectionId: sectionId,
      itemId: null,
    })
  }

  // --- ITEM HANDLERS ---
  const handleToggleItemVisibility = async (sectionId, itemId) => {
    const section = sections.find((sec) => sec.id === sectionId)
    const item = section?.items?.find((it) => it.id === itemId)
    if (!item) return

    if (!id) {
      updateSections((prev) =>
        prev.map((sec) =>
          sec.id === sectionId
            ? {
              ...sec,
              items: sec.items.map((it) =>
                it.id === itemId ? { ...it, isVisibleToStudents: !it.isVisibleToStudents } : it
              ),
            }
            : sec
        )
      )
      toast.success("Đã cập nhật trạng thái bài học")
      return
    }

    try {
      await changeItemVisibility({
        classId: id,
        itemId: itemId,
        isVisibleToStudents: !item.isVisibleToStudents,
      }).unwrap()
      setSectionsOverride(null)
      toast.success("Đã cập nhật trạng thái bài học")
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Lỗi khi cập nhật trạng thái bài học")
    }
  }

  const handleDeleteItem = (sectionId, itemId) => {
    setDeleteConfirm({
      open: true,
      type: "item",
      sectionId: sectionId,
      itemId: itemId,
    })
  }

  const handleConfirmDelete = async () => {
    const { type, sectionId, itemId } = deleteConfirm
    if (type === "section") {
      if (!id) {
        updateSections((prev) => prev.filter((sec) => sec.id !== sectionId))
        toast.success("Đã xóa section")
      } else {
        try {
          await deleteSection({ classId: id, sectionId: sectionId }).unwrap()
          setSectionsOverride(null)
          toast.success("Đã xóa section")
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Không thể xóa section. Vui lòng thử lại.")
        }
      }
    } else if (type === "item") {
      if (!id) {
        updateSections((prev) =>
          prev.map((sec) =>
            sec.id === sectionId
              ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) }
              : sec
          )
        )
        toast.success("Đã xóa bài học")
      } else {
        try {
          await deleteItem({
            classId: id,
            itemId: itemId,
          }).unwrap()
          setSectionsOverride(null)
          toast.success("Đã xóa bài học")
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Lỗi khi xóa bài học")
        }
      }
    }
    setDeleteConfirm({ open: false, type: "section", sectionId: null, itemId: null })
  }

  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-sm text-[#EF4444] border border-dashed border-[#FCA5A5] rounded-xl bg-[#FEF2F2]">
          {error?.data?.message || error?.message || "Không thể tải danh sách section. Vui lòng thử lại."}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Sections List */}
          <div className="space-y-6">
            {sections.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#6B7280] border border-dashed border-[#E2E2E2] rounded-xl bg-white">
                Chưa có section nào. Hãy tạo section đầu tiên cho lớp học này.
              </div>
            ) : (
              sections.map((section, secIdx) => (
                <SectionCard
                  key={section.id}
                  classId={id}
                  section={section}
                  secIdx={secIdx}
                  totalSections={sections.length}
                  isStudent={isStudent}
                  onOpenAddItem={handleOpenAddItemModal}
                  onEditSection={handleOpenEditSection}
                  onToggleSectionVisibility={handleToggleSectionVisibility}
                  onDeleteSection={handleDeleteSection}
                  onToggleItemVisibility={handleToggleItemVisibility}
                  onDeleteItem={handleDeleteItem}
                />
              ))
            )}
          </div>

          {/* Add New Section Button */}
          {!isStudent && (
            <div className="flex justify-center">
              <PillButton
                variant="outline"
                onClick={handleOpenAddSection}
                endIcon={<Plus size={10} className="text-primary" />}
                className="w-full font-semibold text-base"
              >
                Tạo section mới
              </PillButton>
            </div>
          )
          }
        </>
      )}

      {/* --- ALL CONNECTED MODALS --- */}
      {/* 1. Create Feed / Announcement Modal */}
      <CreateBulletinBoardModal
        open={activeModal === "announcement"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSaveBulletinBoard}
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
        classId={id}
      />

      {/* 4. Add Link Modal */}
      <AddLinkModal
        open={activeModal === "link"}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSaveLink}
        sessionName={targetSectionName}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirm.type === "section" ? "Xác nhận xoá section" : "Xác nhận xoá bài học"}
        message={deleteConfirm.type === "section" ? "Bạn có chắc chắn muốn xóa section này? Hành động này không thể hoàn tác." : "Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác."}
        cancelText="Hủy"
        confirmText="Xóa"
        confirmVariant="destructive"
      />

      {/* 5. Section Modal */}
      <SectionModal
        sectionModal={sectionModal}
        setSectionModal={setSectionModal}
        onSaveSection={handleSaveSectionModal}
        onSectionCreated={() => setSectionsOverride(null)}
        onSectionUpdated={() => setSectionsOverride(null)}
        classId={id}
      />
    </div >
  )
}

export default ClassLectureHallPage
