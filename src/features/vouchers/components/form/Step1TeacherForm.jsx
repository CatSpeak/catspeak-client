import React, { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { DISCOUNT_TYPES, SCOPE_TYPES } from "../../constants/voucherConstants"
import {
  BasicInfoSection,
  DiscountConfigSection,
  OtherConfigSection,
  ValiditySection,
  UsageLimitsSection,
  EstimateBox,
} from "./sections"

const Step1TeacherForm = ({
  form,
  errors,
  onChange,
  onBlur,
  onAutoGenerateCode,
  isGeneratingCode,
  teacherCourses = [],
  teacherClasses = [],
  estimatedDeposit = 0,
}) => {
  const [searchParams] = useSearchParams()
  const classIdParam = searchParams.get("classId")
  const classNameParam = searchParams.get("className")
  const courseIdParam = searchParams.get("courseId")
  const courseNameParam = searchParams.get("courseName")

  // Determine context: Course Scope vs Class Scope
  const isCourseScope = form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES

  // Selected or active course info
  const selectedCourseId = form.courseIds?.[0] || courseIdParam
  const activeCourse = useMemo(() => {
    return (
      teacherCourses.find(
        (c) =>
          String(c.id) === String(selectedCourseId) ||
          String(c._id) === String(selectedCourseId),
      ) ||
      (courseNameParam
        ? { id: selectedCourseId, title: courseNameParam }
        : null) ||
      teacherCourses[0]
    )
  }, [teacherCourses, selectedCourseId, courseNameParam])

  // Classes belonging to the active course (for lowest tuition check in Course scope)
  const courseClasses = useMemo(() => {
    if (!activeCourse?.id) return teacherClasses
    const filtered = teacherClasses.filter(
      (c) => String(c.courseId) === String(activeCourse.id),
    )
    return filtered.length > 0 ? filtered : teacherClasses
  }, [teacherClasses, activeCourse])

  // Active class in class context
  const activeClass = useMemo(() => {
    const targetId = form.classIds?.[0] || classIdParam
    return (
      teacherClasses.find(
        (c) =>
          String(c.id) === String(targetId) ||
          String(c._id) === String(targetId),
      ) ||
      (classNameParam ? { id: targetId, name: classNameParam } : null) ||
      null
    )
  }, [teacherClasses, form.classIds, classIdParam, classNameParam])

  const isPercent = form.discountType === DISCOUNT_TYPES.PERCENTAGE

  // Determine lowest tuition for fixed discount cap validation
  const { lowestTuition, lowestTuitionClassName } = useMemo(() => {
    if (isCourseScope) {
      if (!courseClasses || courseClasses.length === 0) {
        return { lowestTuition: 0, lowestTuitionClassName: "" }
      }

      let minPrice = Infinity
      let minClass = null
      for (const cls of courseClasses) {
        const price = Number(cls.price ?? cls.tuitionFee ?? 0)
        if (price > 0 && price < minPrice) {
          minPrice = price
          minClass = cls
        }
      }

      return {
        lowestTuition: minPrice === Infinity ? 0 : minPrice,
        lowestTuitionClassName: minClass?.name || minClass?.title || "",
      }
    }

    const price = Number(activeClass?.price ?? activeClass?.tuitionFee ?? 0)
    return {
      lowestTuition: price,
      lowestTuitionClassName: activeClass?.name || activeClass?.title || "",
    }
  }, [isCourseScope, courseClasses, activeClass])

  // Fixed Amount validation check (cannot exceed tuition fee)
  const isFixedAmountExceeded =
    !isPercent &&
    lowestTuition > 0 &&
    Number(form.discountValue) > 0 &&
    Number(form.discountValue) >= lowestTuition

  // Estimation Calculation for 1 learner (when Class Scope is active)
  const sampleOriginalTuition = Number(
    activeClass?.price ?? activeClass?.tuitionFee ?? 0,
  )
  let discountAmountForOne = 0
  if (isPercent) {
    const pct = Math.min(Math.max(Number(form.discountValue) || 0, 0), 50)
    const rawDiscount = (sampleOriginalTuition * pct) / 100
    const maxDiscount =
      Number(form.maxDiscountAmount) > 0
        ? Number(form.maxDiscountAmount)
        : rawDiscount
    discountAmountForOne = Math.min(rawDiscount, maxDiscount)
  } else {
    discountAmountForOne = Math.min(
      Number(form.discountValue) || 0,
      sampleOriginalTuition,
    )
  }
  const platformFee = Math.round(sampleOriginalTuition * 0.1) // 10% on original price (BR-VC-GV-17)
  const teacherReceives = Math.max(
    0,
    sampleOriginalTuition - discountAmountForOne - platformFee,
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* LEFT COLUMN (8 cols): Thông tin cơ bản, Cấu hình giảm giá, Cấu hình khác */}
      <div className="lg:col-span-8 space-y-6">
        <BasicInfoSection
          form={form}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          onAutoGenerateCode={onAutoGenerateCode}
          isGeneratingCode={isGeneratingCode}
        />

        <DiscountConfigSection
          form={form}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          isCourseScope={isCourseScope}
          lowestTuition={lowestTuition}
          lowestTuitionClassName={lowestTuitionClassName}
          isFixedAmountExceeded={isFixedAmountExceeded}
        />

        <OtherConfigSection 
          form={form} 
          errors={errors} 
          onChange={onChange} 
          onBlur={onBlur} 
        />
      </div>

      {/* RIGHT COLUMN (4 cols): Thời gian hiệu lực, Giới hạn sử dụng, Ước tính (1 học viên) */}
      <div className="lg:col-span-4 space-y-6">
        <ValiditySection 
          form={form} 
          errors={errors} 
          onChange={onChange} 
          onBlur={onBlur} 
        />

        <UsageLimitsSection
          form={form}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          estimatedDeposit={estimatedDeposit}
          isCourseScope={isCourseScope}
        />

        {!isCourseScope && (
          <EstimateBox
            form={form}
            sampleOriginalTuition={sampleOriginalTuition}
            discountAmountForOne={discountAmountForOne}
            platformFee={platformFee}
            teacherReceives={teacherReceives}
            isPercent={isPercent}
          />
        )}
      </div>
    </div>
  )
}

export default Step1TeacherForm
