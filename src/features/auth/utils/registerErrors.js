/**
 * Field alias mappings to normalize backend field names to form field keys.
 */
const FIELD_ALIASES = {
  username: "username",
  user: "username",
  uname: "username",
  email: "email",
  emailaddress: "email",
  mail: "email",
  phonenumber: "phoneNumber",
  phone: "phoneNumber",
  phonenum: "phoneNumber",
  mobile: "phoneNumber",
  cellphone: "phoneNumber",
  dateofbirth: "dateOfBirth",
  dob: "dateOfBirth",
  birthdate: "dateOfBirth",
  birthday: "dateOfBirth",
  preferredlanguage: "preferredLanguage",
  language: "preferredLanguage",
  lang: "preferredLanguage",
  preflang: "preferredLanguage",
  password: "password",
  pass: "password",
  country: "country",
  countrycode: "country",
  nation: "country",
  termsagreement: "termsAgreement",
  terms: "termsAgreement",
  serviceagreement: "termsAgreement",
  policyagreement: "policyAgreement",
  policy: "policyAgreement",
  privacyagreement: "policyAgreement",
}

/**
 * Top-level or field-level error code mappings to form field and translation key.
 */
const ERROR_CODE_FIELD_MAP = {
  AUTH_EMAIL_EXISTS: { field: "email", key: "emailExists" },
  ACCOUNT_EMAIL_EXISTS: { field: "email", key: "emailExists" },
  AUTH_PHONE_EXISTS: { field: "phoneNumber", key: "phoneExists" },
  ACCOUNT_PHONE_EXISTS: { field: "phoneNumber", key: "phoneExists" },
  AUTH_PHONE_INVALID: { field: "phoneNumber", key: "validationPhoneInvalid" },
  ACCOUNT_INVALID_PHONE_NUMBER: { field: "phoneNumber", key: "validationPhoneInvalid" },
  AUTH_USERNAME_EXISTS: { field: "username", key: "usernameExists" },
  ACCOUNT_USERNAME_EXISTS: { field: "username", key: "usernameExists" },
  ACCOUNT_AGE_REQUIREMENT_NOT_MET: { field: "dateOfBirth", key: "ageRequirementNotMet" },
}

/**
 * Default translation keys for each form field.
 */
const FIELD_TRANSLATION_MAP = {
  country: { default: "validationCountryRequired" },
  dateOfBirth: { default: "validationDobRequired", age: "ageRequirementNotMet" },
  preferredLanguage: { default: "validationLanguageRequired" },
  phoneNumber: {
    default: "validationPhoneInvalid",
    required: "validationPhoneRequired",
    exists: "phoneExists",
  },
  email: {
    default: "validationEmailRequired",
    invalid: "validationEmailInvalid",
    exists: "emailExists",
  },
  username: {
    default: "validationUsernameRequired",
    exists: "usernameExists",
  },
  password: {
    default: "validationPasswordRequired",
    min: "validationPasswordMin",
  },
  termsAgreement: { default: "validationTermsRequired" },
  policyAgreement: { default: "validationPolicyRequired" },
}

/**
 * Normalizes any API field name to a form field key.
 */
export const normalizeFieldName = (rawField) => {
  if (!rawField || typeof rawField !== "string") return null
  const clean = rawField.toLowerCase().replace(/[^a-z0-9]/g, "")
  return FIELD_ALIASES[clean] || null
}

/**
 * Resolves a localized error message for a specific form field.
 */
export const resolveFieldErrorMessage = (
  field,
  errorCode,
  rawMessage,
  authText = {},
) => {
  const errCode = (errorCode || "").toUpperCase()
  const msg = (rawMessage || "").toLowerCase()

  // 1. Direct match in error code field map
  if (ERROR_CODE_FIELD_MAP[errCode]) {
    const { key } = ERROR_CODE_FIELD_MAP[errCode]
    return authText[key] || authText.errorCodes?.[errCode] || rawMessage || ""
  }

  // 2. Resolve based on field & message heuristics
  const fieldConfig = FIELD_TRANSLATION_MAP[field]
  if (fieldConfig) {
    if (fieldConfig.exists && (msg.includes("exist") || msg.includes("tồn tại") || msg.includes("đã được") || msg.includes("taken"))) {
      return authText[fieldConfig.exists] || rawMessage || ""
    }
    if (fieldConfig.age && (msg.includes("age") || msg.includes("tuổi") || msg.includes("year"))) {
      return authText[fieldConfig.age] || rawMessage || ""
    }
    if (fieldConfig.min && (errCode === "PASSWORD_TOO_SHORT" || errCode === "FIELD_MIN_LENGTH" || msg.includes("6") || msg.includes("short") || msg.includes("length"))) {
      return authText[fieldConfig.min] || rawMessage || ""
    }
    if (fieldConfig.invalid && (errCode === "FIELD_INVALID" || msg.includes("valid") || msg.includes("hợp lệ") || msg.includes("format"))) {
      return authText[fieldConfig.invalid] || rawMessage || ""
    }
    if (fieldConfig.required && (msg.includes("require") || msg.includes("bắt buộc"))) {
      return authText[fieldConfig.required] || authText[fieldConfig.default] || rawMessage || ""
    }
    return authText[fieldConfig.default] || rawMessage || ""
  }

  return authText.errorCodes?.[errCode] || rawMessage || ""
}

/**
 * Resolves a localized general error message based on errorCode or status code.
 */
export const resolveGeneralErrorMessage = (err, authText = {}) => {
  const data = err?.data || err || {}
  const errorCode = (data.errorCode || err?.errorCode || "").toUpperCase()
  const statusCode = data.statusCode || err?.status || err?.statusCode

  if (errorCode && authText.errorCodes?.[errorCode]) {
    return authText.errorCodes[errorCode]
  }

  if (statusCode === 429 || errorCode === "AUTH_OTP_RATE_LIMITED" || errorCode === "ACCOUNT_RATE_LIMIT_EXCEEDED") {
    return authText.tooManyOtpRequests || authText.errorCodes?.AUTH_OTP_RATE_LIMITED || "Too many requests. Please try again later."
  }
  if (statusCode === 423 || errorCode === "AUTH_ACCOUNT_LOCKED" || errorCode === "ACCOUNT_LOCKED") {
    return authText.accountLocked || authText.errorCodes?.AUTH_ACCOUNT_LOCKED || "Account is temporarily locked."
  }
  if (errorCode === "AUTH_ACCOUNT_LOCKED_ATTEMPTS") {
    return authText.accountLockedAttempts || authText.errorCodes?.AUTH_ACCOUNT_LOCKED_ATTEMPTS || authText.accountLocked || "Account is temporarily locked."
  }
  if (statusCode === 401 && errorCode === "AUTH_ACCOUNT_NOT_ACTIVATED") {
    return authText.accountNotActivated || authText.errorCodes?.AUTH_ACCOUNT_NOT_ACTIVATED || "Account is not activated."
  }
  if (statusCode === 401 && errorCode === "AUTH_INVALID_CREDENTIALS") {
    return authText.invalidCredentials || authText.errorCodes?.AUTH_INVALID_CREDENTIALS || "Invalid email or password."
  }
  if (errorCode === "COMMON_VALIDATION_FAILED") {
    return authText.validationFailed || authText.errorCodes?.COMMON_VALIDATION_FAILED || "Validation failed."
  }

  return data.message || data.title || err?.message || authText.registrationFailed || "Đăng ký thất bại. Vui lòng thử lại."
}

/**
 * Parses a registration API error response and returns either field-level errors or a general message.
 */
export const parseRegisterError = (err, authText = {}) => {
  const data = err?.data || err || {}
  const mappedFieldErrors = {}

  // 1. ValidationErrors array (HTTP 422 standard)
  const validationErrors = data.validationErrors || err?.validationErrors
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    for (const item of validationErrors) {
      if (!item) continue
      const field = normalizeFieldName(item.field || item.propertyName || item.name)
      if (field && !mappedFieldErrors[field]) {
        mappedFieldErrors[field] = resolveFieldErrorMessage(field, item.errorCode, item.message, authText)
      }
    }
  }

  // 2. Errors dictionary ({ field: ["message"] })
  const errors = data.errors || err?.errors
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    for (const [key, value] of Object.entries(errors)) {
      const field = normalizeFieldName(key)
      if (field && !mappedFieldErrors[field]) {
        const firstMessage = Array.isArray(value) ? value[0] : typeof value === "string" ? value : ""
        mappedFieldErrors[field] = resolveFieldErrorMessage(field, null, firstMessage, authText)
      }
    }
  }

  // 3. Top-level errorCode matching specific fields
  const topErrorCode = (data.errorCode || err?.errorCode || "").toUpperCase()
  if (topErrorCode && ERROR_CODE_FIELD_MAP[topErrorCode]) {
    const { field, key } = ERROR_CODE_FIELD_MAP[topErrorCode]
    if (!mappedFieldErrors[field]) {
      mappedFieldErrors[field] = authText[key] || authText.errorCodes?.[topErrorCode] || ""
    }
  }

  // 4. Return field errors if any found
  if (Object.keys(mappedFieldErrors).length > 0) {
    return { fieldErrors: mappedFieldErrors, message: null }
  }

  // 5. Keyword fallback in raw message
  const rawMsg = data.message || data.title || err?.message || ""
  if (typeof rawMsg === "string" && rawMsg.trim()) {
    const lower = rawMsg.toLowerCase()
    if (lower.includes("already exists") || lower.includes("taken") || lower.includes("tồn tại") || lower.includes("đã được sử dụng")) {
      if (lower.includes("username") || lower.includes("tên người dùng")) return { fieldErrors: { username: authText.usernameExists || rawMsg }, message: null }
      if (lower.includes("email")) return { fieldErrors: { email: authText.emailExists || rawMsg }, message: null }
      if (lower.includes("phone") || lower.includes("số điện thoại")) return { fieldErrors: { phoneNumber: authText.phoneExists || rawMsg }, message: null }
    }
  }

  // 6. Return general error message
  return { fieldErrors: null, message: resolveGeneralErrorMessage(err, authText) }
}

/**
 * Validates a phone number based on prefix format rules.
 */
export const validatePhoneInput = (phoneNumber, prefix) => {
  if (!phoneNumber) return true
  const clean = phoneNumber.replace(/[\s\-()/]/g, "")
  if (!/^[0-9]+$/.test(clean)) return false

  if (prefix === "+84") return /^(0?[35789]\d{8})$/.test(clean)
  if (prefix === "+86") return /^(1[3-9]\d{9})$/.test(clean)
  if (prefix === "+1") return /^([2-9]\d{9})$/.test(clean)
  return clean.length >= 7 && clean.length <= 15
}

/**
 * Returns maximum digits allowed based on country phone prefix.
 */
export const getMaxPhoneLength = (prefix) => {
  if (prefix === "+84") return 10
  if (prefix === "+86") return 11
  if (prefix === "+1") return 10
  return 15
}
