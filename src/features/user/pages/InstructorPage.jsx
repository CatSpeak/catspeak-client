import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, GraduationCap, Pencil } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetUserProfileQuery } from "@/store/api/userApi";
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher";
import { store } from "@/store";
import {
  instructorApi,
  buildInstructorFormData,
  useGetInstructorProfileQuery,
  useApplyInstructorMutation,
  useUpdateInstructorProfileMutation,
  useGetPendingTeachingUpdateQuery,
  useSubmitTeachingUpdateMutation,
  useCancelTeachingUpdateMutation,
} from "@/store/api/instructorApi";
import { parsePhoneData } from "@/shared/constants/countriesOptions";
import { useGlobalTask } from "@/shared/hooks/useGlobalTask.jsx";

import InstructorEmptyState from "@/features/user/components/instructor/InstructorEmptyState";
import InstructorStatusBanner from "@/features/user/components/instructor/InstructorStatusBanner";
import InstructorPendingUpdateBanner from "@/features/user/components/instructor/InstructorPendingUpdateBanner";

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
 * Normalize languagesTeach from the API into an array of {language, level, yearsExperience} objects.
 * Supports:
 *  - Array of objects: [{language: "English", level: "B2", yearsExperience: 5}, ...]
 *  - Array of strings: ["English", "Japanese"] → [{language: "English", level: "", yearsExperience: 0}, ...]
 *  - JSON string of either format above (legacy items without yearsExperience default to 0)
 */
function normalizeLanguagesTeach(raw) {
  const arr = safeParseArray(raw);
  return arr.map((item) => {
    if (typeof item === "object" && item !== null) {
      const years = Number(item.yearsExperience);
      return {
        language: item.language || "",
        level: item.level || "",
        yearsExperience: Number.isFinite(years) ? Math.max(0, Math.min(50, Math.trunc(years))) : 0,
      };
    }
    // Legacy format: plain string = language name only
    return { language: String(item), level: "", yearsExperience: 0 };
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

/** Extract status string from API response (case-insensitive normalize).
 * Accepts status names ("Approved", "approved "...), numeric codes (1-4)
 * and camelCase ("requestEdit"). Unknown values pass through. */
function getApplicationStatus(app) {
  const raw = app?.status ?? app?.Status ?? app?.statusCode ?? app?.StatusCode ?? "";
  const normalized = raw.toString().trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (normalized === "pending" || normalized === "1") return "Pending";
  if (normalized === "approved" || normalized === "2") return "Approved";
  if (normalized === "rejected" || normalized === "3") return "Rejected";
  if (normalized === "requestedit" || normalized === "4") return "RequestEdit";
  return raw || null;
}

const InstructorPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const ins = t.profile?.instructor || {};
  const { startTask } = useGlobalTask();

  // --- API hooks ---
  const {
    data: instructorData,
    isLoading: isLoadingInstructor,
    error: profileError,
    refetch: refetchInstructorProfile,
  } = useGetInstructorProfileQuery();

  const { data: userProfileData, isLoading: isLoadingProfile } =
    useGetUserProfileQuery();

  // True when the current account is a teacher account, OR the (user) account has
  // a linked teacher account (approved profile re-pointed to the teacher account).
  const userProfile = userProfileData?.data ?? userProfileData ?? {};
  const isTeacher = !!userProfile.isTeacher;

  const { switchRole, isSwitching: isSwitchingAccount } = useRoleOverride();

  const handleSwitchToTeacherAccount = useCallback(async () => {
    const success = await switchRole("Teacher");
    if (success) {
      navigate("/");
    }
  }, [switchRole, navigate]);

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
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isSavingPersonalInfo, setIsSavingPersonalInfo] = useState(false);
  // Global Approved edit (spec Q9/Q13): single Edit-all outside cards
  const [isEditingApproved, setIsEditingApproved] = useState(false);
  const [isSavingApproved, setIsSavingApproved] = useState(false);

  // Snapshot of the original form data to detect changes
  const originalFormDataRef = useRef(null);
  const personalInfoBackupRef = useRef(null);

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

  const isApproved = applicationStatus === "Approved";
  // Global Approved edit unlocks ALL sections + files (spec Q9/Q12/Q13)
  const canEditApproved = isApproved && isEditingApproved;
  const effectiveCanEdit = canEdit || canEditApproved;
  // Global bar replaces per-card button (spec Q13: button outside cards)
  const showGlobalEditBar = isApproved && !canEdit;
  // Legacy per-card edit disabled — Approved now uses global Edit-all bar
  const canSectionEdit = false;

  // Handlers for section editing "Thông tin của bạn"
  const handleStartEditPersonalInfo = useCallback(() => {
    personalInfoBackupRef.current = {
      fullName: formData.fullName,
      email: formData.email,
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      phonePrefix: formData.phonePrefix,
      nationality: formData.nationality,
    };
    setIsEditingPersonalInfo(true);
  }, [formData]);

  const handleCancelEditPersonalInfo = useCallback(() => {
    if (personalInfoBackupRef.current) {
      setFormData((prev) => ({
        ...prev,
        ...personalInfoBackupRef.current,
      }));
    }
    setIsEditingPersonalInfo(false);
    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr.fullName;
      delete newErr.email;
      delete newErr.address;
      delete newErr.phoneNumber;
      delete newErr.nationality;
      return newErr;
    });
  }, []);

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
        const years = Number(lang.yearsExperience);
        if (!Number.isFinite(years) || years < 0 || years > 50) {
          newErrors.languagesTeachExperience =
            ins.experienceError || "Số năm kinh nghiệm mỗi ngôn ngữ phải từ 0 đến 50";
          break;
        }
      }
    }

    if (!formData.idFrontFile)
      newErrors.idFrontFile = ins.requiredField || "Vui lòng tải lên mặt trước";
    if (!formData.idBackFile)
      newErrors.idBackFile = ins.requiredField || "Vui lòng tải lên mặt sau";
    if (!formData.introduction?.trim() && !formData.videoFile)
      newErrors.introduction = ins.introOrVideoRequired || "Cần có lời giới thiệu hoặc video giới thiệu";
    if (!formData.credentials || formData.credentials.length === 0)
      newErrors.credentials = ins.requiredField || "Vui lòng tải lên chứng chỉ";

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
      if (!effectiveCanEdit && !isEditingPersonalInfo) return;
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearError(name);
    },
    [effectiveCanEdit, isEditingPersonalInfo],
  );

  const handleLanguagesChange = useCallback(
    (languages) => {
      if (!effectiveCanEdit) return;
      setFormData((prev) => ({ ...prev, languagesTeach: languages }));
      clearError("languagesTeach");
      clearError("languagesTeachLevel");
    },
    [effectiveCanEdit],
  );

  const handleEdit = useCallback(
    (field) => {
      if (!effectiveCanEdit) return;
      if (field === "idFront") {
        idFrontInputRef.current?.click();
      } else if (field === "idBack") {
        idBackInputRef.current?.click();
      }
    },
    [effectiveCanEdit],
  );

  const handleFileChange = useCallback(
    (fieldName) => (e) => {
      if (!effectiveCanEdit) return;
      const file = e.target.files?.[0];
      if (!file) return;
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      clearError(fieldName);
    },
    [effectiveCanEdit],
  );

  const handleAddCredential = useCallback(() => {
    if (!effectiveCanEdit) return;
    credentialInputRef.current?.click();
  }, [effectiveCanEdit]);

  const handleCredentialFileChange = useCallback(
    (e) => {
      if (!effectiveCanEdit) return;
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const CRED_MAX_MB = 100;
      const oversized = files.find((f) => f.size > CRED_MAX_MB * 1024 * 1024);
      if (oversized) {
        const actualMb = (oversized.size / 1024 / 1024).toFixed(1);
        setErrors((prev) => ({
          ...prev,
          credentials:
            ins.credentialSizeLimit
              ?.replace("{max}", CRED_MAX_MB)
              ?.replace("{actual}", actualMb) ||
            `Mỗi chứng chỉ phải nhỏ hơn ${CRED_MAX_MB}MB (hiện tại ${actualMb}MB).`,
        }));
        e.target.value = "";
        return;
      }
      setFormData((prev) => ({
        ...prev,
        credentials: [...prev.credentials, ...files],
      }));
      clearError("credentials");
      e.target.value = "";
    },
    [effectiveCanEdit, ins],
  );

  const handleSelectVideo = useCallback(() => {
    if (!effectiveCanEdit) return;
    videoInputRef.current?.click();
  }, [effectiveCanEdit]);

  const handleVideoFileChange = useCallback(
    (e) => {
      if (!effectiveCanEdit) return;
      const file = e.target.files?.[0];
      if (!file) return;
      const VIDEO_MAX_MB = 500;
      if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
        const actualMb = (file.size / 1024 / 1024).toFixed(1);
        setErrors((prev) => ({
          ...prev,
          videoFile:
            ins.videoSizeLimit
              ?.replace("{max}", VIDEO_MAX_MB)
              ?.replace("{actual}", actualMb) ||
            `Video phải nhỏ hơn ${VIDEO_MAX_MB}MB (hiện tại ${actualMb}MB).`,
        }));
        e.target.value = "";
        return;
      }
      setFormData((prev) => ({ ...prev, videoFile: file }));
      clearError("videoFile");
    },
    [effectiveCanEdit, ins],
  );

  const handleRemoveCredential = useCallback(
    (index) => {
      if (!effectiveCanEdit) return;
      setFormData((prev) => {
        const newCreds = [...prev.credentials];
        newCreds.splice(index, 1);
        return { ...prev, credentials: newCreds };
      });
    },
    [effectiveCanEdit],
  );

  const buildPayload = useCallback(
    (otpCode) => ({
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
      ...(otpCode ? { otpCode } : {}),
    }),
    [formData],
  );

  const [submitTeaching] = useSubmitTeachingUpdateMutation();
  const [cancelTeaching, { isLoading: isCancellingTeaching }] =
    useCancelTeachingUpdateMutation();

  const { data: pendingTeachingData } = useGetPendingTeachingUpdateQuery(
    undefined,
    { skip: applicationStatus !== "Approved" },
  );

  const pendingTeaching = useMemo(() => {
    return pendingTeachingData?.data ?? pendingTeachingData ?? null;
  }, [pendingTeachingData]);

  // Teaching-only validation for Approved updates: no personal fields, no ID
  // cards (identity lives in the account page), credentials optional.
  const validateTeachingForm = useCallback(() => {
    const newErrors = {};
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
        const years = Number(lang.yearsExperience);
        if (!Number.isFinite(years) || years < 0 || years > 50) {
          newErrors.languagesTeachExperience =
            ins.experienceError || "Số năm kinh nghiệm mỗi ngôn ngữ phải từ 0 đến 50";
          break;
        }
      }
    }

    if (!formData.introduction?.trim() && !formData.videoFile)
      newErrors.introduction = ins.introOrVideoRequired || "Cần có lời giới thiệu hoặc video giới thiệu";

    setErrors(newErrors);
    return newErrors;
  }, [formData, ins]);

  const buildTeachingPayload = useCallback(
    () => ({
      languagesTeach: formData.languagesTeach,
      nativeLanguage: formData.nativeLanguage,
      introduction: formData.introduction,
      credentials: formData.credentials,
      introVideo: formData.videoFile,
    }),
    [formData],
  );

  const handleStartEditApproved = useCallback(() => {
    setErrors({});
    setIsEditingApproved(true);
  }, []);

  const handleCancelEditApproved = useCallback(() => {
    if (originalFormDataRef.current) {
      setFormData(originalFormDataRef.current);
    }
    setErrors({});
    setIsEditingApproved(false);
  }, []);

  // Approved save: teaching content only. No personal fields, no OTP — the live
  // Approved profile keeps serving while the draft awaits admin review.
  const handleSaveApproved = useCallback(async () => {
    if (isSavingApproved || isSubmitting) return;
    const newErrors = validateTeachingForm();
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        const el = document.getElementById(`field-${firstErrorKey}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    setIsSavingApproved(true);
    try {
      await submitTeaching(buildTeachingPayload()).unwrap();
      toast.success(
        ins.teachingSubmitSuccess ||
          "Đã gửi thay đổi nội dung giảng dạy! Hồ sơ đã duyệt vẫn hoạt động bình thường trong lúc chờ duyệt.",
      );
      setIsEditingApproved(false);
      setErrors({});
    } catch (err) {
      toast.error(err?.data?.message || "Đã có lỗi xảy ra khi cập nhật thông tin.");
    } finally {
      setIsSavingApproved(false);
    }
  }, [
    isSavingApproved,
    isSubmitting,
    validateTeachingForm,
    buildTeachingPayload,
    submitTeaching,
    ins,
  ]);

  const handleCancelTeachingUpdate = useCallback(async () => {
    try {
      await cancelTeaching().unwrap();
      toast.success(ins.teachingCancelSuccess || "Đã hủy bản nháp chờ duyệt.");
    } catch (err) {
      toast.error(err?.data?.message || "Đã có lỗi xảy ra khi hủy bản nháp.");
    }
  }, [cancelTeaching, ins]);

  const handleSavePersonalInfo = useCallback(async () => {
    const personalErrors = {};
    if (!formData.fullName?.trim())
      personalErrors.fullName = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.email?.trim())
      personalErrors.email = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.address?.trim())
      personalErrors.address = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.phoneNumber?.trim())
      personalErrors.phoneNumber = ins.requiredField || "Trường này là bắt buộc";
    if (!formData.nationality?.trim())
      personalErrors.nationality = ins.requiredField || "Trường này là bắt buộc";

    if (Object.keys(personalErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...personalErrors }));
      return;
    }

    setIsSavingPersonalInfo(true);
    try {
      await updateInstructor(buildPayload()).unwrap();
      toast.success("Cập nhật thông tin giảng viên thành công!");
      setIsEditingPersonalInfo(false);
      store.dispatch(instructorApi.util.invalidateTags(["InstructorProfile"]));
    } catch (err) {
      console.error("Failed to update personal info:", err);
      toast.error(err?.data?.message || "Đã có lỗi xảy ra khi cập nhật thông tin.");
    } finally {
      setIsSavingPersonalInfo(false);
    }
  }, [formData, ins, updateInstructor, buildPayload]);

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
        // PUT /my for resubmission — simple RTK Query
        await updateInstructor(buildPayload()).unwrap();
        toast.success(ins.statusPendingDesc || "Đã gửi lại đơn đăng ký thành công!");
        setShowForm(false);
        setAgreed(false);
        setErrors({});
        setIsReapplying(false);
      } else {
        // POST /apply for new applications — Task Progress Bar
        const rawPayload = buildPayload();
        const formData = buildInstructorFormData(rawPayload);

        // Lock form immediately
        setIsTaskSubmitting(true);

        startTask({
          title: t?.uploadWidget?.instructorTaskTitle || "Gửi hồ sơ giảng viên",
          taskType: "InstructorApplication",
          isUploadTask: true,
          url: "/InstructorProfile/apply",
          method: "POST",
          data: formData,
          onSuccess: () => {
            toast.success(ins.statusPendingDesc || "Đã gửi đơn đăng ký thành công!");
            setIsTaskSubmitting(false);
            setShowForm(false);
            setAgreed(false);
            setErrors({});
            setIsReapplying(false);
            store.dispatch(instructorApi.util.invalidateTags(["InstructorProfile"]));
          },
          onError: (err) => {
            setIsTaskSubmitting(false);
            const msg = err?.message || err?.data?.message || "Đã có lỗi xảy ra khi gửi đơn đăng ký.";
            if (msg.toLowerCase().includes("email")) {
              setErrors((prev) => ({ ...prev, email: msg }));
              setTimeout(() => {
                const el = document.getElementById("field-email");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 0);
            }
            toast.error(msg);
          },
        });
      }
    } catch (err) {
      console.error("Failed to submit instructor application:", err);
      const msg = err?.data?.message || err?.data?.title || "Đã có lỗi xảy ra khi gửi đơn đăng ký.";
      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
        setTimeout(() => {
          const el = document.getElementById("field-email");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 0);
      }
      toast.error(msg);
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
    t,
  ]);

  // --- Render ---

  if (isLoadingInstructor || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-cath-red-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Non-404 fetch failure with no data: show an error panel instead of a
  // white disabled form (the form below would render readOnly with no banner).
  if (profileError && !hasNotApplied && !rawApplication) {
    return (
      <div className="flex flex-col gap-4">
        <PageTitle>
          {t.nav?.instructor || "Giảng viên"}
        </PageTitle>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-sm font-bold text-red-800">
            {ins.loadErrorTitle || "Không tải được hồ sơ giảng viên"}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {ins.loadErrorDesc || "Vui lòng kiểm tra kết nối và thử lại."}
          </p>
          <button
            type="button"
            onClick={() => refetchInstructorProfile()}
            className="mt-3 px-4 py-2 bg-[#990011] text-white text-sm font-medium rounded-lg hover:bg-[#7a000e] transition-colors cursor-pointer"
          >
            {ins.retry || "Thử lại"}
          </button>
        </div>
      </div>
    );
  }

  // Not applied + not showing form → empty state.
  // When the account has a linked (approved) teacher account the profile now lives
  // on that teacher account — show a switch CTA instead of the "not applied" state.
  if (hasNotApplied && !showForm) {
    return (
      <div className="flex flex-col gap-4">
        <PageTitle>
          {t.nav?.instructor || "Giảng viên"}
        </PageTitle>
        {isTeacher ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <h3 className="text-sm font-bold text-emerald-800">
                {ins.switchToTeacherTitle || "Hồ sơ đã được duyệt"}
              </h3>
            </div>
            <p className="text-sm text-emerald-700 ml-8 mb-3">
              {ins.switchToTeacherDesc ||
                "Hồ sơ Giảng viên của bạn đã được phê duyệt. Chuyển sang tài khoản giáo viên để quản lý nội dung giảng dạy."}
            </p>
            <div className="ml-8">
              <button
                onClick={handleSwitchToTeacherAccount}
                disabled={isSwitchingAccount}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {isSwitchingAccount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <GraduationCap size={16} />
                )}
                {isSwitchingAccount
                  ? (ins.switching || "Đang chuyển...")
                  : (ins.switchToTeacherAccount || "Chuyển sang tài khoản giáo viên")}
              </button>
            </div>
          </div>
        ) : (
          <InstructorEmptyState onApply={() => setShowForm(true)} t={t} />
        )}
      </div>
    );
  }

  // Determine readOnly for section components.
  // Global Approved edit unlocks ALL sections + files (spec Q9/Q12).
  const readOnly =
    (!effectiveCanEdit && !isEditingPersonalInfo) ||
    isSubmitting ||
    isTaskSubmitting ||
    isSavingApproved;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>
        {t.nav?.instructor || "Giảng viên"}
      </PageTitle>

      {/* Task submitting banner */}
      {isTaskSubmitting && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 animate-pulse">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">
            {t?.uploadWidget?.instructorSubmitting || "Đang gửi hồ sơ giảng viên, vui lòng chờ..."}
          </span>
        </div>
      )}

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
          isRevision={!!(rawApplication?.isRevision || rawApplication?.IsRevision)}
          t={t}
          onReapply={() => setIsReapplying(true)}
          isReapplying={isReapplying}
        />
      )}

      {/* Global Approved edit bar — outside cards (spec Q13) */}
      {showGlobalEditBar && !isEditingApproved && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-sm text-emerald-800">
            {ins.approvedEditHint ||
              "Hồ sơ đã được duyệt. Chỉnh sửa nội dung giảng dạy — hồ sơ hiện tại vẫn hoạt động bình thường trong lúc chờ duyệt."}
          </p>
          <button
            type="button"
            onClick={handleStartEditApproved}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#990011] hover:bg-[#7a000e] rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Pencil size={15} />
            <span>{ins.editInfo || "Chỉnh sửa"}</span>
          </button>
        </div>
      )}

      {showGlobalEditBar && isEditingApproved && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            {ins.approvedEditingHint ||
              "Đang chỉnh sửa nội dung giảng dạy. Nhấn Lưu để gửi admin duyệt, hoặc Hủy để hoàn tác."}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancelEditApproved}
              disabled={isSavingApproved}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 border border-border rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {ins.cancel || "Hủy"}
            </button>
            <button
              type="button"
              onClick={handleSaveApproved}
              disabled={isSavingApproved || isSubmitting || isCancellingTeaching}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#990011] hover:bg-[#7a000e] rounded-lg transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {(isSavingApproved || isSubmitting) && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {isSavingApproved
                  ? ins.saving || "Đang lưu..."
                  : ins.save || "Lưu"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Pending teaching-update banner — live profile keeps serving */}
      {isApproved && (
        <InstructorPendingUpdateBanner
          live={rawApplication}
          pending={pendingTeaching}
          onCancel={handleCancelTeachingUpdate}
          isCancelling={isCancellingTeaching}
          t={t}
        />
      )}

      {/* Personal data lives in account settings for Approved teachers */}
      {isApproved && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            {ins.personalMovedHint ||
              "Thông tin cá nhân (họ tên, liên hệ, địa chỉ, CCCD) đã chuyển sang Cài đặt tài khoản."}
          </p>
          <button
            type="button"
            onClick={() => navigate("../account")}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer shrink-0"
          >
            {ins.goToAccount || "Sang Cài đặt tài khoản"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {!isApproved && (
          <InstructorPersonalInfo
            formData={formData}
            onChange={handleChange}
            readOnly={readOnly}
            errors={errors}
            t={t}
            canSectionEdit={canSectionEdit}
            isSectionEditing={isEditingPersonalInfo}
            onStartSectionEdit={handleStartEditPersonalInfo}
            onCancelSectionEdit={handleCancelEditPersonalInfo}
            onSaveSectionEdit={handleSavePersonalInfo}
            isSavingSection={isSavingPersonalInfo}
          />
        )}
        <InstructorLanguages
          formData={formData}
          onChange={handleChange}
          onLanguagesChange={handleLanguagesChange}
          readOnly={readOnly}
          errors={errors}
          t={t}
        />
        {!isApproved && (
          <InstructorIdentity
            formData={formData}
            onEdit={handleEdit}
            readOnly={readOnly}
            errors={errors}
            t={t}
          />
        )}
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
          isSubmitting={isSubmitting || isTaskSubmitting}
          disabled={isSubmitting || isTaskSubmitting}
          errors={errors}
          submitLabel={isRequestEdit || isReapplying ? ins.resubmit : undefined}
          updatingLabel={isRequestEdit || isReapplying ? ins.updating : undefined}
          t={t}
        />
      )}

      {/* Hidden file inputs — new/RequestEdit/Reapply + Approved global edit.
          ID cards are creation-only (identity lives in the account page). */}
      {effectiveCanEdit && (
        <>
          {!isApproved && (
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
            </>
          )}
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
