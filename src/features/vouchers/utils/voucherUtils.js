import { SENSITIVE_KEYWORDS, DISCOUNT_TYPES, SCOPE_TYPES } from "../constants/voucherConstants"

/**
 * Calculate required deposit for Instructor voucher (BR-VC-GV-12)
 * Formula: DepositRequired = min(MaxDiscountPerUsage * TotalUsageLimit, MaxBudget)
 */
export const calculateInstructorDeposit = ({
  discountType,
  discountValue,
  maxDiscountAmount,
  totalUsageLimit,
  maxBudget,
}) => {
  const parsedLimit = Number(totalUsageLimit) || 0
  const parsedValue = Number(discountValue) || 0
  const parsedMaxDiscount = Number(maxDiscountAmount) || 0
  const parsedMaxBudget = Number(maxBudget) || 0

  if (parsedLimit <= 0) return 0

  let maxPerUsage = 0
  if (discountType === DISCOUNT_TYPES.FIXED_AMOUNT || discountType === 2) {
    maxPerUsage = parsedValue
  } else {
    maxPerUsage = parsedMaxDiscount
  }

  if (maxPerUsage <= 0) return 0

  const theoreticalTotal = maxPerUsage * parsedLimit

  if (parsedMaxBudget > 0) {
    return Math.min(theoreticalTotal, parsedMaxBudget)
  }

  return theoreticalTotal
}

/**
 * Check if text contains sensitive platform words (BR-VC-GV-03)
 */
export const checkSensitiveKeywords = (text) => {
  if (!text || typeof text !== "string") return null

  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()

  for (const keyword of SENSITIVE_KEYWORDS) {
    const normKw = keyword
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()

    const regex = new RegExp(`\\b${normKw}\\b`, "i")
    if (regex.test(normalized) || normalized.includes(normKw)) {
      return keyword
    }
  }

  return null
}

/**
 * Validate Instructor Voucher Form according to BR-VC rules
 */
export const validateInstructorVoucherForm = (values, isDraft = false, t = null) => {
  const errors = {}
  const errT = t?.vouchers?.errors || {}

  // 1. Voucher Code (BR-VC-GV-02)
  const code = (values.code || "").trim().toUpperCase()
  if (!code) {
    errors.code = errT.codeRequired || "Vui lòng nhập mã voucher"
  } else if (!code.startsWith("GV-")) {
    errors.code =
      errT.codePrefix ||
      "Mã voucher của Giảng viên bắt buộc bắt đầu bằng tiền tố 'GV-'"
  } else if (code.length < 4 || code.length > 20) {
    errors.code =
      errT.codeLength || "Độ dài mã voucher phải từ 4 đến 20 ký tự"
  } else if (!/^[A-Z0-9_-]+$/.test(code)) {
    errors.code =
      errT.codeFormat ||
      "Mã voucher chỉ được chứa chữ hoa, số và dấu gạch nối"
  }

  // 2. Title (BR-VC-GV-03)
  const title = (values.title || "").trim()
  if (!title) {
    errors.title = errT.titleRequired || "Vui lòng nhập tiêu đề voucher"
  } else if (title.length < 3 || title.length > 100) {
    errors.title = errT.titleLength || "Tiêu đề phải từ 3 đến 100 ký tự"
  } else {
    const sensitiveMatch = checkSensitiveKeywords(title)
    if (sensitiveMatch) {
      errors.title =
        errT.sensitiveKeyword ||
        `Tiêu đề không được chứa từ khóa nhạy cảm: '${sensitiveMatch}'`
    }
  }

  // 3. Description (BR-VC-GV-03)
  const description = (values.description || "").trim()
  if (description) {
    const sensitiveMatch = checkSensitiveKeywords(description)
    if (sensitiveMatch) {
      errors.description =
        errT.sensitiveKeyword ||
        `Mô tả không được chứa từ khóa nhạy cảm: '${sensitiveMatch}'`
    }
  }

  // If saving draft, basic info is enough, but if submitting active voucher, check all rules
  if (!isDraft) {
    // 4. Discount Type & Values (BR-VC-GV-05 & BR-VC-GV-06)
    const isPercentage =
      values.discountType === DISCOUNT_TYPES.PERCENTAGE ||
      values.discountType === 1
    const discountVal = Number(values.discountValue)
    const maxDiscount = Number(values.maxDiscountAmount)
    const minOrder = Number(values.minOrderAmount)

    if (isNaN(discountVal) || discountVal <= 0) {
      errors.discountValue =
        errT.discountValueRequired || "Vui lòng nhập mức giảm giá hợp lệ"
    } else if (isPercentage) {
      if (discountVal < 1 || discountVal > 50) {
        errors.discountValue =
          errT.percentRange ||
          "Giáo viên chỉ được tạo voucher giảm từ 1% đến 50%"
      }
      if (isNaN(maxDiscount) || maxDiscount <= 0) {
        errors.maxDiscountAmount =
          errT.maxDiscountRequired ||
          "Voucher giảm theo % bắt buộc nhập mức giảm tối đa (VNĐ)"
      } else if (maxDiscount < 2000) {
        errors.maxDiscountAmount =
          errT.minMaxDiscount || "Mức giảm tối đa tối thiểu là 2.000 ₫"
      }
    } else {
      if (discountVal < 2000) {
        errors.discountValue =
          errT.minFixedDiscount || "Mức giảm cố định tối thiểu là 2.000 ₫"
      }
    }

    if (minOrder < 0) {
      errors.minOrderAmount = "Giá trị đơn hàng tối thiểu không hợp lệ"
    }

    // 5. Scope Type (BR-VC-GV-06 & BR-VC-GV-08)
    const scope = values.scopeType
    if (scope === SCOPE_TYPES.SPECIFIC_COURSES || scope === 2) {
      if (isPercentage) {
        errors.discountType =
          errT.scopeCourseDiscountFixedOnly ||
          "Voucher áp dụng cho Khóa học bắt buộc chọn Giảm theo số tiền cố định (FixedAmount)"
      }
      const maxBudget = Number(values.maxBudget)
      if (isNaN(maxBudget) || maxBudget <= 0) {
        errors.maxBudget =
          errT.maxBudgetRequired ||
          "Voucher áp dụng cho Khóa học bắt buộc nhập Ngân sách tối đa (VNĐ)"
      } else if (maxBudget < 2000) {
        errors.maxBudget =
          errT.minMaxBudget || "Ngân sách tối đa tối thiểu là 2.000 ₫"
      }
      if (!Array.isArray(values.courseIds) || values.courseIds.length === 0) {
        errors.courseIds =
          errT.selectAtLeastOneCourse ||
          "Vui lòng chọn ít nhất 1 khóa học áp dụng"
      }
    } else if (scope === SCOPE_TYPES.SPECIFIC_CLASSES || scope === 3) {
      if (!Array.isArray(values.classIds) || values.classIds.length === 0) {
        errors.classIds =
          errT.selectAtLeastOneClass ||
          "Vui lòng chọn ít nhất 1 lớp học áp dụng"
      }
    }

    // 6. Total Usage Limit (BR-VC-GV-11)
    const totalLimit = Number(values.totalUsageLimit)
    if (isNaN(totalLimit) || totalLimit <= 0 || !Number.isInteger(totalLimit)) {
      errors.totalUsageLimit =
        errT.totalUsageLimitRequired ||
        "Giáo viên bắt buộc nhập Tổng lượt sử dụng cụ thể (> 0) để tính tiền cọc"
    }

    // 7. Validity Dates (BR-VC-GV-10)
    if (!values.validFrom) {
      errors.validFrom =
        errT.validFromRequired || "Vui lòng chọn thời gian bắt đầu hiệu lực"
    }
    if (!values.isNeverExpired) {
      if (!values.validTo) {
        errors.validTo =
          errT.validToRequired || "Vui lòng chọn thời gian kết thúc hiệu lực"
      } else if (new Date(values.validTo) <= new Date(values.validFrom)) {
        errors.validTo =
          errT.validToAfterValidFrom ||
          "Thời gian kết thúc phải sau thời gian bắt đầu"
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
