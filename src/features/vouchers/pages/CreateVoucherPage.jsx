import React, { useState, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, AlertCircle, Ban, ChevronRight } from "lucide-react"
import PageTitle from "@/shared/components/ui/PageTitle"
import { PillButton } from "@/shared/components/ui/buttons"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { StepPills } from "@/shared/components/ui/navigation"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import FluentCard from "@/shared/components/ui/FluentCard"
import FloatingActionDock from "@/shared/components/ui/containers/FloatingActionDock"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetVoucherByIdQuery } from "../api/vouchersApi"
import {
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
} from "@/store/api/coursesApi"
import { SCOPE_TYPES } from "../constants/voucherConstants"
import { useVoucherFormState } from "../hooks/useVoucherFormState"
import Step1TeacherForm from "../components/form/Step1TeacherForm"
import Step2TeacherDeposit from "../components/form/Step2TeacherDeposit"
import VoucherFormSkeleton from "../components/form/VoucherFormSkeleton"
import PendingDepositConfirmation from "../components/PendingDepositConfirmation"
import CannotEditVoucher from "../components/CannotEditVoucher"
import TransferInfoModal from "../components/detail/TransferInfoModal"

const CreateVoucherPage = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const classIdParam = searchParams.get("classId")
  const classNameParam = searchParams.get("className")
  const courseIdParam = searchParams.get("courseId")
  const courseNameParam = searchParams.get("courseName")

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
    handleBlur,
    handleNextStep,
    handleSaveDraft,
    saveVoucher,
    handleAutoGenerateCode,
    estimatedDeposit,
    isSubmitting,
    isSavingDraft,
    isGeneratingCode,
  } = useVoucherFormState(voucherDetail, id)

  // Resolve whether this is a Course-level voucher vs a Single-Class voucher
  const courseList = form.courseIds?.length
    ? form.courseIds
    : voucherDetail?.courses || []
  const classList = form.classIds?.length
    ? form.classIds
    : voucherDetail?.classes || []

  const isCourseVoucher = Boolean(
    (!classIdParam && courseIdParam) ||
    form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES ||
    (courseList.length > 0 && classList.length === 0),
  )
  const isSingleClassVoucher = !isCourseVoucher

  const firstClassObj = classList[0]
  const firstClassId =
    typeof firstClassObj === "object" ? firstClassObj?.id : firstClassObj
  const firstCourseObj = courseList[0]
  const firstCourseId =
    typeof firstCourseObj === "object" ? firstCourseObj?.id : firstCourseObj

  const targetClassId = isSingleClassVoucher
    ? classIdParam || firstClassId
    : null

  const matchedClass = teacherClasses.find(
    (c) => String(c.id) === String(classIdParam || firstClassId),
  )
  const targetCourseId =
    courseIdParam ||
    firstCourseId ||
    matchedClass?.courseId ||
    voucherDetail?.courseId

  const matchedCourse = teacherCourses.find(
    (c) => String(c.id) === String(targetCourseId),
  )

  const resolvedClassName =
    classNameParam ||
    matchedClass?.name ||
    matchedClass?.title ||
    voucherDetail?.classes?.[0]?.name
  const resolvedCourseName =
    courseNameParam ||
    matchedCourse?.name ||
    matchedCourse?.title ||
    voucherDetail?.courses?.[0]?.name

  const pageTitle = isEditing
    ? t?.vouchers?.form?.editTitle || "Chỉnh sửa voucher ưu đãi"
    : t?.vouchers?.form?.createTitle || "Tạo voucher ưu đãi"

  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        label: t?.courses?.title || "Khóa học của tôi",
        onClick: () => navigate("/workspace/courses"),
      },
    ]

    if (targetClassId) {
      if (matchedClass?.courseId || targetCourseId) {
        const cId = matchedClass?.courseId || targetCourseId
        items.push({
          label: resolvedCourseName || "Khóa học",
          onClick: () => navigate(`/workspace/courses/details/${cId}`),
        })
      }
      items.push({
        label: resolvedClassName || "Lớp học",
        onClick: () =>
          navigate(`/workspace/courses/class/${targetClassId}?tab=vouchers`),
      })
    } else if (targetCourseId) {
      items.push({
        label: resolvedCourseName || "Khóa học",
        onClick: () =>
          navigate(`/workspace/courses/details/${targetCourseId}?tab=vouchers`),
      })
    }

    items.push({
      label: pageTitle,
    })

    return items
  }, [
    targetClassId,
    targetCourseId,
    matchedClass?.courseId,
    resolvedCourseName,
    resolvedClassName,
    pageTitle,
    t?.courses?.title,
    navigate,
  ])

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
    return <VoucherFormSkeleton />
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
    return <CannotEditVoucher voucher={voucherDetail} />
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

  return (
    <div className="w-full space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Contextual Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

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
            onBlur={handleBlur}
            onAutoGenerateCode={handleAutoGenerateCode}
            isGeneratingCode={isGeneratingCode}
            teacherCourses={teacherCourses}
            teacherClasses={teacherClasses}
            estimatedDeposit={estimatedDeposit}
          />
        ) : (
          <Step2TeacherDeposit
            voucherId={currentVoucherId || id}
            form={form}
            estimatedDeposit={estimatedDeposit}
            isSubmitting={isSubmitting}
            isSavingDraft={isSavingDraft}
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
            disabled={isSubmitting || isSavingDraft}
            loading={isSavingDraft}
            loadingText={t?.vouchers?.form?.savingDraft || "Đang lưu"}
            onClick={handleSaveDraft}
          >
            {t?.vouchers?.form?.saveDraft || "Lưu nháp"}
          </PillButton>

          {currentStep === 1 && (
            <PillButton
              type="button"
              variant="primary"
              disabled={isSubmitting || isSavingDraft}
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
