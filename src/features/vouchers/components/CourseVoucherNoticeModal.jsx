import React from "react"
import { useNavigate } from "react-router-dom"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Modal shown when a course only has 1 class.
 * Informs the teacher that the system will guide them to create a Class Voucher for that class.
 */
export const SingleClassVoucherNoticeModal = ({
  open,
  onClose,
  courseId,
  courseName,
  courseClasses = [],
}) => {
  const { t } = useLanguage()
  const vt = t?.vouchers || {}
  const nm = vt?.noticeModal || {}
  const cm = t?.common || {}
  const navigate = useNavigate()
  const firstClass = courseClasses[0]
  const className = firstClass?.name || firstClass?.title || "Lớp 1"

  const handleProceed = () => {
    onClose()
    navigate(
      `/workspace/vouchers/create?classId=${firstClass?.id}&className=${encodeURIComponent(className)}&courseId=${courseId}&courseName=${encodeURIComponent(courseName || "")}`,
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={nm.singleClassTitle || vt.createVoucher || "Tạo voucher ưu đãi"}
      showCloseButton={false}
      className="md:max-w-md"
      bodyClassName="px-4 sm:px-6 py-0 flex-1 overflow-y-auto"
      footerClassName="p-4 sm:p-6"
      footer={
        <div className="flex items-center justify-end gap-2">
          <PillButton variant="secondary" onClick={onClose}>
            {nm.cancelButton || cm.cancel || "Hủy"}
          </PillButton>
          <PillButton variant="primary" onClick={handleProceed}>
            {nm.singleClassButton || "Tạo voucher lớp học"}
          </PillButton>
        </div>
      }
    >
      <p className="text-sm">
        {nm.singleClassBody ? (
          nm.singleClassBody
            .replace("{{courseName}}", courseName ? `"${courseName}"` : "")
            .replace("{{className}}", className)
        ) : (
          <>
            Khóa học {courseName ? <strong>"{courseName}"</strong> : "này"} hiện chỉ
            có 1 lớp học: <strong>"{className}"</strong>. Hệ thống sẽ chuyển sang tạo{" "}
            <strong>voucher lớp học</strong> cho lớp này.
          </>
        )}
      </p>
    </Modal>
  )
}

/**
 * Modal shown when a course has 0 classes.
 */
export const NoClassesWarningModal = ({
  open,
  onClose,
  courseId,
  courseName,
}) => {
  const { t } = useLanguage()
  const vt = t?.vouchers || {}
  const nm = vt?.noticeModal || {}
  const cm = t?.common || {}
  const navigate = useNavigate()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={nm.noClassesTitle || "Chưa có lớp học"}
      showCloseButton={false}
      className="md:max-w-md"
      bodyClassName="px-4 sm:px-6 py-0 flex-1 overflow-y-auto"
      footerClassName="p-4 sm:p-6"
      footer={
        <div className="flex items-center justify-end gap-2">
          <PillButton variant="secondary" onClick={onClose}>
            {nm.closeButton || cm.close || "Đóng"}
          </PillButton>
          <PillButton
            variant="primary"
            onClick={() => {
              onClose()
              navigate(`/workspace/classes/create-class?courseId=${courseId}`, {
                state: { courseId },
              })
            }}
          >
            {nm.createClassButton || "Tạo lớp học mới"}
          </PillButton>
        </div>
      }
    >
      <p className="text-sm">
        {nm.noClassesBody ? (
          nm.noClassesBody.replace(
            "{{courseName}}",
            courseName ? `"${courseName}"` : "",
          )
        ) : (
          <>
            Khóa học {courseName ? <strong>"{courseName}"</strong> : "này"} hiện
            chưa có lớp học nào. Vui lòng tạo ít nhất 1 lớp học trước khi tạo
            voucher ưu đãi.
          </>
        )}
      </p>
    </Modal>
  )
}

export default SingleClassVoucherNoticeModal
