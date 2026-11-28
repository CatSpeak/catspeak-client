import React from "react"
import { BookOpen, GraduationCap } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { useLanguage } from "@/shared/context/LanguageContext"
import { DISCOUNT_TYPES, SCOPE_TYPES } from "../../../constants/voucherConstants"
import { formatCurrency } from "../../../utils/voucherTransforms"

const scopeOptionClass = (active) =>
  `flex flex-1 items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
    active
      ? "border-[#6E0009] bg-[#FFF5F5] dark:bg-[#6E0009]/20 text-[#6E0009] dark:text-[#FF8A8A]"
      : "border-[#E3BEBA] dark:border-[#3F3F3F] text-[#14171F] dark:text-gray-200 hover:border-[#6E0009]/60 dark:hover:border-[#FF8A8A]/60"
  }`

const selectClass =
  "w-full rounded-xl border border-[#E3BEBA] dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] text-[#14171F] dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6E0009]/30 dark:focus:ring-[#FF8A8A]/30"

/**
 * ISS-29: scope picker shown on the bare `/workspace/vouchers/create` route.
 * When the page is opened from a class/course tab (or while editing a draft),
 * the scope is already fixed by context and this card is not rendered.
 */
export const ScopeSelectorSection = ({
  form,
  errors = {},
  onChange,
  teacherClasses = [],
  teacherCourses = [],
}) => {
  const { t } = useLanguage()
  const formT = t?.vouchers?.form || {}
  const isCourseScope = form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES
  const scopeError = errors.classIds || errors.courseIds

  const lowestTuitionForCourse = React.useCallback(
    (courseId) => {
      const prices = teacherClasses
        .filter((c) => String(c.courseId) === String(courseId))
        .map((c) => Number(c.price ?? c.tuitionFee ?? 0))
        .filter((price) => price > 0)
      return prices.length > 0 ? Math.min(...prices) : 0
    },
    [teacherClasses],
  )

  const handleScopeType = (scopeType) => {
    if (scopeType === form.scopeType) return
    onChange("scopeType", scopeType)
    if (scopeType === SCOPE_TYPES.SPECIFIC_COURSES) {
      onChange("classIds", [])
      onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)
    } else {
      onChange("courseIds", [])
      onChange("discountType", DISCOUNT_TYPES.PERCENTAGE)
    }
  }

  const handleClassSelect = (event) => {
    const rawId = event.target.value
    if (!rawId) return
    const selected = teacherClasses.find(
      (c) => String(c.id ?? c._id) === String(rawId),
    )
    onChange("scopeType", SCOPE_TYPES.SPECIFIC_CLASSES)
    onChange("classIds", [selected?.id ?? selected?._id ?? rawId])
    onChange("courseIds", [])
    if (isCourseScope) {
      onChange("discountType", DISCOUNT_TYPES.PERCENTAGE)
    }
    const price = Number(selected?.price ?? selected?.tuitionFee ?? 0)
    if (price > 0) onChange("lowestTuition", price)
  }

  const handleCourseSelect = (event) => {
    const rawId = event.target.value
    if (!rawId) return
    const selected = teacherCourses.find(
      (c) => String(c.id ?? c._id) === String(rawId),
    )
    onChange("scopeType", SCOPE_TYPES.SPECIFIC_COURSES)
    onChange("courseIds", [selected?.id ?? selected?._id ?? rawId])
    onChange("classIds", [])
    onChange("discountType", DISCOUNT_TYPES.FIXED_AMOUNT)

    const lowestTuition = lowestTuitionForCourse(rawId)
    if (lowestTuition > 0) onChange("lowestTuition", lowestTuition)

    const budget = Number(form.maxBudget) || 0
    const discount = Number(form.discountValue) || 0
    if (budget > 0 && discount > 0) {
      onChange("totalUsageLimit", String(Math.floor(budget / discount)))
    }
  }

  const selectedClassId = form.classIds?.[0] ?? ""
  const selectedCourseId = form.courseIds?.[0] ?? ""

  return (
    <FluentCard className="space-y-4" data-testid="scope-selector-section">
      <div>
        <h4 className="font-bold">
          {formT.scopeLabel || "Phạm vi áp dụng"}
        </h4>
        <p className="mt-1 text-xs text-secondary">
          {formT.scopeSelectorHint ||
            "Chọn đối tượng áp dụng cho voucher trước khi cấu hình giảm giá."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          aria-pressed={!isCourseScope}
          onClick={() => handleScopeType(SCOPE_TYPES.SPECIFIC_CLASSES)}
          className={scopeOptionClass(!isCourseScope)}
        >
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            <span className="block text-sm font-semibold">
              {formT.scopeClass || "Áp dụng cho Lớp học"}
            </span>
            <span className="block text-xs opacity-80">
              {formT.scopeClassDesc ||
                "Voucher chỉ áp dụng cho lớp học được chọn."}
            </span>
          </span>
        </button>

        <button
          type="button"
          aria-pressed={isCourseScope}
          onClick={() => handleScopeType(SCOPE_TYPES.SPECIFIC_COURSES)}
          className={scopeOptionClass(isCourseScope)}
        >
          <GraduationCap className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            <span className="block text-sm font-semibold">
              {formT.scopeCourse || "Áp dụng cho Khóa học"}
            </span>
            <span className="block text-xs opacity-80">
              {formT.scopeCourseDesc ||
                "Voucher áp dụng cho mọi lớp học thuộc khóa học được chọn."}
            </span>
          </span>
        </button>
      </div>

      {isCourseScope ? (
        teacherCourses.length === 0 ? (
          <p className="text-sm text-secondary dark:text-gray-300">
            {formT.scopeNoCourses || "Bạn chưa có khóa học nào để áp dụng."}
          </p>
        ) : (
          <label className="block space-y-2">
            <span className="block text-sm font-medium">
              {formT.scopeSelectCourse || "Chọn khóa học"}
            </span>
            <select
              aria-label={formT.scopeSelectCourse || "Chọn khóa học"}
              className={selectClass}
              value={selectedCourseId}
              onChange={handleCourseSelect}
            >
              <option value="">
                {formT.scopeSelectCoursePlaceholder || "-- Chọn khóa học --"}
              </option>
              {teacherCourses.map((course) => {
                const value = course.id ?? course._id
                const name = course.name || course.title || `#${value}`
                const price = Number(course.price ?? course.tuitionFee ?? 0)
                return (
                  <option key={value} value={value}>
                    {price > 0 ? `${name} · ${formatCurrency(price)}` : name}
                  </option>
                )
              })}
            </select>
          </label>
        )
      ) : teacherClasses.length === 0 ? (
        <p className="text-sm text-secondary dark:text-gray-300">
          {formT.scopeNoClasses || "Bạn chưa có lớp học nào để áp dụng."}
        </p>
      ) : (
        <label className="block space-y-2">
          <span className="block text-sm font-medium">
            {formT.scopeSelectClass || "Chọn lớp học"}
          </span>
          <select
            aria-label={formT.scopeSelectClass || "Chọn lớp học"}
            className={selectClass}
            value={selectedClassId}
            onChange={handleClassSelect}
          >
            <option value="">
              {formT.scopeSelectClassPlaceholder || "-- Chọn lớp học --"}
            </option>
            {teacherClasses.map((cls) => {
              const value = cls.id ?? cls._id
              const name = cls.name || cls.title || `#${value}`
              const price = Number(cls.price ?? cls.tuitionFee ?? 0)
              return (
                <option key={value} value={value}>
                  {price > 0 ? `${name} · ${formatCurrency(price)}` : name}
                </option>
              )
            })}
          </select>
        </label>
      )}

      {scopeError && (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {scopeError}
        </p>
      )}
    </FluentCard>
  )
}

export default ScopeSelectorSection
