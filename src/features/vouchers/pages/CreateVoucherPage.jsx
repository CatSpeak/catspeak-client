import React, { useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, AlertCircle, Ban, ChevronRight } from "lucide-react"
import PageTitle from "@/shared/components/ui/PageTitle"
import { PillButton } from "@/shared/components/ui/buttons"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { StepPills } from "@/shared/components/ui/navigation"
import { useGetVoucherByIdQuery } from "../api/vouchersApi"
import {
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
} from "@/store/api/coursesApi"
import { useVoucherFormState } from "../hooks/useVoucherFormState"
import Step1TeacherForm from "../components/form/Step1TeacherForm"
import Step2TeacherDeposit from "../components/form/Step2TeacherDeposit"
import PendingDepositConfirmation from "../components/PendingDepositConfirmation"

const VOUCHER_STEPS = [
  { id: 1, label: "Thông tin" },
  { id: 2, label: "Cọc" },
]

const CreateVoucherPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const fromUrl = searchParams.get("from")
  const classIdParam = searchParams.get("classId")
  const classNameParam = searchParams.get("className")
  const courseIdParam = searchParams.get("courseId")
  const courseNameParam = searchParams.get("courseName")
  const returnUrl = fromUrl || "/workspace/vouchers"

  const isEditing = Boolean(id)
  const [currentStep, setCurrentStep] = useState(1) // 1: Thông tin, 2: Cọc
  const [submittedVoucherData, setSubmittedVoucherData] = useState(null)

  // Fetch voucher details if in Edit mode
  const {
    data: voucherDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useGetVoucherByIdQuery(id, { skip: !isEditing })

  // Fetch teacher's courses & classes for scope selection
  const { data: coursesData } = useGetAllCoursesQuery({
    page: 1,
    pageSize: 100,
  })
  const { data: classesData } = useGetAllClassesQuery({
    page: 1,
    pageSize: 100,
  })

  const teacherCourses = coursesData?.data || []
  const teacherClasses = classesData?.data || []

  // Check if voucher is editable (Only Draft status according to BR-VC-18)
  const isDraftStatus =
    !isEditing ||
    voucherDetail?.status === "Draft" ||
    voucherDetail?.status === 1

  // Use custom form state hook
  const {
    form,
    errors,
    handleChange,
    handleNextStep,
    handleAutoGenerateCode,
    handleSubmit,
    estimatedDeposit,
    isSubmitting,
    isGeneratingCode,
  } = useVoucherFormState(voucherDetail, id)

  // Handle advancing to Step 2 with validation
  const onAdvanceToStep2 = () => {
    const isValid = handleNextStep()
    if (isValid) {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Handle final submission in Step 2
  const onFinalSubmit = async () => {
    const success = await handleSubmit(false)
    if (success) {
      setSubmittedVoucherData({
        code: form.code,
        depositAmount: estimatedDeposit,
      })
    }
  }

  if (isEditing && isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="w-8 h-8 text-cath-red-700" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Đang tải thông tin voucher...
        </p>
      </div>
    )
  }

  if (isEditing && (isDetailError || !voucherDetail)) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          Không tìm thấy thông tin voucher
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Voucher không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    )
  }

  // Prevent editing non-draft vouchers (BR-VC-18)
  if (isEditing && !isDraftStatus) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto my-12 shadow-xs">
        <Ban className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          Không thể chỉnh sửa voucher
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Quy tắc BR-VC-18: Chỉ voucher ở trạng thái{" "}
          <strong>Bản nháp (Draft)</strong> mới được phép chỉnh sửa.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    )
  }

  // If submitted from Step 2, show Pending Deposit screen (Image 3)
  if (submittedVoucherData) {
    return (
      <PendingDepositConfirmation
        code={submittedVoucherData.code}
        depositAmount={submittedVoucherData.depositAmount}
        onViewTransferInfo={() => setSubmittedVoucherData(null)}
        onClose={() => navigate(-1)}
      />
    )
  }

  const pageTitle = isEditing
    ? "Chỉnh sửa voucher ưu đãi"
    : "Tạo voucher ưu đãi"

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Back Button */}
      <PillButton
        variant="secondary"
        onClick={() => navigate(-1)}
        startIcon={<ArrowLeft />}
        className="w-fit"
      >
        Quay lại
      </PillButton>

      {/* Page Title */}
      <PageTitle>{pageTitle}</PageTitle>

      {/* Stepper matching Teacher Wireframes */}
      <StepPills
        steps={VOUCHER_STEPS}
        currentStep={currentStep}
        onStepClick={(targetStepId) => {
          if (targetStepId === 1) {
            setCurrentStep(1)
          } else if (targetStepId === 2 && currentStep === 1) {
            onAdvanceToStep2()
          }
        }}
      />

      {/* Main Step Content */}
      <div>
        {currentStep === 1 ? (
          <Step1TeacherForm
            form={form}
            errors={errors}
            onChange={handleChange}
            onAutoGenerateCode={handleAutoGenerateCode}
            isGeneratingCode={isGeneratingCode}
            teacherCourses={teacherCourses}
            teacherClasses={teacherClasses}
          />
        ) : (
          <Step2TeacherDeposit
            form={form}
            estimatedDeposit={estimatedDeposit}
            isSubmitting={isSubmitting}
            onConfirmAndCreate={onFinalSubmit}
          />
        )}
      </div>

      {/* Bottom Sticky Action Footer matching Teacher Wireframes */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-6 shadow-lg">
        <div className="w-full flex items-center justify-between">
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Hủy
            </button>
          ) : (
            <PillButton
              variant="secondary-no-outline"
              onClick={() => setCurrentStep(1)}
              startIcon={<ArrowLeft />}
            >
              Quay lại
            </PillButton>
          )}

          <div className="flex items-center gap-3">
            <PillButton
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
            >
              {currentStep === 1 ? "Lưu nháp" : "Lưu Voucher"}
            </PillButton>

            {currentStep === 1 ? (
              <PillButton
                type="button"
                variant="primary"
                onClick={onAdvanceToStep2}
                endIcon={<ChevronRight />}
              >
                Tiếp theo
              </PillButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateVoucherPage
