import React, { useState } from "react"
import { Plus, AlertCircle, FolderOpen } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { PillButton } from "@/shared/components/ui/buttons"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import {
  useGetCurriculumByClassQuery,
  useGetStudentCurriculumByClassQuery,
  useDeleteCurriculumSectionMutation,
  useUpdateCurriculumSectionMutation,
  useUploadMaterialToSectionMutation,
  useAddLinkToSectionMutation,
  useUpdateCurriculumLinkMutation,
  useCreateBulletinBoardMutation,
  useUpdateBulletinBoardMutation,
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

const generateTempId = () => `sec-${Date.now()}`;

const ClassLectureHallPage = ({ id, isStudent }) => {
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const dict = t.courses.lectureHall
  const sectionDict = dict.modals.section
  // Use the appropriate API based on role
  const teacherQuery = useGetCurriculumByClassQuery(id, { skip: !id || isStudent })
  const studentQuery = useGetStudentCurriculumByClassQuery(id, { skip: !id || !isStudent })
  const { data: apiSections = [], isLoading, isError } = isStudent ? studentQuery : teacherQuery

  // Teacher-only mutations (no-op for students)
  const [deleteSection] = useDeleteCurriculumSectionMutation()
  const [updateSection] = useUpdateCurriculumSectionMutation()
  const [uploadMaterial] = useUploadMaterialToSectionMutation()
  const [addLink] = useAddLinkToSectionMutation()
  const [updateLink] = useUpdateCurriculumLinkMutation()
  const [createBulletinBoard] = useCreateBulletinBoardMutation()
  const [updateBulletinBoard] = useUpdateBulletinBoardMutation()
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
  const [activeModal, setActiveModal] = useState(null) // null | 'announcement' | 'material' | 'assignment' | 'link'
  const [targetSectionId, setTargetSectionId] = useState(null)
  const [targetSectionName, setTargetSectionName] = useState("")
  const [editItemData, setEditItemData] = useState(null)

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
  const handleOpenAddItemModal = (sectionId, type) => {
    setTargetSectionId(sectionId)
    const targetSec = sections.find((s) => s.id === sectionId)
    setTargetSectionName(targetSec?.name || dict.unknownSection)
    setEditItemData(null) // Reset edit data
    setActiveModal(type)
  }

  const handleEditItem = (sectionId, item) => {
    setTargetSectionId(sectionId)
    const targetSec = sections.find((s) => s.id === sectionId)
    setTargetSectionName(targetSec?.name || dict.unknownSection)
    setEditItemData(item)
    if (item.type === "bulletinBoard") {
      setActiveModal("announcement")
    } else if (item.type === "link") {
      setActiveModal("link")
    }
  }

  // --- SUBMIT HANDLERS FOR MODALS ---
  // 1. Add / Edit Bulletin Board
  const handleSaveBulletinBoard = async (data) => {
    if (id) {
      if (editItemData) {
        // Edit mode
        try {
          await updateBulletinBoard({
            classId: id,
            boardId: editItemData.itemId,
            title: data.title,
            content: data.content,
            allowStudentReply: data.allowReply,
            isVisibleToStudents: data.isVisible,
          }).unwrap()
          toast.success(dict.bulletinBoard.toastUpdateSuccess)
          setSectionsOverride(null)
        } catch {
          toast.error(dict.bulletinBoard.toastUpdateFailed)
        }
      } else {
        // Create mode
        try {
          await createBulletinBoard({
            classId: id,
            sectionId: targetSectionId,
            title: data.title,
            content: data.content,
            allowStudentReply: data.allowReply,
            isVisibleToStudents: data.isVisible,
          }).unwrap()
          toast.success(dict.bulletinBoard.toastCreateSuccess)
          setSectionsOverride(null)
        } catch {
          toast.error(dict.bulletinBoard.toastCreateFailed)
        }
      }
    } else {
      if (editItemData) {
        // Local edit mode
        updateSections((prev) =>
          prev.map((sec) =>
            sec.id === targetSectionId
              ? {
                ...sec,
                items: sec.items.map((it) =>
                  it.id === editItemData.id
                    ? {
                      ...it,
                      title: data.title,
                      content: data.content,
                      allowReply: data.allowReply,
                      isVisibleToStudents: data.isVisible,
                    }
                    : it
                ),
              }
              : sec
          )
        )
        toast.success(dict.bulletinBoard.toastUpdateSuccess)
      } else {
        // Local create mode
        const newItem = {
          id: `item-${Date.now()}`,
          type: "announcement",
          title: data.title,
          meta: `${dict.latestPost}: ${formatDate(new Date())}`,
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
        toast.success(dict.bulletinBoard.toastCreateSuccess)
      }
    }
    setEditItemData(null)
  }

  // 2. Add Material
  const handleSaveMaterial = async (data) => {
    if (id) {
      if (!data.files || data.files.length === 0) {
        toast.error(dict.curriculum.addMaterialRequired)
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
        toast.success(dict.curriculum.addMaterialSuccess)
        setSectionsOverride(null)
      } catch {
        toast.error(dict.curriculum.addMaterialError)
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
      toast.success(dict.curriculum.addMaterialSuccess)
    }
  }

  // 3. Add Activity (Assignment/Quiz)
  const handleSaveActivities = async (activities) => {
    if (!activities || activities.length === 0) return

    if (id) {
      try {
        const quizIds = activities.filter(act => act._activityType === "quiz").map(act => act.id)
        const assignmentIds = activities.filter(act => act._activityType !== "quiz").map(act => act.id)

        const promises = []
        if (quizIds.length > 0) {
          promises.push(
            addQuiz({
              classId: id,
              sectionId: targetSectionId,
              quizIds,
            }).unwrap()
          )
        }
        if (assignmentIds.length > 0) {
          promises.push(
            addAssignment({
              classId: id,
              sectionId: targetSectionId,
              assignmentIds,
            }).unwrap()
          )
        }
        await Promise.all(promises)

        toast.success(
          dict.curriculum.addActivitySuccessCount.replace(
            "{{count}}",
            String(activities.length),
          ),
        )
        setSectionsOverride(null)
      } catch {
        toast.error(dict.curriculum.addActivityError)
      }
    } else {
      const newItems = activities.map((act) => ({
        id: `item-${Date.now()}-${act.id}`,
        type: act._activityType === "quiz" ? "quiz" : "assignment",
        title: act.title,
        meta: dict.curriculum.dueDateMeta.replace("{{date}}", act.dueDate),
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
      toast.success(
        dict.curriculum.addActivitySuccessCount.replace(
          "{{count}}",
          String(activities.length),
        ),
      )
    }
  }

  // 4. Add Link
  const handleSaveLink = async (data) => {
    if (id) {
      if (editItemData) {
        // Edit mode
        try {
          await updateLink({
            classId: id,
            linkId: editItemData.itemId,
            title: data.title,
            url: data.url,
            isVisibleToStudents: data.isVisible,
          }).unwrap()

          if (editItemData.isVisibleToStudents !== data.isVisible) {
            await changeItemVisibility({
              classId: id,
              itemId: editItemData.id,
              isVisibleToStudents: data.isVisible,
            }).unwrap()
          }

          toast.success(dict.curriculum.updateLinkSuccess)
          setSectionsOverride(null)
        } catch {
          toast.error(dict.curriculum.updateLinkError)
        }
      } else {
        // Create mode
        try {
          await addLink({
            classId: id,
            sectionId: targetSectionId,
            title: data.title,
            url: data.url,
            isVisibleToStudents: data.isVisible,
          }).unwrap()
          toast.success(dict.curriculum.addLinkSuccess)
          setSectionsOverride(null)
        } catch {
          toast.error(dict.curriculum.addLinkError)
        }
      }
    } else {
      if (editItemData) {
        updateSections((prev) =>
          prev.map((sec) =>
            sec.id === targetSectionId
              ? {
                ...sec,
                items: sec.items.map((it) =>
                  it.id === editItemData.id
                    ? { ...it, title: data.title, meta: data.url, isVisibleToStudents: data.isVisible }
                    : it
                ),
              }
              : sec
          )
        )
        toast.success(dict.curriculum.updateLinkSuccess)
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
        toast.success(dict.curriculum.addLinkSuccess)
      }
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
      toast.error(sectionDict.toastNameRequired)
      return
    }

    if (sectionModal.mode === "create") {
      const newSection = {
        id: generateTempId(),
        name: sectionModal.name.trim(),
        description: sectionModal.description.trim(),
        isVisibleToStudents: sectionModal.isVisibleToStudents,
        items: [],
      }
      setSectionsOverride((prev) => [...(prev ?? apiSections), newSection])
      toast.success(sectionDict.toastCreateSuccess)
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
          toast.success(sectionDict.toastUpdateSuccess)
        } catch {
          toast.error(sectionDict.toastUpdateError)
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
        toast.success(sectionDict.toastUpdateSuccess)
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
      toast.success(sectionDict.toastVisibilitySuccess)
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
      toast.success(sectionDict.toastVisibilitySuccess)
    } catch {
      toast.error(sectionDict.toastVisibilityError)
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
      toast.success(dict.curriculum.toastVisibilitySuccess)
      return
    }

    try {
      await changeItemVisibility({
        classId: id,
        itemId: itemId,
        isVisibleToStudents: !item.isVisibleToStudents,
      }).unwrap()
      setSectionsOverride(null)
      toast.success(dict.curriculum.toastVisibilitySuccess)
    } catch {
      toast.error(dict.curriculum.toastVisibilityError)
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
        toast.success(dict.curriculum.toastDeleteSuccess)
      } else {
        try {
          await deleteSection({ classId: id, sectionId: sectionId }).unwrap()
          setSectionsOverride(null)
          toast.success(dict.curriculum.toastDeleteSuccess)
        } catch {
          toast.error(dict.curriculum.toastDeleteError)
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
        toast.success(dict.curriculum.toastDeleteSuccess)
      } else {
        try {
          await deleteItem({
            classId: id,
            itemId: itemId,
          }).unwrap()
          setSectionsOverride(null)
          toast.success(dict.curriculum.toastDeleteSuccess)
        } catch {
          toast.error(dict.curriculum.toastDeleteError)
        }
      }
    }
    setDeleteConfirm({ open: false, type: "section", sectionId: null, itemId: null })
  }

  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner text={dict.loading} />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-sm text-[#EF4444] border border-dashed border-[#FCA5A5] rounded-xl bg-[#FEF2F2]">
          <AlertCircle size={32} className="mb-3 opacity-80" />
          <p>{dict.curriculum.loadError}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Sections List */}
          <div className="space-y-6">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-[#6B7280] border border-dashed border-[#E2E2E2] rounded-xl bg-white">
                <FolderOpen size={32} className="mb-3 text-[#9CA3AF] opacity-80" />
                {isStudent ? (
                  <p>{dict.curriculum.emptyState}</p>
                ) : (
                  <p>{dict.curriculum.emptyStateHint}</p>
                )}
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
                  onEditItem={handleEditItem}
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
                {dict.curriculum.addSection}
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
        onClose={() => {
          setActiveModal(null)
          setEditItemData(null)
        }}
        onSubmit={handleSaveBulletinBoard}
        sessionName={targetSectionName}
        initialData={
          editItemData
            ? {
              title: editItemData.bulletinBoard?.title || editItemData.title,
              content: editItemData.bulletinBoard?.content || editItemData.content,
              allowReply: editItemData.bulletinBoard?.allowStudentReply ?? editItemData.allowReply ?? true,
              isVisibleToStudents: editItemData.isVisibleToStudents,
            }
            : null
        }
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
        mode={editItemData ? "edit" : "create"}
        initialData={
          editItemData
            ? {
              title: editItemData.title,
              url: editItemData.link?.url || editItemData.meta || "",
              isVisibleToStudents: editItemData.isVisibleToStudents,
            }
            : null
        }
        onClose={() => {
          setActiveModal(null)
          setEditItemData(null)
        }}
        onSubmit={handleSaveLink}
        sessionName={targetSectionName}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
        onConfirm={handleConfirmDelete}
        title={dict.curriculum.deleteConfirmTitle}
        message={dict.curriculum.deleteConfirmMessage}
        cancelText={dict.modals.section.cancel}
        confirmText={dict.bulletinBoard.delete}
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
