import React, { useMemo, useState } from "react"
import { Info } from "lucide-react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import {
  useGetInstructorLanguagesQuery,
  useGetInstructorLanguageLevelsQuery,
  useSubmitLanguageRequestMutation,
} from "@/store/api/instructorApi"
import { toast } from "@/shared/utils/toastBridge"
import { parseApiError } from "@/shared/utils/apiError"
import { fileNameFromUrl, pick } from "./utils"
import FormSelect from "./FormSelect"
import CertificateField from "./CertificateField"

const REQUEST_TYPE_UPDATE = 1

const toList = (data) => {
  const raw = data?.data ?? data
  return Array.isArray(raw) ? raw : []
}

const SummaryRow = ({ label, value }) => (
  <div className="flex h-12 items-center gap-2">
    <span className="w-[175px] shrink-0 text-[11px] font-medium text-[#667085]">
      {label}
    </span>
    <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#101828]">
      {value || "—"}
    </span>
  </div>
)

/**
 * "Cập nhật <ngôn ngữ>" drawer: read-only current info, then a new level
 * (excluding the current one) and a new certificate PDF, submitted as an
 * Update request (RequestType 1) for the same approved language.
 */
const UpdateLanguageDrawer = ({
  open,
  onClose,
  language,
  currentLevel,
  currentCredentialUrl,
  t,
}) => {
  const ins = t.profile?.instructor || {}
  const [level, setLevel] = useState("")
  const [certificate, setCertificate] = useState(null)
  const [submitError, setSubmitError] = useState("")

  const { data: languagesData } = useGetInstructorLanguagesQuery(undefined, {
    skip: !open,
  })

  const languageId = useMemo(() => {
    const match = toList(languagesData).find(
      (item) => pick(item, "name", "Name") === language,
    )
    return match ? pick(match, "id", "Id") : undefined
  }, [languagesData, language])

  const { data: levelsData } = useGetInstructorLanguageLevelsQuery(languageId, {
    skip: !open || !languageId,
  })

  const levelOptions = useMemo(
    () =>
      toList(levelsData)
        .map((item) => pick(item, "name", "Name"))
        .filter(
          (name) =>
            name &&
            String(name).toLowerCase() !==
              String(currentLevel || "").toLowerCase(),
        )
        .map((name) => ({ value: name, label: name })),
    [levelsData, currentLevel],
  )

  const [submitLanguageRequest, { isLoading }] =
    useSubmitLanguageRequestMutation()

  const differs =
    Boolean(level) &&
    String(level).toLowerCase() !== String(currentLevel || "").toLowerCase()
  const canSubmit = differs && Boolean(certificate) && !isLoading

  const languageLabel = t.courses?.student?.languages?.[language] || language
  const title = (ins.languageUpdateTitle || "Cập nhật {language}").replace(
    "{language}",
    languageLabel,
  )

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitError("")
    const formData = new FormData()
    formData.append("Language", language)
    formData.append("Level", level)
    formData.append("RequestType", String(REQUEST_TYPE_UPDATE))
    formData.append("Certificate", certificate)
    try {
      await submitLanguageRequest(formData).unwrap()
      toast.success(
        ins.languageRequestSubmitted || "Đã gửi yêu cầu cho quản trị viên duyệt.",
      )
      onClose?.()
    } catch (err) {
      const { statusCode } = parseApiError(err)
      setSubmitError(
        statusCode === 409
          ? ins.languageRequestConflict || ""
          : ins.languageRequestError || "",
      )
    }
  }

  return (
    <ProfileDrawer
      open={open}
      onClose={onClose}
      title={title}
      secondaryLabel={ins.contactCancel || "Hủy"}
      onSecondary={onClose}
      primaryLabel={ins.languageRequestSubmit || "Gửi yêu cầu"}
      onPrimary={handleSubmit}
      primaryDisabled={!canSubmit}
    >
      <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold text-[#101828]">
          {ins.idCardCurrentInfo || "Thông tin hiện tại"}
        </span>
        <div className="flex flex-col rounded-lg border border-[#D0D5DD] px-4 py-2">
          <SummaryRow
            label={ins.approvedLanguageCol || "Ngôn ngữ"}
            value={languageLabel}
          />
          <div className="h-px w-full bg-[#E4E7EC]" />
          <SummaryRow
            label={ins.approvedLevelCol || "Trình độ"}
            value={currentLevel}
          />
          <div className="h-px w-full bg-[#E4E7EC]" />
          <SummaryRow
            label={ins.approvedCredentialCol || "Chứng chỉ"}
            value={
              currentCredentialUrl ? fileNameFromUrl(currentCredentialUrl) : ""
            }
          />
        </div>

        <span className="text-sm font-semibold text-[#101828]">
          {ins.idCardWantedInfo || "Thông tin muốn cập nhật"}
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.languageNewLevelLabel || "Trình độ mới"}
          </span>
          <FormSelect
            value={level}
            options={levelOptions}
            onChange={setLevel}
            placeholder={ins.languageLevelPlaceholder || "Chọn trình độ"}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.languageCertificateNewLabel || "Chứng chỉ / Bằng cấp mới"}
          </span>
          <CertificateField onChange={setCertificate} t={t} />
        </div>

        <div className="flex items-start gap-2.5 rounded-[7px] bg-[#EFF4FF] px-3.5 py-3">
          <Info size={18} className="mt-0.5 shrink-0 text-[#2E6FE8]" />
          <span className="text-[10px] leading-4 text-[#667085]">
            {ins.languageInfoBox ||
              "Thông tin cũ đã được duyệt sẽ tiếp tục được sử dụng cho đến khi yêu cầu cập nhật mới được phê duyệt."}
          </span>
        </div>

        {submitError && (
          <p role="alert" className="text-xs text-red-500">
            {submitError}
          </p>
        )}
      </div>
    </ProfileDrawer>
  )
}

export default UpdateLanguageDrawer
