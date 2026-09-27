import React, { useMemo, useState } from "react"
import { Calendar, ChevronDown, Globe, Languages, MapPin, Pencil, User } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { DatePicker } from "@/shared/components/ui/inputs"
import Dropdown from "@/shared/components/ui/Dropdown"
import { countryOptions, getCountryOption } from "@/shared/constants/countriesOptions"
import { useUpdateInstructorBasicInfoMutation } from "@/store/api/instructorApi"
import { parseApiError } from "@/shared/utils/apiError"
import { toast } from "@/shared/utils/toastBridge"
import { pick } from "./utils"

const NAME_PATTERN = /^[\p{L}\s'’-]+$/u
const NAME_HAS_LETTER = /\p{L}/u

const formatDateDisplay = (raw) => {
  if (!raw) return "—"
  const str = String(raw).split("T")[0]
  const parts = str.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return str
}

const toCountryValue = (raw) => {
  if (!raw) return ""
  const value = String(raw)
  const byValue = countryOptions.find((option) => option.value === value)
  if (byValue) return byValue.value
  const byLabel = countryOptions.find(
    (option) => option.label.toLowerCase() === value.trim().toLowerCase(),
  )
  return byLabel ? byLabel.value : value
}

const Row = ({ icon, label, children }) => (
  <div className="flex items-center gap-3 border-b border-[#E4E7EC] py-3 pl-1.5 last:border-b-0">
    <span className="flex shrink-0 items-center text-[#101828]">{icon}</span>
    <span className="w-[150px] shrink-0 text-xs font-medium text-[#101828]">
      {label}
    </span>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
)

const inputClass = "!h-9 !rounded-[7px] !px-3 text-xs"

const PersonalInfoCard = ({ profile, t }) => {
  const ins = t.profile?.instructor || {}
  const [updateBasicInfo, { isLoading: isSaving }] =
    useUpdateInstructorBasicInfoMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    fullName: "",
    nationality: "",
    address: "",
    introduction: "",
    nativeLanguage: "",
    dateOfBirth: "",
  })

  const nativeLanguageOptions = useMemo(
    () => [
      {
        value: "English",
        label: t?.courses?.student?.languages?.English || "English",
      },
      {
        value: "中文",
        label: t?.courses?.student?.languages?.Chinese || "中文",
      },
      {
        value: "Tiếng Việt",
        label: t?.courses?.student?.languages?.Vietnamese || "Tiếng Việt",
      },
      {
        value: "日本語",
        label: t?.courses?.student?.languages?.Japanese || "日本語",
      },
    ],
    [t],
  )

  const rawNationality = pick(profile, "nationality", "Nationality")
  const nationalityOption = useMemo(
    () => getCountryOption(rawNationality),
    [rawNationality],
  )

  const startEdit = () => {
    const rawDob = pick(profile, "dateOfBirth", "DateOfBirth")
    setForm({
      fullName: String(pick(profile, "fullName", "FullName") || ""),
      nationality: toCountryValue(pick(profile, "nationality", "Nationality")),
      address: String(pick(profile, "address", "Address") || ""),
      introduction: String(pick(profile, "introduction", "Introduction") || ""),
      nativeLanguage:
        pick(profile, "nativeLanguage", "NativeLanguage") || "",
      dateOfBirth: rawDob ? String(rawDob).split("T")[0] : "",
    })
    setErrors({})
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setErrors({})
    setIsEditing(false)
  }

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const validate = () => {
    const next = {}
    const fullName = form.fullName.trim()
    if (!fullName) {
      next.fullName = ins.approvedFullNameRequired || "Vui lòng nhập họ và tên"
    } else if (fullName.length < 2 || fullName.length > 100) {
      next.fullName =
        ins.approvedFullNameLength || "Họ và tên phải có từ 2 đến 100 ký tự"
    } else if (!NAME_PATTERN.test(fullName) || !NAME_HAS_LETTER.test(fullName)) {
      next.fullName =
        ins.approvedFullNameInvalid ||
        "Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu gạch nối và dấu nháy đơn"
    }

    if (form.dateOfBirth) {
      const dobDate = new Date(form.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dobDate.getFullYear()
      const m = today.getMonth() - dobDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--
      }
      if (isNaN(dobDate.getTime())) {
        next.dateOfBirth = ins.approvedDateOfBirthInvalid || "Ngày sinh không hợp lệ"
      } else if (age < 18) {
        next.dateOfBirth = ins.approvedDateOfBirthAge || "Giảng viên phải từ 18 tuổi trở lên"
      }
    }

    if (!form.nationality) {
      next.nationality =
        ins.approvedNationalityRequired || "Vui lòng chọn quốc tịch"
    }

    if (
      !form.nativeLanguage ||
      !nativeLanguageOptions.some(
        (option) => option.value === form.nativeLanguage,
      )
    ) {
      next.nativeLanguage =
        ins.approvedNativeLanguageRequired || "Vui lòng chọn ngôn ngữ mẹ đẻ"
    }

    const address = form.address.trim()
    if (!address) {
      next.address = ins.approvedAddressRequired || "Vui lòng nhập địa chỉ"
    } else if (address.length < 5 || address.length > 255) {
      next.address =
        ins.approvedAddressLength || "Địa chỉ phải có từ 5 đến 255 ký tự"
    }

    if (form.introduction.trim().length > 300) {
      next.introduction =
        ins.approvedIntroMax || "Giới thiệu bản thân tối đa 300 ký tự"
    }

    return next
  }

  const handleSave = async () => {
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    try {
      await updateBasicInfo({
        FullName: form.fullName.trim(),
        Nationality: form.nationality,
        Address: form.address.trim(),
        Introduction: form.introduction.trim(),
        NativeLanguage: form.nativeLanguage,
        DateOfBirth: form.dateOfBirth || null,
      }).unwrap()
      setIsEditing(false)
      toast.success(
        ins.approvedPersonalInfoSaved ||
          "Cập nhật thông tin cá nhân thành công",
      )
    } catch (err) {
      const { message } = parseApiError(err)
      toast.error(
        message ||
          ins.approvedPersonalInfoSaveError ||
          "Không thể cập nhật thông tin cá nhân",
      )
    }
  }

  return (
    <FluentCard
      rounded="rounded-[10px]"
      padding="p-5"
      className="!justify-start gap-2.5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#101828]">
          {ins.approvedPersonalInfo || "Thông tin cá nhân"}
        </h2>
        {!isEditing && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[7px] border border-[#990011] px-3 text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5"
          >
            <Pencil size={15} />
            <span>{ins.edit || "Chỉnh sửa"}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col">
          <Row icon={<User size={20} />} label={ins.fullName || "Họ và tên"}>
            <div className="flex flex-col gap-1 w-full">
              <TextInput
                name="fullName"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder={ins.inputFieldPlaceholder || "Nhập thông tin"}
                error={errors.fullName}
                className={inputClass}
                containerClassName="!gap-1"
                disabled={true}
              />
              <p className="text-[11px] text-[#667085]">
                {ins.fullNameKycNote || "Họ và tên gắn liền với định danh CCCD và không thể thay đổi."}
              </p>
            </div>
          </Row>
          <Row icon={<Calendar size={20} />} label={t.profile?.personalInfo?.dateOfBirth || t.auth?.dateOfBirthLabel || "Ngày sinh"}>
            <DatePicker
              value={form.dateOfBirth}
              onChange={(d) => {
                if (!d) return
                const formattedDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0')
                handleChange("dateOfBirth", formattedDate)
              }}
              disabled={isSaving}
              className={`w-full flex ${errors.dateOfBirth ? "[&>button]:!border-red-500" : "[&>button]:!border-[#D0D5DD]"} [&>button]:!h-9 [&>button]:!rounded-[7px] [&>button]:!bg-white [&>button]:w-full [&>button]:justify-between [&>button]:!text-xs`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>
            )}
          </Row>
          <Row icon={<Globe size={20} />} label={ins.nationality || "Quốc tịch"}>
            <Dropdown
              options={countryOptions}
              value={form.nationality}
              onChange={(value) => handleChange("nationality", value)}
              disabled={isSaving}
              enableSearch
              searchPlaceholder={ins.searchCountry || "Tìm kiếm quốc gia..."}
              placeholder={ins.selectNationality || "Chọn quốc tịch"}
              dropdownClassName="w-full min-w-[260px]"
              trigger={(isOpen, selectedOption, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  disabled={isSaving}
                  className={`flex h-9 w-full items-center justify-between gap-2 rounded-[7px] border bg-white px-3 text-xs transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.nationality ? "border-red-500" : "border-[#D0D5DD]"
                  }`}
                >
                  <span
                    className={`flex min-w-0 flex-1 items-center gap-2 truncate ${
                      selectedOption ? "text-[#101828]" : "text-[#98A2B3]"
                    }`}
                  >
                    {selectedOption?.icon}
                    <span className="truncate">
                      {selectedOption
                        ? selectedOption.label
                        : ins.selectNationality || "Chọn quốc tịch"}
                    </span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-[#667085] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            />
            {errors.nationality && (
              <p className="mt-1 text-xs text-red-500">{errors.nationality}</p>
            )}
          </Row>
          <Row icon={<Languages size={20} />} label={ins.nativeLanguage || "Ngôn ngữ mẹ đẻ"}>
            <Dropdown
              options={nativeLanguageOptions}
              value={form.nativeLanguage}
              onChange={(value) => handleChange("nativeLanguage", value)}
              disabled={isSaving}
              placeholder={ins.selectNativeLanguage || "Chọn ngôn ngữ mẹ đẻ"}
              dropdownClassName="w-full min-w-[260px]"
              trigger={(isOpen, selectedOption, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  disabled={isSaving}
                  className={`flex h-9 w-full items-center justify-between gap-2 rounded-[7px] border bg-white px-3 text-xs transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.nativeLanguage ? "border-red-500" : "border-[#D0D5DD]"
                  }`}
                >
                  <span
                    className={`flex min-w-0 flex-1 items-center gap-2 truncate ${
                      selectedOption ? "text-[#101828]" : "text-[#98A2B3]"
                    }`}
                  >
                    <span className="truncate">
                      {selectedOption
                        ? selectedOption.label
                        : ins.selectNativeLanguage || "Chọn ngôn ngữ mẹ đẻ"}
                    </span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-[#667085] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            />
            {errors.nativeLanguage && (
              <p className="mt-1 text-xs text-red-500">
                {errors.nativeLanguage}
              </p>
            )}
          </Row>
          <Row icon={<MapPin size={20} />} label={ins.address || "Địa chỉ"}>
            <TextInput
              name="address"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder={ins.inputFieldPlaceholder || "Nhập thông tin"}
              error={errors.address}
              className={inputClass}
              containerClassName="!gap-1"
              disabled={isSaving}
            />
          </Row>
        </div>
      ) : (
        <div className="flex flex-col">
          <Row
            icon={<User size={20} />}
            label={ins.fullName || "Họ và tên"}
          >
            <span className="break-words text-xs text-[#101828]">
              {pick(profile, "fullName", "FullName") || "—"}
            </span>
          </Row>
          <Row
            icon={<Calendar size={20} />}
            label={t.profile?.personalInfo?.dateOfBirth || t.auth?.dateOfBirthLabel || "Ngày sinh"}
          >
            <span className="break-words text-xs text-[#101828]">
              {formatDateDisplay(pick(profile, "dateOfBirth", "DateOfBirth"))}
            </span>
          </Row>
          <Row
            icon={<Globe size={20} />}
            label={ins.nationality || "Quốc tịch"}
          >
            {nationalityOption ? (
              <span className="inline-flex items-center gap-2 text-xs text-[#101828]">
                {nationalityOption.icon}
                <span>{nationalityOption.label}</span>
              </span>
            ) : (
              <span className="break-words text-xs text-[#101828]">
                {rawNationality || "—"}
              </span>
            )}
          </Row>
          <Row
            icon={<Languages size={20} />}
            label={ins.nativeLanguage || "Ngôn ngữ mẹ đẻ"}
          >
            <span className="break-words text-xs text-[#101828]">
              {pick(profile, "nativeLanguage", "NativeLanguage") || "—"}
            </span>
          </Row>
          <Row icon={<MapPin size={20} />} label={ins.address || "Địa chỉ"}>
            <span className="break-words text-xs text-[#101828]">
              {pick(profile, "address", "Address") || "—"}
            </span>
          </Row>
        </div>
      )}

      <div className="text-[13px] font-semibold text-[#101828]">
        {ins.introduceYourself || "Giới thiệu bản thân"}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2.5">
          <TextInput
            multiline
            name="introduction"
            value={form.introduction}
            onChange={(e) => handleChange("introduction", e.target.value)}
            placeholder={ins.introPlaceholder || ""}
            error={errors.introduction}
            maxLength={300}
            className="!min-h-[92px] !rounded-[7px] !px-3.5 !py-3 text-xs"
            containerClassName="!gap-1"
            disabled={isSaving}
          />
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="h-9 w-[90px] shrink-0 rounded-[7px] border border-[#990011] bg-white text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5 disabled:opacity-50"
            >
              {ins.approvedCancelEdit || "Hủy"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-9 w-[114px] shrink-0 items-center justify-center gap-2 rounded-[7px] border border-[#990011] bg-[#990011] text-xs font-semibold text-white transition-colors hover:bg-[#7a000e] disabled:opacity-50"
            >
              {isSaving && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{ins.approvedSaveChanges || "Lưu thay đổi"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[132px] whitespace-pre-wrap rounded-[7px] border border-[#D0D5DD] p-3.5 text-xs text-[#101828]">
          {pick(profile, "introduction", "Introduction") || "—"}
        </div>
      )}
    </FluentCard>
  )
}

export default PersonalInfoCard
