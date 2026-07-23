import { useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useDeleteCourseMutation } from "@/store/api/coursesApi"

export function useDeleteCourse(t, onSuccess) {
  const c = t?.courses || {}
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()
  const [targetId, setTargetId] = useState(null)
  const isDeletingRef = useRef(false)

  const handleConfirm = async () => {
    if (!targetId || isDeletingRef.current) return
    isDeletingRef.current = true
    try {
      await deleteCourse(targetId).unwrap()
      toast.success(c.courseDetail?.toastDeleteSuccess || "Course deleted successfully!")
      if (onSuccess) onSuccess()
    } catch (err) {
      toast.error(err?.data?.message || c.courseDetail?.toastDeleteFailed || "Failed to delete course!")
    } finally {
      isDeletingRef.current = false
      setTargetId(null)
    }
  }

  const handleCancel = () => {
    setTargetId(null)
  }

  return {
    targetId,
    setTargetId,
    isOpen: !!targetId,
    handleConfirm,
    handleCancel,
    isDeleting,
  }
}
