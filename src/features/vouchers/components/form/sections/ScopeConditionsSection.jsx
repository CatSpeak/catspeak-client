/**
 * @deprecated
 * NOTE: This component was previously used for hybrid multi-class selection inside Course vouchers.
 * The voucher creation architecture has since been simplified into strict Course Scope vs Class Scope.
 * This file is currently unmounted and retained for potential future reference (e.g. global voucher hubs).
 */
import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Banner from "@/shared/components/ui/Banner"
import ListItem from "@/shared/components/ui/ListItem"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { Radio, Checkbox, SearchInput } from "@/shared/components/ui/inputs"
import { useLanguage } from "@/shared/context/LanguageContext"
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
  courseClasses = [],
  filteredClasses = [],
  classSearch,
  setClassSearch,
  lowestTuition,
}) => {
  const { t } = useLanguage()
  const vf = t?.vouchers?.form || {}
  const totalCourseClasses = courseClasses?.length || 0
  const isOnlyOneClass = totalCourseClasses === 1
  const firstClass = courseClasses[0]

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">{vf.scopeConditions || "Điều kiện áp dụng"}</h4>

      {(errors?.classIds || errors?.courseIds || errors?.discountType) && (
        <Banner variant="danger">
          {errors.classIds || errors.courseIds || errors.discountType}
        </Banner>
      )}

      {/* Scope selection inside course */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-700">
          {vf.scopeInCourse || "Phạm vi áp dụng trong khóa"}
          <span className="text-red-500 ml-0.5">*</span>
        </span>

            <div className="space-y-1.5">
              {/* Option 1: Toàn bộ lớp trong khóa */}
              <ListItem
                lines={1}
                onClick={() => onSelectCourseScope("all_classes")}
                selected={courseClassMode === "all_classes"}
                leftContent={
                  <Radio
                    checked={courseClassMode === "all_classes"}
                    onChange={() => onSelectCourseScope("all_classes")}
                  />
                }
                className="rounded-xl cursor-pointer"
              >
                <span>{vf.allClassesInCourse || "Toàn bộ lớp trong khóa"}</span>
              </ListItem>

              {/* Option 2: Chọn nhóm lớp trong khóa (Tối thiểu 2 lớp) */}
              <ListItem
                lines={1}
                onClick={() => {
                  if (!isOnlyOneClass) {
                    onSelectCourseScope("specific_classes")
                  }
                }}
                disabled={isOnlyOneClass}
                selected={courseClassMode === "specific_classes"}
                leftContent={
                  <Radio
                    checked={courseClassMode === "specific_classes"}
                    disabled={isOnlyOneClass}
                    onChange={() => {
                      if (!isOnlyOneClass) {
                        onSelectCourseScope("specific_classes")
                      }
                    }}
                  />
                }
                className={`rounded-xl ${
                  isOnlyOneClass
                    ? "opacity-50 cursor-not-allowed bg-slate-50/50"
                    : "cursor-pointer"
                }`}
              >
                <span>
                  {vf.specificClassesInCourse || "Chọn nhóm lớp trong khóa (tối thiểu 2 lớp)"}
                </span>
              </ListItem>
            </div>
          </div>

          {/* Specific Classes Picker (When specific_classes is selected and >= 2 classes exist) */}
          {courseClassMode === "specific_classes" && !isOnlyOneClass && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              {/* Search */}
              <SearchInput
                value={classSearch}
                onChange={setClassSearch}
                placeholder={
                  vf.searchClasses || "Tìm kiếm lớp học trong khóa..."
                }
              />

              {/* Checkbox list */}
              <FluentCard
                padding="p-1"
                className="max-h-[260px] overflow-y-auto min-h-0 !justify-start space-y-1 pr-1 scrollbar-thin"
              >
                {filteredClasses.length === 0 ? (
                  <p className="text-xs text-secondary text-center py-4">
                    {vf.noClassesFoundInCourse ||
                      "Không tìm thấy lớp học nào trong khóa."}
                  </p>
                ) : (
                  filteredClasses.map((cls) => {
                    const isChecked =
                      form.classIds?.includes(cls.id) ||
                      form.classIds?.includes(Number(cls.id))
                    const tuition = cls.price ?? cls.tuitionFee ?? 900000
                    return (
                      <ListItem
                        key={cls.id}
                        lines={1}
                        onClick={() => {
                          const currentIds = form.classIds || []
                          const next = isChecked
                            ? currentIds.filter(
                                (id) => id !== cls.id && id !== Number(cls.id),
                              )
                            : [...currentIds, cls.id]
                          onChange("classIds", next)
                        }}
                        selected={Boolean(isChecked)}
                        leftContent={
                          <Checkbox
                            checked={Boolean(isChecked)}
                            onChange={() => {}}
                          />
                        }
                        rightContent={
                          <span className="text-xs text-secondary font-medium shrink-0">
                            {formatCurrency(tuition)}
                          </span>
                        }
                        className="rounded-xl cursor-pointer"
                      >
                        <span className="truncate">
                          {cls.name || cls.title}
                        </span>
                      </ListItem>
                    )
                  })
                )}
              </FluentCard>

              {/* Class selection summary & quick actions */}
              <div className="flex items-center justify-between text-xs text-secondary gap-2 pt-0.5 min-h-[32px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium">
                    {`Đã chọn: ${form.classIds?.length || 0} / ${totalCourseClasses} lớp`}
                  </span>
                  {(form.classIds?.length || 0) < 2 ? (
                    <span className="text-amber-600 font-normal">
                      (Cần tối thiểu 2 lớp)
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-normal">
                      (Đủ điều kiện)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(form.classIds?.length || 0) < totalCourseClasses && (
                    <PillButton
                      type="button"
                      variant="secondary-no-outline"
                      onClick={() =>
                        onChange(
                          "classIds",
                          (courseClasses || []).map((c) => c.id),
                        )
                      }
                    >
                      <span>Chọn tất cả</span>
                    </PillButton>
                  )}
                  {(form.classIds?.length || 0) > 0 && (
                    <PillButton
                      type="button"
                      variant="secondary-no-outline"
                      textColor="#990011"
                      onClick={() => onChange("classIds", [])}
                    >
                      <span>{vf.clearAll || "Xóa tất cả"}</span>
                    </PillButton>
                  )}
                </div>
              </div>
            </div>
          )}
    </FluentCard>
  )
}

export default ScopeConditionsSection
