import React, { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import {
  useGetInstructorProfileQuery,
  useApplyInstructorMutation,
  useUpdateInstructorProfileMutation,
} from "@/store/api/instructorApi"

import InstructorEmptyState from "../components/instructor/InstructorEmptyState"
import InstructorStatusBanner from "../components/instructor/InstructorStatusBanner"

import InstructorInfoSection from "../components/instructor/InstructorInfoSection"
import InstructorBackgroundSection from "../components/instructor/InstructorBackgroundSection"
import InstructorSubmitSection from "../components/instructor/InstructorSubmitSection"

const INITIAL_FORM_DATA = {
  fullName: "",
  email: "",
  address: "",
  phoneNumber: "",
  nationality: "",
  languagesTeach: [],
  levelCode: "English - B2",
  levelLanguage: "Tiếng Việt",
  nativeLanguage: "English",
  idFrontFile: null,
  idBackFile: null,
  introduction: "",
  credentials: [],
  videoFile: null,
}

/**
 * Safely parse a value that may be a JSON string (array), a comma-separated
 * string, or already an array. Returns an array.
 */
function safeParseArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== "string") return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [value]
  } catch {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
}

/**
 * Map GET /InstructorProfile/my response into form data shape.
 */
function mapApplicationToFormData(app) {
  if (!app) return null
  return {
    fullName: app.fullName || app.FullName || "",
    email: app.email || app.Email || "",
    address: app.address || app.Address || "",
    phoneNumber: app.phoneNumber || app.PhoneNumber || "",
    nationality: app.nationality || app.Nationality || "",
    languagesTeach: safeParseArray(app.languagesTeach || app.LanguagesTeach),
    levelCode: app.levelCode || app.LevelCode || "English - B2",
    levelLanguage: app.levelLanguage || app.LevelLanguage || "Tiếng Việt",
    nativeLanguage: app.nativeLanguage || app.NativeLanguage || "English",
    idFrontFile: app.idCardFrontUrl || app.IdCardFrontUrl || null,
    idBackFile: app.idCardBackUrl || app.IdCardBackUrl || null,
    introduction: app.introduction || app.Introduction || "",
    credentials: safeParseArray(app.credentialUrls || app.CredentialUrls),
    videoFile: app.introVideoUrl || app.IntroVideoUrl || null,
  }
}

/** Extract status string from API response (case-insensitive normalize) */
function getApplicationStatus(app) {
  const raw = app?.status || app?.Status || ""
  const normalized = raw.toString().toLowerCase()
  if (normalized === "pending") return "Pending"
  if (normalized === "approved") return "Approved"
  if (normalized === "rejected") return "Rejected"
  if (normalized === "requestedit") return "RequestEdit"
  return raw || null
}

const InstructorPage = () => {
  const { t } = useLanguage()
  const ins = t.profile?.instructor || {}

  // --- API hooks ---
  const {
    data: instructorData,
    isLoading: isLoadingInstructor,
    error: profileError,
  } = useGetInstructorProfileQuery()

  const { data: userProfileData, isLoading: isLoadingProfile } =
    useGetUserProfileQuery()

  const [applyInstructor, { isLoading: isApplying }] =
    useApplyInstructorMutation()

  const [updateInstructor, { isLoading: isUpdating }] =
    useUpdateInstructorProfileMutation()

  const isSubmitting = isApplying || isUpdating

  // 404 means user has never applied
  const hasNotApplied =
    profileError?.status === 404 || profileError?.originalStatus === 404

  // Extract application data and status
  const rawApplication = useMemo(() => {
    return instructorData?.data || instructorData || null
  }, [instructorData])

  const applicationStatus = useMemo(
    () => (rawApplication && !hasNotApplied ? getApplicationStatus(rawApplication) : null),
    [rawApplication, hasNotApplied],
  )

  const existingApplication = useMemo(
    () => (rawApplication && !hasNotApplied ? mapApplicationToFormData(rawApplication) : null),
    [rawApplication, hasNotApplied],
  )

  // Determine UI mode:
  // - "new"        → first-time application form
  // - "view"       → read-only (Pending, Approved, Rejected)
  // - "requestEdit"→ editable form with resubmit (RequestEdit status)
  const isRequestEdit = applicationStatus === "RequestEdit"
  const isViewMode = !!existingApplication && !isRequestEdit

  // Local UI state
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [editingField, setEditingField] = useState(null)
  const [agreed, setAgreed] = useState(false)
  const [hasPreFilled, setHasPreFilled] = useState(false)

  // Snapshot of the original form data to detect changes
  const originalFormDataRef = useRef(null)

  // Populate form from existing application
  useEffect(() => {
    if (existingApplication) {
      setFormData(existingApplication)
      originalFormDataRef.current = existingApplication
    }
  }, [existingApplication])

  // Pre-fill form from user profile (new applications only)
  useEffect(() => {
    if (!hasPreFilled && showForm && !existingApplication && userProfileData?.data) {
      const profile = userProfileData.data
      setFormData((prev) => ({
        ...prev,
        fullName: profile.username || prev.fullName,
        email: profile.email || prev.email,
        address: profile.address || prev.address,
        phoneNumber: profile.phoneNumber || prev.phoneNumber,
        nationality: profile.country || prev.nationality,
      }))
      setHasPreFilled(true)
      // Capture the auto-filled state as the original for new applications
      setTimeout(() => {
        setFormData((current) => {
          originalFormDataRef.current = current
          return current
        })
      }, 0)
    }
  }, [showForm, userProfileData, hasPreFilled, existingApplication])

  // File input refs
  const idFrontInputRef = useRef(null)
  const idBackInputRef = useRef(null)
  const credentialInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // Can edit when: new form (no existing application) OR RequestEdit status
  const canEdit = (showForm && !existingApplication) || isRequestEdit

  // Detect if user has made any changes from the original data
  const hasChanges = useMemo(() => {
    if (!originalFormDataRef.current) return true // new empty form = always allow
    return JSON.stringify(formData) !== JSON.stringify(originalFormDataRef.current)
  }, [formData])

  // --- Handlers ---

  const handleChange = useCallback(
    (e) => {
      if (!canEdit) return
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    },
    [canEdit],
  )

  const handleCountryChange = useCallback(
    (val) => {
      if (!canEdit) return
      setFormData((prev) => ({ ...prev, nationality: val }))
    },
    [canEdit],
  )

  const handleLanguagesChange = useCallback(
    (languages) => {
      if (!canEdit) return
      setFormData((prev) => ({ ...prev, languagesTeach: languages }))
    },
    [canEdit],
  )

  const handleEdit = useCallback(
    (field) => {
      if (!canEdit) return
      if (field === "idFront") {
        idFrontInputRef.current?.click()
        return
      }
      if (field === "idBack") {
        idBackInputRef.current?.click()
        return
      }
      setEditingField(field)
    },
    [canEdit],
  )

  const handleCancel = useCallback(() => setEditingField(null), [])
  const handleSave = useCallback(() => setEditingField(null), [])



  const handleFileChange = useCallback(
    (fieldName) => (e) => {
      if (!canEdit) return
      const file = e.target.files?.[0]
      if (!file) return
      setFormData((prev) => ({ ...prev, [fieldName]: file }))
    },
    [canEdit],
  )

  const handleAddCredential = useCallback(() => {
    if (!canEdit) return
    credentialInputRef.current?.click()
  }, [canEdit])

  const handleCredentialFileChange = useCallback(
    (e) => {
      if (!canEdit) return
      const files = Array.from(e.target.files || [])
      if (!files.length) return
      setFormData((prev) => ({
        ...prev,
        credentials: [...prev.credentials, ...files].slice(0, 4),
      }))
      e.target.value = ""
    },
    [canEdit],
  )

  const handleSelectVideo = useCallback(() => {
    if (!canEdit) return
    videoInputRef.current?.click()
  }, [canEdit])

  const handleVideoFileChange = useCallback(
    (e) => {
      if (!canEdit) return
      const file = e.target.files?.[0]
      if (!file) return
      setFormData((prev) => ({ ...prev, videoFile: file }))
    },
    [canEdit],
  )

  const buildPayload = useCallback(() => ({
    fullName: formData.fullName,
    email: formData.email,
    address: formData.address,
    phoneNumber: formData.phoneNumber,
    nationality: formData.nationality,
    languagesTeach: formData.languagesTeach,
    nativeLanguage: formData.nativeLanguage,
    introduction: formData.introduction,
    idCardFront: formData.idFrontFile,
    idCardBack: formData.idBackFile,
    credentials: formData.credentials,
    introVideo: formData.videoFile,
  }), [formData])

  const handleSubmit = useCallback(async () => {
    if (!agreed || isSubmitting) return

    try {
      if (isRequestEdit) {
        // PUT /my for resubmission
        await updateInstructor(buildPayload()).unwrap()
      } else {
        // POST /apply for new applications
        await applyInstructor(buildPayload()).unwrap()
      }
      setShowForm(false)
      setAgreed(false)
    } catch (err) {
      console.error("Failed to submit instructor application:", err)
    }
  }, [agreed, isSubmitting, isRequestEdit, applyInstructor, updateInstructor, buildPayload])

  // --- Render ---

  if (isLoadingInstructor || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#990011] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not applied + not showing form → empty state
  if (hasNotApplied && !showForm) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-[#990011]">{ins.title}</h1>
        <InstructorEmptyState onApply={() => setShowForm(true)} t={t} />
      </div>
    )
  }

  // Determine readOnly for section components
  const readOnly = !canEdit

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold text-[#990011]">{ins.title}</h1>

      {/* Status Banner — shown when an application exists */}
      {applicationStatus && (
        <InstructorStatusBanner
          status={applicationStatus}
          rejectReason={rawApplication?.rejectReason || rawApplication?.RejectReason}
          banUntil={rawApplication?.banUntil || rawApplication?.BanUntil}
          editRequestNote={rawApplication?.editRequestNote || rawApplication?.EditRequestNote}
          t={t}
        />
      )}


      <InstructorInfoSection
        formData={formData}
        editingField={readOnly ? null : editingField}
        isUpdating={isSubmitting}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onChange={handleChange}
        onCountryChange={handleCountryChange}
        onLanguagesChange={handleLanguagesChange}
        readOnly={readOnly}
        t={t}
      />

      <InstructorBackgroundSection
        formData={formData}
        onChange={handleChange}
        onAddCredential={handleAddCredential}
        onSelectVideo={handleSelectVideo}
        readOnly={readOnly}
        t={t}
      />

      {/* Submit section — shown for new applications and RequestEdit */}
      {canEdit && (
        <InstructorSubmitSection
          agreed={agreed}
          onAgreeChange={setAgreed}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={!hasChanges}
          submitLabel={isRequestEdit ? ins.resubmit : undefined}
          updatingLabel={isRequestEdit ? ins.updating : undefined}
          t={t}
        />
      )}

      {/* Hidden file inputs — only in edit mode */}
      {canEdit && (
        <>

          <input ref={idFrontInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange("idFrontFile")} />
          <input ref={idBackInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange("idBackFile")} />
          <input ref={credentialInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleCredentialFileChange} />
          <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={handleVideoFileChange} />
        </>
      )}
    </div>
  )
}

export default InstructorPage
