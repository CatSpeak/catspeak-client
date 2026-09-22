import React, { useMemo, useState } from "react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import {
  useGetInstructorLanguagesQuery,
  useGetInstructorLanguageLevelsQuery,
  useSubmitLanguageRequestMutation,
} from "@/store/api/instructorApi"
import { toast } from "@/shared/utils/toastBridge"
import { parseApiError } from "@/shared/utils/apiError"
import { pick } from "./utils"
import FormSelect from "./FormSelect"
import CertificateField from "./CertificateField"

const REQUEST_TYPE_ADD = 0

const toList = (data) => {
  const raw = data?.data ?? data
  return Array.isArray(raw) ? raw : []
}

/**
 * "Thêm ngôn ngữ" drawer: pick a language the teacher does not hold and has no
 * pending request for, its level, and a certificate PDF, then submit a new
 * Add request (RequestType 0) to the admin queue.
 */
const AddLanguageDrawer = ({ open, onClose, excludedLanguages = [], t }) => {
  const ins = t.profile?.instructor || {}
  const [language, setLanguage] = useState("")
  const [level, setLevel] = useState("")
  const [certificate, setCertificate] = useState(null)
  const [submitError, setSubmitError] = useState("")

  const { data: languagesData } = useGetInstructorLanguagesQuery(undefined, {
    skip: !open,
  })

  const languageOptions = useMemo(() => {
    const excluded = new Set(
      excludedLanguages.map((name) => String(name).toLowerCase()),
    )
    return toList(languagesData)
      .filter(
        (item) =>
          !excluded.has(
            String(pick(item, "name", "Name") || "").toLowerCase(),
          ),
      )
      .map((item) => {
        const name = pick(item, "name", "Name")
        return {
          value: name,
          label: t.courses?.student?.languages?.[name] || name,
        }
      })
  }, [languagesData, excludedLanguages, t])

  const languageId = useMemo(() => {
    if (!language) return undefined
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
      toList(levelsData).map((item) => {
        const name = pick(item, "name", "Name")
        return { value: name, label: name }
      }),
    [levelsData],
  )

  const [submitLanguageRequest, { isLoading }] =
    useSubmitLanguageRequestMutation()

  const handleLanguageChange = (value) => {
    setLanguage(value)
    setLevel("")
  }

  const canSubmit =
    Boolean(language) && Boolean(level) && Boolean(certificate) && !isLoading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitError("")
    const formData = new FormData()
    formData.append("Language", language)
    formData.append("Level", level)
    formData.append("RequestType", String(REQUEST_TYPE_ADD))
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
      title={ins.approvedAddLanguage || "Thêm ngôn ngữ"}
      secondaryLabel={ins.contactCancel || "Hủy"}
      onSecondary={onClose}
      primaryLabel={ins.languageRequestSubmit || "Gửi yêu cầu"}
      onPrimary={handleSubmit}
      primaryDisabled={!canSubmit}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.approvedLanguageCol || "Ngôn ngữ"}
          </span>
          <FormSelect
            value={language}
            options={languageOptions}
            onChange={handleLanguageChange}
            placeholder={ins.languageSelectPlaceholder || "Chọn ngôn ngữ"}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.approvedLevelCol || "Trình độ"}
          </span>
          <FormSelect
            value={level}
            options={levelOptions}
            onChange={setLevel}
            placeholder={ins.languageLevelPlaceholder || "Chọn trình độ"}
            disabled={isLoading || !language}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.languageCertificateLabel || "Chứng chỉ / Bằng cấp"}
          </span>
          <CertificateField onChange={setCertificate} t={t} />
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

export default AddLanguageDrawer
