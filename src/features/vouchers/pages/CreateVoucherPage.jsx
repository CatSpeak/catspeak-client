import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle, Ban, ChevronRight } from "lucide-react"
import PageTitle from "@/shared/components/ui/PageTitle"
import { PillButton } from "@/shared/components/ui/buttons"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { StepPills } from "@/shared/components/ui/navigation"
import FluentCard from "@/shared/components/ui/FluentCard"
import FloatingActionDock from "@/shared/components/ui/containers/FloatingActionDock"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetVoucherByIdQuery } from "../api/vouchersApi"
import {
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
} from "@/store/api/coursesApi"
import { useVoucherFormState } from "../hooks/useVoucherFormState"
import Step1TeacherForm from "../components/form/Step1TeacherForm"
import Step2TeacherDeposit from "../components/form/Step2TeacherDeposit"
import PendingDepositConfirmation from "../components/PendingDepositConfirmation"
import CannotEditVoucher from "../components/CannotEditVoucher"
import TransferInfoModal from "../components/detail/TransferInfoModal"

const CreateVoucherPage = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [currentStep, setCurrentStep] = useState(1) // 1: Thông tin, 2: Cọc
  const [submittedVoucherData, setSubmittedVoucherData] = useState(null)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const voucherSteps = [
    { id: 1, label: t?.vouchers?.stepper?.step1 || "Thông tin" },
    { id: 2, label: t?.vouchers?.stepper?.step2 || "Cọc" },
  ]

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

  // Check if voucher status allows editing
  const isDraftStatus =
    !isEditing ||
    voucherDetail?.status === "Draft" ||
    voucherDetail?.status === 1

  // Use custom form state hook
  const {
    form,
    errors,
    currentVoucherId,
    handleChange,
    handleNextStep,
    handleSaveDraft,
    saveVoucher,
    handleAutoGenerateCode,
    estimatedDeposit,
    isSubmitting,
    isGeneratingCode,
  } = useVoucherFormState(voucherDetail, id)

  // Handle advancing to Step 2 with client-side validation
  const onAdvanceToStep2 = () => {
    const isValid = handleNextStep()
    if (isValid) {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Handle final deposit confirmation in Step 2
  const onDepositConfirmed = (submittedData) => {
    setSubmittedVoucherData({
      code: submittedData?.code || form.code,
      depositAmount: submittedData?.depositAmount || estimatedDeposit,
    })
  }

  const handleGoBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      return
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate("/workspace/courses")
    }
  }

  if (isEditing && isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="w-8 h-8 text-cath-red-700" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {t?.vouchers?.loading || "Đang tải thông tin voucher..."}
        </p>
      </div>
    )
  }

  if (isEditing && (isDetailError || !voucherDetail)) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">
          {t?.vouchers?.notFound || "Không tìm thấy thông tin voucher"}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          {t?.vouchers?.notFoundDesc ||
            "Voucher không tồn tại hoặc bạn không có quyền truy cập."}
        </p>
        <button
          type="button"
          onClick={handleGoBack}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          {t?.vouchers?.back || "Quay lại"}
        </button>
      </div>
    )
  }

  // Prevent editing non-draft vouchers (BR-VC-18)
  if (isEditing && !isDraftStatus) {
    return (
      <CannotEditVoucher
        voucher={voucherDetail}
      />
    )
  }

  // If submitted from Step 2, show Pending Deposit screen
  if (submittedVoucherData) {
    return (
      <>
        <PendingDepositConfirmation
          code={submittedVoucherData.code}
          depositAmount={submittedVoucherData.depositAmount}
          onViewTransferInfo={() => setIsTransferModalOpen(true)}
          onClose={handleGoBack}
        />
        <TransferInfoModal
          open={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          voucher={{
            id: currentVoucherId || id,
            code: submittedVoucherData.code,
            depositRequired: submittedVoucherData.depositAmount,
            status: "PendingApproval",
          }}
        />
      </>
    )
  }

  const pageTitle = isEditing
    ? t?.vouchers?.form?.editTitle || "Chỉnh sửa voucher ưu đãi"
    : t?.vouchers?.form?.createTitle || "Tạo voucher ưu đãi"

  return (
    <div className="w-full space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Back Button */}
      <PillButton
        variant="secondary"
        onClick={handleGoBack}
        startIcon={<ArrowLeft />}
        className="w-fit"
      >
        {t?.vouchers?.back || "Quay lại"}
      </PillButton>

      {/* Page Title */}
      <PageTitle>{pageTitle}</PageTitle>

      {/* Stepper matching Teacher Wireframes */}
      <StepPills
        steps={voucherSteps}
        currentStep={currentStep}
        maxStepReached={1}
        onStepClick={(targetStepId) => {
          if (targetStepId === 1) {
            setCurrentStep(1)
          } else if (targetStepId === 2) {
            if (currentStep === 1) {
              onAdvanceToStep2()
            }
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
            voucherId={currentVoucherId || id}
            form={form}
            estimatedDeposit={estimatedDeposit}
            isSubmitting={isSubmitting}
            saveVoucher={saveVoucher}
            onConfirmSuccess={onDepositConfirmed}
          />
        )}
      </div>

      {/* Floating Action Dock */}
      <FloatingActionDock>
        <div />

        <div className="flex items-center gap-3">
          {currentStep === 2 && (
            <PillButton
              type="button"
              variant="secondary-no-outline"
              onClick={() => setCurrentStep(1)}
              startIcon={<ArrowLeft />}
            >
              {t?.vouchers?.back || "Quay lại"}
            </PillButton>
          )}

          <PillButton
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={handleSaveDraft}
          >
            {t?.vouchers?.form?.saveDraft || "Lưu nháp"}
          </PillButton>

          {currentStep === 1 && (
            <PillButton
              type="button"
              variant="primary"
              disabled={isSubmitting}
              onClick={onAdvanceToStep2}
            >
              {t?.vouchers?.form?.nextStep || "Tiếp theo"}
            </PillButton>
          )}
        </div>
      </FloatingActionDock>
    </div>
  )
}

export default CreateVoucherPage
