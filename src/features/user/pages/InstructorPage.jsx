import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetUserProfileQuery } from "@/store/api/userApi";
import {
  useGetInstructorProfileQuery,
  useApplyInstructorMutation,
  useUpdateInstructorProfileMutation,
} from "@/store/api/instructorApi";
import { parsePhoneData } from "@/shared/constants/countriesOptions";
import { useGlobalTask } from "@/shared/hooks/useGlobalTask.jsx";

import InstructorEmptyState from "@/features/user/components/instructor/InstructorEmptyState";
import InstructorStatusBanner from "@/features/user/components/instructor/InstructorStatusBanner";

import InstructorPersonalInfo from "@/features/user/components/instructor/InstructorPersonalInfo";
import InstructorLanguages from "@/features/user/components/instructor/InstructorLanguages";
import InstructorIdentity from "@/features/user/components/instructor/InstructorIdentity";
import InstructorCredentials from "@/features/user/components/instructor/InstructorCredentials";
import InstructorMedia from "@/features/user/components/instructor/InstructorMedia";
import InstructorSubmitSection from "@/features/user/components/instructor/InstructorSubmitSection";
import PageTitle from "@/shared/components/ui/PageTitle";

const INITIAL_FORM_DATA = {
  fullName: "",
  email: "",
  address: "",
  phoneNumber: "",
  phonePrefix: "+84",
  nationality: "",
  languagesTeach: [],
  nativeLanguage: "Tiếng Việt",
  idFrontFile: null,
  idBackFile: null,
  introduction: "",
  credentials: [],
};

/**
 * Safely parse a value that may be a JSON string (array), a comma-separated
 * string, or already an array. Returns an array.
 */
function safeParseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

/**
 * Normalize languagesTeach from the API into an array of {language, level} objects.
 * Supports:
 *  - Array of objects: [{language: "English", level: "B2"}, ...]
 *  - Array of strings: ["English", "Japanese"] → [{language: "English", level: ""}, ...]
 *  - JSON string of either format above
 */
function normalizeLanguagesTeach(raw) {
  const arr = safeParseArray(raw);
  return arr.map((item) => {
    if (typeof item === "object" && item !== null) {
      return { language: item.language || "", level: item.level || "" };
    }
    // Legacy format: plain string = language name only
    return { language: String(item), level: "" };
  });
}

/**
 * Map GET /InstructorProfile/my response into form data shape.
 */
function mapApplicationToFormData(app) {
  if (!app) return null;
  return {
    fullName: app.fullName || app.FullName || "",
    email: app.email || app.Email || "",
    address: app.address || app.Address || "",
    phoneNumber: parsePhoneData(app.phoneNumber || app.PhoneNumber).phoneNumber,
    phonePrefix: parsePhoneData(app.phoneNumber || app.PhoneNumber).phonePrefix,
    nationality: app.nationality || app.Nationality || "",
    languagesTeach: normalizeLanguagesTeach(
      app.languagesTeach || app.LanguagesTeach,
    ),
    nativeLanguage: app.nativeLanguage || app.NativeLanguage || "Tiếng Việt",
    idFrontFile: app.idCardFrontUrl || app.IdCardFrontUrl || null,
    idBackFile: app.idCardBackUrl || app.IdCardBackUrl || null,
    introduction: app.introduction || app.Introduction || "",
    credentials: safeParseArray(app.credentialUrls || app.CredentialUrls),
    videoFile: app.introVideoUrl || app.IntroVideoUrl || null,
  };
}

/** Extract status string from API response (case-insensitive normalize) */
function getApplicationStatus(app) {
  const raw = app?.status || app?.Status || "";
  const normalized = raw.toString().toLowerCase();
  if (normalized === "pending") return "Pending";
  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "requestedit") return "RequestEdit";
  return raw || null;
}

const InstructorPage = () => {
  const { t } = useLanguage();
  const ins = t.profile?.instructor || {};
  const { uploadFile } = useGlobalTask();

  // --- API hooks ---
  const {
    data: instructorData,
    isLoading: isLoadingInstructor,
    error: profileError,
  } = useGetInstructorProfileQuery();

  const { data: userProfileData, isLoading: isLoadingProfile } =
    useGetUserProfileQuery();

  const [applyInstructor, { isLoading: isApplying }] =
    useApplyInstructorMutation();

  const [updateInstructor, { isLoading: isUpdating }] =
    useUpdateInstructorProfileMutation();

  const isSubmitting = isApplying || isUpdating;

  // 404 means user has never applied
  const hasNotApplied =
    profileError?.status === 404 || profileError?.originalStatus === 404;

  // Extract application data and status
  const rawApplication = useMemo(() => {
    return instructorData?.data || instructorData || null;
  }, [instructorData]);

  const applicationStatus = useMemo(
    () =>
      rawApplication && !hasNotApplied
        ? getApplicationStatus(rawApplication)
        : null,
    [rawApplication, hasNotApplied],
  );

  const existingApplication = useMemo(
    () =>
      rawApplication && !hasNotApplied
        ? mapApplicationToFormData(rawApplication)
        : null,
    [rawApplication, hasNotApplied],
  );

  // Determine UI mode:
  // - "new"        → first-time application form
  // - "view"       → read-only (Pending, Approved, Rejected)
  // - "requestEdit"→ editable form with resubmit (RequestEdit status)
  const isRequestEdit = applicationStatus === "RequestEdit";
  const isViewMode = !!existingApplication && !isRequestEdit;

  // Local UI state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [agreed, setAgreed] = useState(false);
  const [hasPreFilled, setHasPreFilled] = useState(false);
  const [errors, setErrors] = useState({});
  const [isReapplying, setIsReapplying] = useState(false);

  // Snapshot of the original form data to detect changes
  const originalFormDataRef = useRef(null);

  // Populate form from existing application
  useEffect(() => {
    if (existingApplication) {
      setFormData(existingApplication);
      originalFormDataRef.current = existingApplication;
    }
  }, [existingApplication]);

  // Pre-fill form from user profile (new applications only)
  useEffect(() => {
    if (
      !hasPreFilled &&
      showForm &&
      !existingApplication &&
      userProfileData?.data
    ) {
      const profile = userProfileData.data;
      setFormData((prev) => ({
        ...prev,
        fullName: profile.username || prev.fullName,
        email: profile.email || prev.email,
        address: profile.address || prev.address,
        phoneNumber: parsePhoneData(profile.phoneNumber || prev.phoneNumber).phoneNumber,
        phonePrefix: parsePhoneData(profile.phoneNumber || prev.phoneNumber).phonePrefix,
        nationality: profile.country || prev.nationality,
      }));
      setHasPreFilled(true);
      // Capture the auto-filled state as the original for new applications
      setTimeout(() => {
        setFormData((current) => {
          originalFormDataRef.current = current;
          return current;
        });
      }, 0);
    }
  }, [showForm, userProfileData, hasPreFilled, existingApplication]);

  // File input refs
  const idFrontInputRef = useRef(null);
  const idBackInputRef = useRef(null);
  const credentialInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Can edit when: new form (no existing application) OR RequestEdit status OR Reapplying
  const canEdit = (showForm && !existingApplication) || isRequestEdit || isReapplying;

  // Detect if user has made any changes from the original data
  const hasChanges = useMemo(() => {
    if (!originalFormDataRef.current) return true; // new empty form = always allow
    return (
      JSON.stringify(formData) !== JSON.stringify(originalFormDataRef.current)
    );
  }, [formData]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.fullName?.trim())
      newErrors.fullName = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.email?.trim())
      newErrors.email = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.address?.trim())
      newErrors.address = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.phoneNumber?.trim())
      newErrors.phoneNumber = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.nationality?.trim())
      newErrors.nationality = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.nativeLanguage?.trim())
      newErrors.nativeLanguage = ins.requiredField || "Trường này là bắt buộc";

    if (!formData.languagesTeach || formData.languagesTeach.length === 0) {
      newErrors.languagesTeach =
        ins.selectLanguagesError || ins.requiredField || "Vui lòng chọn ngôn ngữ giảng dạy";
    } else {
      for (const lang of formData.languagesTeach) {
        if (!lang.language || !lang.level) {
          newErrors.languagesTeachLevel =
            ins.selectLevelError || ins.requiredField || "Vui lòng chọn trình độ cho từng ngôn ngữ";
          break;
        }
      }
    }

    if (!formData.idFrontFile)
      newErrors.idFrontFile = ins.requiredField || "Vui lòng tải lên mặt trước";
    if (!formData.idBackFile)
      newErrors.idBackFile = ins.requiredField || "Vui lòng tải lên mặt sau";
    if (!formData.introduction?.trim())
      newErrors.introduction = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.credentials || formData.credentials.length === 0)
      newErrors.credentials = ins.requiredField || "Vui lòng tải lên chứng chỉ";
    if (!formData.videoFile)
      newErrors.videoFile = ins.requiredField || "Vui lòng tải lên video";

    setErrors(newErrors);
    return newErrors;
  }, [formData, ins]);

  // --- Handlers ---

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleChange = useCallback(
    (e) => {
      if (!canEdit) return;
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearError(name);
    },
    [canEdit],
  );

  const handleLanguagesChange = useCallback(
    (languages) => {
      if (!canEdit) return;
      setFormData((prev) => ({ ...prev, languagesTeach: languages }));
      clearError("languagesTeach");
      clearError("languagesTeachLevel");
    },
    [canEdit],
  );

  const handleEdit = useCallback(
    (field) => {
      if (!canEdit) return;
      if (field === "idFront") {
        idFrontInputRef.current?.click();
      } else if (field === "idBack") {
        idBackInputRef.current?.click();
      }
    },
    [canEdit],
  );

  const handleFileChange = useCallback(
    (fieldName) => (e) => {
      if (!canEdit) return;
      const file = e.target.files?.[0];
      if (!file) return;
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      clearError(fieldName);
    },
    [canEdit],
  );

  const handleAddCredential = useCallback(() => {
    if (!canEdit) return;
    credentialInputRef.current?.click();
  }, [canEdit]);

  const handleCredentialFileChange = useCallback(
    (e) => {
      if (!canEdit) return;
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      setFormData((prev) => ({
        ...prev,
        credentials: [...prev.credentials, ...files],
      }));
      clearError("credentials");
      e.target.value = "";
    },
    [canEdit],
  );

  const handleSelectVideo = useCallback(() => {
    if (!canEdit) return;
    videoInputRef.current?.click();
  }, [canEdit]);

  const handleVideoFileChange = useCallback(
    (e) => {
      if (!canEdit) return;
      const file = e.target.files?.[0];
      if (!file) return;
      setFormData((prev) => ({ ...prev, videoFile: file }));
      clearError("videoFile");
    },
    [canEdit],
  );

  const handleRemoveCredential = useCallback(
    (index) => {
      if (!canEdit) return;
      setFormData((prev) => {
        const newCreds = [...prev.credentials];
        newCreds.splice(index, 1);
        return { ...prev, credentials: newCreds };
      });
    },
    [canEdit],
  );

  const buildPayload = useCallback(
    () => ({
      fullName: formData.fullName,
      email: formData.email,
      address: formData.address,
      phoneNumber: formData.phoneNumber
          ? `${formData.phonePrefix}${formData.phoneNumber.replace(/^0+/, "")}`
          : "",
      nationality: formData.nationality,
      languagesTeach: formData.languagesTeach,
      nativeLanguage: formData.nativeLanguage,
      introduction: formData.introduction,
      idCardFront: formData.idFrontFile,
      idCardBack: formData.idBackFile,
      credentials: formData.credentials,
      introVideo: formData.videoFile,
    }),
    [formData],
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!agreed) {
      setErrors((prev) => ({
        ...prev,
        agreed:
          ins.certifyError ||
          "Vui lòng xác nhận và đồng ý với các quy định của nền tảng.",
      }));
      setTimeout(() => {
        const el = document.getElementById("field-agreed");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    try {
      if (isRequestEdit || isReapplying) {
        // PUT /my for resubmission
        await updateInstructor(buildPayload()).unwrap();
        toast.success(ins.statusPendingDesc || "Đã gửi lại đơn đăng ký thành công!");
        setShowForm(false);
        setAgreed(false);
        setErrors({});
        setIsReapplying(false);
      } else {
        // POST /apply for new applications using Global Progress System
        const rawPayload = buildPayload();
        const formDataPayload = new FormData();
        Object.entries(rawPayload).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach((item) => formDataPayload.append(key, item));
          } else if (val) {
            formDataPayload.append(key, val);
          }
        });

        uploadFile({
          url: "/api/InstructorProfile/apply",
          method: "POST",
          data: formDataPayload,
          title: ins.formTitle || "Nộp hồ sơ Giảng viên",
          onUploadSuccess: () => {
            toast.success(ins.statusPendingDesc || "Đã gửi đơn đăng ký thành công!");
            setShowForm(false);
            setAgreed(false);
            setErrors({});
            setIsReapplying(false);
          },
          onUploadError: (err) => {
            toast.error(err?.data?.message || "Đã có lỗi xảy ra khi gửi đơn đăng ký.");
          },
        });
      }
    } catch (err) {
      console.error("Failed to submit instructor application:", err);
      toast.error(err?.data?.message || "Đã có lỗi xảy ra khi gửi đơn đăng ký.");
    }
  }, [
    agreed,
    isSubmitting,
    isRequestEdit,
    isReapplying,
    validateForm,
    applyInstructor,
    updateInstructor,
    buildPayload,
    ins,
  ]);

  // --- Render ---

  if (isLoadingInstructor || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-cath-red-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not applied + not showing form → empty state
  if (hasNotApplied && !showForm) {
    return (
      <div className="flex flex-col gap-4">
        <PageTitle>
        {t.nav?.instructor || "Giảng viên"}
      </PageTitle>
        <InstructorEmptyState onApply={() => setShowForm(true)} t={t} />
      </div>
    );
  }

  // Determine readOnly for section components
  const readOnly = !canEdit || isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>
        {t.nav?.instructor || "Giảng viên"}
      </PageTitle>

      {/* Status Banner — shown when an application exists */}
      {applicationStatus && (
        <InstructorStatusBanner
          status={applicationStatus}
          rejectReason={
            rawApplication?.rejectReason || rawApplication?.RejectReason
          }
          banUntil={rawApplication?.banUntil || rawApplication?.BanUntil}
          editRequestNote={
            rawApplication?.editRequestNote || rawApplication?.EditRequestNote
          }
          t={t}
          onReapply={() => setIsReapplying(true)}
          isReapplying={isReapplying}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <InstructorPersonalInfo
          formData={formData}
          onChange={handleChange}
          readOnly={readOnly}
          errors={errors}
          t={t}
        />
        <InstructorLanguages
          formData={formData}
          onChange={handleChange}
          onLanguagesChange={handleLanguagesChange}
          readOnly={readOnly}
          errors={errors}
          t={t}
        />
        <InstructorIdentity
          formData={formData}
          onEdit={handleEdit}
          readOnly={readOnly}
          errors={errors}
          t={t}
        />
        <InstructorCredentials
          formData={formData}
          onAddCredential={handleAddCredential}
          onRemoveCredential={handleRemoveCredential}
          readOnly={readOnly}
          errors={errors}
          t={t}
        />
      </div>

      <InstructorMedia
        formData={formData}
        onChange={handleChange}
        onSelectVideo={handleSelectVideo}
        readOnly={readOnly}
        errors={errors}
        t={t}
      />

      {/* Submit section — shown for new applications and RequestEdit */}
      {canEdit && (
        <InstructorSubmitSection
          agreed={agreed}
          onAgreeChange={(val) => {
            setAgreed(val);
            if (val) clearError("agreed");
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={isSubmitting}
          errors={errors}
          submitLabel={isRequestEdit || isReapplying ? ins.resubmit : undefined}
          updatingLabel={isRequestEdit || isReapplying ? ins.updating : undefined}
          t={t}
        />
      )}

      {/* Hidden file inputs — only in edit mode */}
      {canEdit && (
        <>
          <input
            ref={idFrontInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange("idFrontFile")}
          />
          <input
            ref={idBackInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange("idBackFile")}
          />
          <input
            ref={credentialInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleCredentialFileChange}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime"
            className="hidden"
            onChange={handleVideoFileChange}
          />
        </>
      )}
    </div>
  );
};

export default InstructorPage;
