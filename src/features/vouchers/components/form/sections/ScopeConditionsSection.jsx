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
  courseClasses,
  filteredClasses,
  classSearch,
  setClassSearch,
  lowestTuition,
}) => {
  const { t } = useLanguage()
  const vf = t?.vouchers?.form || {}
  const isCourseScope = form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">
        {vf.scopeConditions || "Điều kiện áp dụng"}
      </h4>

      {(errors?.classIds || errors?.courseIds || errors?.discountType) && (
        <Banner variant="danger">
          {errors.classIds || errors.courseIds || errors.discountType}
        </Banner>
      )}

      {/* Context 1: When inside Class Scope context */}
      {isInitialClassContext ? (
        <div className="space-y-1">
          {/* Option: Lớp học này */}
          <ListItem
            lines={2}
            onClick={onSelectClassScope}
            selected={form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES}
            leftContent={
              <Radio
                checked={form.scopeType === SCOPE_TYPES.SPECIFIC_CLASSES}
                onChange={onSelectClassScope}
              />
            }
            className="rounded-xl"
          >
            <span>
              {vf.scopeClass || "Áp dụng theo Lớp học"}{" "}
              {classNameParam ? `(${classNameParam})` : ""}
            </span>
            <span>
              {vf.scopeClassDesc ||
                "Voucher chỉ áp dụng cho học viên đăng ký lớp học hiện tại."}
            </span>
          </ListItem>

          {/* Option: Tất cả lớp trong khóa */}
          <ListItem
            lines={2}
            onClick={() => onSelectCourseScope("all_classes")}
            selected={form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES}
            leftContent={
              <Radio
                checked={form.scopeType === SCOPE_TYPES.SPECIFIC_COURSES}
                onChange={() => onSelectCourseScope("all_classes")}
              />
            }
            className="rounded-xl"
          >
            <span>
              {courseDisplayName
                ? `${vf.allClassesInCourse || "Tất cả lớp trong khóa"} ${courseDisplayName}`
                : vf.allClassesInCourse || "Tất cả lớp trong khóa"}
            </span>
            <span>
              {vf.scopeCourseDesc ||
                "Voucher áp dụng cho mọi lớp học thuộc khóa học này."}
            </span>
          </ListItem>
        </div>
      ) : (
        /* Context 2: When inside Course Scope context */
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs">
              {vf.scopeLabel || "Phạm vi áp dụng"}
              <span className="text-red-500 ml-0.5">*</span>
            </span>
            <div className="space-y-1">
              <ListItem
                lines={1}
                disabled={true}
                selected={false}
                leftContent={<Radio checked={false} disabled={true} />}
                className="rounded-xl opacity-40 cursor-not-allowed text-secondary"
              >
                <span>
                  {vf.scopeAll || "Tất cả khóa/lớp của tôi"}
                </span>
              </ListItem>

              <ListItem
                lines={1}
                selected={true}
                leftContent={<Radio checked={true} />}
                className="rounded-xl cursor-default"
              >
                <span>
                  {vf.scopeCourses || "Khóa học cụ thể"} (
                  {courseDisplayName})
                </span>
              </ListItem>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs">{vf.scopeInCourse || "Phạm vi áp dụng trong khóa"}</span>
            <div className="space-y-1">
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
                className="rounded-xl"
              >
                <span>
                  {vf.allClassesInCourse || "Toàn bộ lớp trong khóa"}{" "}
                  ({courseClasses?.length || 0} lớp)
                </span>
              </ListItem>

              <ListItem
                lines={1}
                onClick={() => onSelectCourseScope("specific_classes")}
                selected={courseClassMode === "specific_classes"}
                leftContent={
                  <Radio
                    checked={courseClassMode === "specific_classes"}
                    onChange={() => onSelectCourseScope("specific_classes")}
                  />
                }
                className="rounded-xl"
              >
                <span>
                  {vf.specificClassesInCourse ||
                    "Chỉ một số lớp trong khóa"}
                </span>
              </ListItem>
            </div>
          </div>

          {/* Specific Classes Picker */}
          {courseClassMode === "specific_classes" && (
            <div className="space-y-2">
              {/* Search */}
              <SearchInput
                value={classSearch}
                onChange={setClassSearch}
                placeholder={
                  vf.searchClasses || "Tìm kiếm lớp học..."
                }
              />

              {/* Checkbox list */}
              <FluentCard
                padding="p-1"
                className="max-h-[300px] overflow-y-auto min-h-0 !justify-start space-y-1 pr-1 scrollbar-thin"
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
                          <span className="text-xs text-secondary shrink-0">
                            {formatCurrency(tuition)}
                          </span>
                        }
                        className="rounded-xl"
                      >
                        <span className="truncate">
                          {cls.name || cls.title}
                        </span>
                      </ListItem>
                    )
                  })
                )}
              </FluentCard>

              <div className="flex items-start justify-between text-xs text-secondary">
                <span>
                  {vf.selectedClassesCount
                    ? vf.selectedClassesCount.replace(
                        "{{count}}",
                        form.classIds?.length || 0,
                      )
                    : `Đã chọn ${form.classIds?.length || 0} lớp`}
                </span>
                {form.classIds?.length > 0 && (
                  <PillButton
                    variant="secondary-no-outline"
                    textColor="#990011"
                    onClick={() => onChange("classIds", [])}
                  >
                    <span>{vf.clearAll || "Xóa tất cả"}</span>
                  </PillButton>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </FluentCard>
  )
}

export default ScopeConditionsSection
