import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import {
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useLazyGenerateVoucherCodeQuery,
} from "../api/vouchersApi"
import {
  DISCOUNT_TYPES,
  SCOPE_TYPES,
} from "../constants/voucherConstants"
import {
  calculateInstructorDeposit,
  validateInstructorVoucherForm,
} from "../utils/voucherUtils"

export const INITIAL_VOUCHER_FORM = {
  code: "",
  title: "",
  description: "",
  discountType: DISCOUNT_TYPES.PERCENTAGE,
  discountValue: "",
  maxDiscountAmount: "",
  minOrderAmount: 0,
  minLearners: 1,
  scopeType: SCOPE_TYPES.SPECIFIC_CLASSES,
  courseIds: [],
  classIds: [],
  validFrom: new Date().toISOString().split("T")[0],
  validTo: "",
  isNeverExpired: false,
  totalUsageLimit: "",
  perUserLimit: 1,
  dailyLimit: "",
  maxBudget: "",
  isOnlyNewUser: false,
  isNotCombineOther: true,
}

export const useVoucherFormState = (initialData = null, voucherId = null) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditing = Boolean(voucherId)

  const classIdParam = searchParams.get("classId")
  const courseIdParam = searchParams.get("courseId")

  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState(() => {
    const initial = { ...INITIAL_VOUCHER_FORM }
    if (classIdParam) {
      initial.classIds = [Number(classIdParam) || classIdParam]
      initial.scopeType = SCOPE_TYPES.SPECIFIC_CLASSES
      initial.discountType = DISCOUNT_TYPES.PERCENTAGE
    } else if (courseIdParam) {
      initial.courseIds = [Number(courseIdParam) || courseIdParam]
      initial.scopeType = SCOPE_TYPES.SPECIFIC_COURSES
      initial.discountType = DISCOUNT_TYPES.FIXED_AMOUNT
    }
    return initial
  })
  const [errors, setErrors] = useState({})

  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation()
  const [updateVoucher, { isLoading: isUpdating }] = useUpdateVoucherMutation()
  const [triggerGenerateCode, { isFetching: isGeneratingCode }] =
    useLazyGenerateVoucherCodeQuery()

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      const scope = initialData.scopeType || SCOPE_TYPES.SPECIFIC_CLASSES
      const isCourse = scope === SCOPE_TYPES.SPECIFIC_COURSES || scope === 2
      setForm({
        code: initialData.code || "",
        title: initialData.title || "",
        description: initialData.description || "",
        discountType: isCourse
          ? DISCOUNT_TYPES.FIXED_AMOUNT
          : initialData.discountType || DISCOUNT_TYPES.PERCENTAGE,
        discountValue: initialData.discountValue || "",
        maxDiscountAmount: initialData.maxDiscountAmount || "",
        minOrderAmount: initialData.minOrderAmount || 0,
        minLearners: initialData.minLearners || 1,
        scopeType: scope,
        courseIds: Array.isArray(initialData.courses)
          ? initialData.courses.map((c) => c.id)
          : initialData.courseIds || [],
        classIds: Array.isArray(initialData.classes)
          ? initialData.classes.map((c) => c.id)
          : initialData.classIds || [],
        validFrom: initialData.validFrom
          ? initialData.validFrom.split("T")[0]
          : new Date().toISOString().split("T")[0],
        validTo: initialData.validTo ? initialData.validTo.split("T")[0] : "",
        isNeverExpired: Boolean(initialData.isNeverExpired),
        totalUsageLimit: initialData.totalUsageLimit || "",
        perUserLimit: initialData.perUserLimit || 1,
        dailyLimit: initialData.dailyLimit || "",
        maxBudget: initialData.maxBudget || "",
        isOnlyNewUser: Boolean(initialData.isOnlyNewUser),
        isNotCombineOther: initialData.isNotCombineOther !== false,
      })
    }
  }, [initialData])

  // Handle Field Change
  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "scopeType" && value === SCOPE_TYPES.SPECIFIC_COURSES) {
        next.discountType = DISCOUNT_TYPES.FIXED_AMOUNT
      }
      return next
    })

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle Auto Code Generation
  const handleAutoGenerateCode = async () => {
    try {
      const res = await triggerGenerateCode().unwrap()
      if (res?.code) {
        handleChange("code", res.code)
      }
    } catch (err) {
      console.warn("[VoucherForm] API code generation failed, using local fallback generator:", err)
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
      let rand = ""
      for (let i = 0; i < 6; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      handleChange("code", `GV-${rand}`)
    }
  }

  // Calculate live deposit
  const estimatedDeposit = calculateInstructorDeposit({
    discountType: form.discountType,
    discountValue: form.discountValue,
    maxDiscountAmount: form.maxDiscountAmount,
    totalUsageLimit: form.totalUsageLimit,
    maxBudget: form.maxBudget,
  })

  // Next Step with Validation (advancing from Step 1 to Step 2)
  const handleNextStep = () => {
    const { isValid, errors: validationErrors } = validateInstructorVoucherForm(
      form,
      false, // Full validation needed to calculate deposit for Step 2
    )

    if (!isValid) {
      setErrors(validationErrors)
      const errorKeys = Object.keys(validationErrors)
      const firstError = validationErrors[errorKeys[0]]
      console.warn("[VoucherForm] Cannot advance to Step 2. Validation errors:", validationErrors)
      toast.error(firstError || "Vui lòng điền đầy đủ các thông tin bắt buộc trước khi sang Bước 2.")
      return false
    }

    setErrors({})
    setCurrentStep(2)
    return true
  }

  // Submit Handler
  const handleSubmit = async (isDraft = false) => {
    const { isValid, errors: validationErrors } = validateInstructorVoucherForm(
      form,
      isDraft,
    )

    if (!isDraft && !isValid) {
      setErrors(validationErrors)
      toast.error("Vui lòng kiểm tra lại các trường thông tin chưa hợp lệ.")
      return
    }

    const payload = {
      isDraft,
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      discountType: form.discountType === DISCOUNT_TYPES.PERCENTAGE ? 1 : 2,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount
        ? Number(form.maxDiscountAmount)
        : null,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      minLearners: form.minLearners ? Number(form.minLearners) : 1,
      validFrom: form.validFrom
        ? new Date(form.validFrom).toISOString()
        : new Date().toISOString(),
      validTo:
        form.validTo && !form.isNeverExpired
          ? new Date(form.validTo).toISOString()
          : null,
      isNeverExpired: Boolean(form.isNeverExpired),
      sponsorType: 2,
      scopeType:
        form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES
          ? 3
          : form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES
          ? 2
          : 1,
      isOnlyNewUser: Boolean(form.isOnlyNewUser),
      isNotCombineOther: Boolean(form.isNotCombineOther),
      isUnlimitedUsage: false,
      totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : 1,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
      dailyLimit: form.dailyLimit ? Number(form.dailyLimit) : null,
      maxBudget: form.maxBudget ? Number(form.maxBudget) : null,
      courseIds:
        form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES ? form.courseIds : [],
      classIds:
        form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES ? form.classIds : [],
    }

    try {
      if (isEditing) {
        await updateVoucher({ id: voucherId, ...payload }).unwrap()
        toast.success("Cập nhật voucher thành công!")
        navigate(-1)
      } else {
        await createVoucher(payload).unwrap()
        toast.success(
          isDraft
            ? "Đã lưu voucher vào bản nháp!"
            : "Tạo và gửi yêu cầu voucher thành công!",
        )
        if (isDraft) {
          navigate(-1)
        }
      }
      return true
    } catch (err) {
      console.error("[VoucherForm] Error submitting voucher:", err)
      const msg =
        err?.data?.message ||
        err?.data?.data?.message ||
        "Có lỗi xảy ra khi lưu voucher. Vui lòng thử lại."
      toast.error(msg)
      return false
    }
  }

  return {
    form,
    errors,
    currentStep,
    setCurrentStep,
    handleChange,
    handleNextStep,
    handleAutoGenerateCode,
    handleSubmit,
    estimatedDeposit,
    isSubmitting: isCreating || isUpdating,
    isGeneratingCode,
    isEditing,
  }
}
