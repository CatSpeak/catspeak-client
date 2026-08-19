import React from "react"
import { Search } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Banner from "@/shared/components/ui/Banner"
import { Radio, Checkbox } from "@/shared/components/ui/inputs"
import { SCOPE_TYPES } from "../../../constants/voucherConstants"
import { formatCurrency } from "../../../utils/voucherTransforms"

export const ScopeConditionsSection = ({
  form,
  errors = {},
  onChange,
  isInitialClassContext,
  classNameParam,
  courseDisplayName,
  courseClassMode,
  onSelectClassScope,
  onSelectCourseScope,
  courseClasses,
  filteredClasses,
  classSearch,
  setClassSearch,
  lowestTuition,
}) => {
  const isCourseScope = form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">Điều kiện áp dụng</h4>

      {(errors?.classIds || errors?.courseIds || errors?.discountType) && (
        <Banner variant="danger">
          {errors.classIds || errors.courseIds || errors.discountType}
        </Banner>
      )}

      {/* Context 1: When inside Class Scope context */}
      {isInitialClassContext ||
      (form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES &&
        !isCourseScope &&
        courseClassMode !== "specific_classes") ? (
        <div className="space-y-3">
          {/* Option: Lớp học này */}
          <div
            onClick={onSelectClassScope}
            className={`group block p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
              form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES
                ? "border-cath-red-700/80 bg-cath-red-50/20 ring-1 ring-cath-red-700/20"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio
                checked={form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES}
                onChange={onSelectClassScope}
              />
              <span className="text-xs font-bold text-slate-900">
                Lớp học này {classNameParam ? `(${classNameParam})` : ""}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 ml-8.5 mt-0.5">
              Voucher chỉ áp dụng cho học viên đăng ký lớp học hiện tại.
            </p>
          </div>

          {/* Option: Khóa học cụ thể */}
          <div
            onClick={() => onSelectCourseScope("all_classes")}
            className={`group block p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
              form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES
                ? "border-cath-red-700/80 bg-cath-red-50/20 ring-1 ring-cath-red-700/20"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio
                checked={form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES}
                onChange={() => onSelectCourseScope("all_classes")}
              />
              <span className="text-xs font-bold text-slate-900">
                Khóa học cụ thể ({courseDisplayName})
              </span>
            </div>
          </div>

          {/* Blue note for class scope */}
          <Banner variant="info">
            Lưu ý: Chỉ lớp của bạn mới được áp dụng.
          </Banner>
        </div>
      ) : (
        /* Context 2: When inside Course Scope context (Image 1 & Image 3) */
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs">
              Áp dụng cho<span className="text-red-500 ml-0.5">*</span>
            </span>
            <div className="flex flex-col">
              <div className="group flex items-center gap-2 select-none opacity-40 cursor-not-allowed text-secondary">
                <Radio
                  withWrapper
                  checked={false}
                  disabled={true}
                />
                <span>Tất cả khóa học</span>
              </div>

              <div className="group flex items-center gap-2 cursor-pointer select-none">
                <Radio
                  withWrapper
                  checked={true}
                  onChange={() => {}}
                />
                <span>Khóa học cụ thể ({courseDisplayName})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs">
              Phạm vi áp dụng trong khóa
            </span>
            <div className="flex flex-col">
              <div
                onClick={() => onSelectCourseScope("all_classes")}
                className="group flex items-center gap-2 cursor-pointer select-none"
              >
                <Radio
                  withWrapper
                  checked={courseClassMode === "all_classes"}
                  onChange={() => onSelectCourseScope("all_classes")}
                />
                <span>
                  Tất cả lớp trong khóa ({courseClasses?.length || 0} lớp)
                </span>
              </div>

              <div
                onClick={() => onSelectCourseScope("specific_classes")}
                className="group flex items-center gap-2 cursor-pointer select-none"
              >
                <Radio
                  withWrapper
                  checked={courseClassMode === "specific_classes"}
                  onChange={() => onSelectCourseScope("specific_classes")}
                />
                <span>Chọn lớp cụ thể</span>
              </div>
            </div>
          </div>

          {/* Specific Classes Picker */}
          {courseClassMode === "specific_classes" && (
            <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  placeholder="Tìm lớp..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cath-red-500/20 focus:border-cath-red-500"
                />
              </div>

              {/* Checkbox list */}
              <div className="max-h-48 overflow-y-auto bg-white rounded-xl border border-slate-200 p-1.5 space-y-1 shadow-2xs">
                {filteredClasses.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">
                    Không tìm thấy lớp học nào trong khóa.
                  </p>
                ) : (
                  filteredClasses.map((cls) => {
                    const isChecked =
                      form.classIds?.includes(cls.id) ||
                      form.classIds?.includes(Number(cls.id))
                    const tuition = cls.price ?? cls.tuitionFee ?? 900000
                    return (
                      <div
                        key={cls.id}
                        onClick={() => {
                          const currentIds = form.classIds || []
                          const next = isChecked
                            ? currentIds.filter(
                                (id) =>
                                  id !== cls.id && id !== Number(cls.id),
                              )
                            : [...currentIds, cls.id]
                          onChange("classIds", next)
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-colors select-none ${
                          isChecked
                            ? "bg-cath-red-50/60 text-cath-red-900 font-bold border border-cath-red-200/60"
                            : "hover:bg-slate-50 text-slate-700 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <Checkbox
                            checked={Boolean(isChecked)}
                            onChange={() => {}}
                          />
                          <span className="truncate">
                            {cls.name || cls.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal shrink-0">
                          (Học phí: {formatCurrency(tuition)}/người)
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-600 font-medium">
                  Đã chọn: <strong>{form.classIds?.length || 0}</strong> lớp
                </span>
                {form.classIds?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange("classIds", [])}
                    className="text-xs text-cath-red-700 hover:underline font-semibold cursor-pointer"
                  >
                    [Xóa tất cả]
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lowest Tuition Info Banner */}
          <Banner variant="info">
            {courseClassMode === "specific_classes"
              ? `Lớp thấp nhất trong lớp đã chọn: ${formatCurrency(lowestTuition)}. Giá trị giảm phải < ${formatCurrency(lowestTuition)}`
              : `Lớp có học phí thấp nhất: ${formatCurrency(lowestTuition)}. Giá trị giảm phải < ${formatCurrency(lowestTuition)}`}
          </Banner>

          {/* Restriction Notice */}
          <Banner variant="info">
            Lưu ý: Chỉ lớp/khóa của bạn mới được áp dụng.
          </Banner>
        </div>
      )}
    </FluentCard>
  )
}

export default ScopeConditionsSection
