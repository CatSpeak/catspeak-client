import React, { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { DISCOUNT_TYPES, SCOPE_TYPES } from "../../constants/voucherConstants"
import {
  BasicInfoSection,
  DiscountConfigSection,
  ScopeConditionsSection,
  OtherConfigSection,
  ValiditySection,
  UsageLimitsSection,
  EstimateBox,
} from "./sections"

const Step1TeacherForm = ({
  form,
  errors,
  onChange,
  onAutoGenerateCode,
  isGeneratingCode,
  teacherCourses = [],
  teacherClasses = [],
}) => {
  const [searchParams] = useSearchParams()
  const classIdParam = searchParams.get("classId")
  const classNameParam = searchParams.get("className")
  const courseIdParam = searchParams.get("courseId")
  const courseNameParam = searchParams.get("courseName")

  // Determine initial context
  const isInitialClassContext = Boolean(classIdParam)

  const [classSearch, setClassSearch] = useState("")
  // Sub-selection mode when inside Course Scope: "all_classes" | "specific_classes"
  const courseClassMode =
    form.courseClassMode ||
    (form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES && !isInitialClassContext
      ? "specific_classes"
      : "all_classes")

  // Selected or active course name & info
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

  const courseDisplayName =
    activeCourse?.title || activeCourse?.name || courseNameParam || "IELTS"

  // Classes belonging to the active course (or all teacher classes)
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
      (classNameParam
        ? { id: targetId, name: classNameParam, price: 900000 }
        : null) ||
      teacherClasses[0]
    )
  }, [teacherClasses, form.classIds, classIdParam, classNameParam])

  const isPercent = form.discountType === DISCOUNT_TYPES.PERCENTAGE
  const isCourseScope = form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES

  // Determine relevant classes for lowest tuition calculation
  const selectedClassesList = useMemo(() => {
    return teacherClasses.filter(
      (c) =>
        form.classIds?.includes(c.id) || form.classIds?.includes(Number(c.id)),
    )
  }, [teacherClasses, form.classIds])

  const { lowestTuition, lowestTuitionClassName } = useMemo(() => {
    let listToInspect = []
    if (isCourseScope || courseClassMode === "all_classes") {
      listToInspect = courseClasses.length > 0 ? courseClasses : teacherClasses
    } else {
      listToInspect =
        selectedClassesList.length > 0
          ? selectedClassesList
          : courseClasses.length > 0
            ? courseClasses
            : teacherClasses
    }

    if (!listToInspect || listToInspect.length === 0) {
      return { lowestTuition: 800000, lowestTuitionClassName: "Lớp BASIC" }
    }

    let minPrice = Infinity
    let minClass = null
    for (const cls of listToInspect) {
      const price = cls.price ?? cls.tuitionFee ?? 800000
      if (price < minPrice) {
        minPrice = price
        minClass = cls
      }
    }

    return {
      lowestTuition: minPrice === Infinity ? 800000 : minPrice,
      lowestTuitionClassName: minClass?.name || minClass?.title || "Lớp BASIC",
    }
  }, [
    isCourseScope,
    courseClassMode,
    courseClasses,
    teacherClasses,
    selectedClassesList,
  ])

  // Filtered classes for search in class picker
  const filteredClasses = useMemo(() => {
    const baseList =
      isCourseScope || activeCourse ? courseClasses : teacherClasses
    if (!classSearch.trim()) return baseList
    return baseList.filter((cls) =>
      (cls.name || cls.title || "")
        .toLowerCase()
        .includes(classSearch.toLowerCase().trim()),
    )
  }, [classSearch, isCourseScope, activeCourse, courseClasses, teacherClasses])

  // Fixed Amount validation check
  const isFixedAmountExceeded =
    !isPercent &&
    Number(form.discountValue) > 0 &&
    Number(form.discountValue) >= lowestTuition

  // Estimation Calculation for 1 learner (when Class Scope is active)
  const sampleOriginalTuition =
    activeClass?.price ??
    activeClass?.tuitionFee ??
    selectedClassesList[0]?.price ??
    selectedClassesList[0]?.tuitionFee ??
    900000
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

  // Scope handlers
  const handleSelectClassScope = () => {
    onChange("scopeType", SCOPE_TYPES.SPECIFIC_CLASSES)
    if (activeClass?.id && (!form.classIds || form.classIds.length === 0)) {
      onChange("classIds", [activeClass.id])
    }
  }

  const handleSelectCourseScope = (mode = "all_classes") => {
    onChange("courseClassMode", mode)
    if (mode === "all_classes") {
      onChange("scopeType", SCOPE_TYPES.SPECIFIC_COURSES)
      onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
      if (activeCourse?.id) {
        onChange("courseIds", [activeCourse.id])
      }
      onChange("classIds", [])
    } else {
      onChange("scopeType", SCOPE_TYPES.SPECIFIC_CLASSES)
      onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
      if (activeCourse?.id) {
        onChange("courseIds", [activeCourse.id])
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* LEFT COLUMN (8 cols): Thông tin cơ bản, Cấu hình giảm giá, Điều kiện áp dụng, Cấu hình khác */}
      <div className="lg:col-span-8 space-y-6">
        <BasicInfoSection
          form={form}
          errors={errors}
          onChange={onChange}
          onAutoGenerateCode={onAutoGenerateCode}
          isGeneratingCode={isGeneratingCode}
        />

        <ScopeConditionsSection
          form={form}
          errors={errors}
          onChange={onChange}
          isInitialClassContext={isInitialClassContext}
          classNameParam={classNameParam}
          courseDisplayName={courseDisplayName}
          courseClassMode={courseClassMode}
          onSelectClassScope={handleSelectClassScope}
          onSelectCourseScope={handleSelectCourseScope}
          courseClasses={courseClasses}
          filteredClasses={filteredClasses}
          classSearch={classSearch}
          setClassSearch={setClassSearch}
          lowestTuition={lowestTuition}
        />

        <DiscountConfigSection
          form={form}
          errors={errors}
          onChange={onChange}
          isCourseScope={isCourseScope}
          isInitialClassContext={isInitialClassContext}
          lowestTuition={lowestTuition}
          lowestTuitionClassName={lowestTuitionClassName}
          isFixedAmountExceeded={isFixedAmountExceeded}
        />

        <OtherConfigSection
          form={form}
          errors={errors}
          onChange={onChange}
        />
      </div>

      {/* RIGHT COLUMN (4 cols): Thời gian hiệu lực, Giới hạn sử dụng, Ước tính (1 học viên) */}
      <div className="lg:col-span-4 space-y-6">
        <ValiditySection form={form} errors={errors} onChange={onChange} />

        <UsageLimitsSection form={form} errors={errors} onChange={onChange} />

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
