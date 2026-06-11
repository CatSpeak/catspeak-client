/**
 * Maps API field names to form field names used in the registration form.
 */
const FIELD_MAP = {
  Username: "username",
  Email: "email",
  PhoneNumber: "phoneNumber",
  DateOfBirth: "dateOfBirth",
  PreferredLanguage: "preferredLanguage",
  Password: "password",
  Country: "country",
}

/**
 * Maps API field names to translation keys in authText for validation errors.
 */
const FIELD_TRANSLATION_MAP = {
  Username: "validationUsernameRequired",
  Email: "validationEmailRequired",
  PhoneNumber: "validationPhoneInvalid",
  DateOfBirth: "validationDobRequired",
  PreferredLanguage: "validationLanguageRequired",
  Password: "validationPasswordRequired",
  Country: "validationCountryRequired",
}

/**
 * Parses a registration API error response and returns either
 * field-level errors or a general error message.
 *
 * @param {object} err - The error object from the API call
 * @param {object} authText - The auth translation object
 * @returns {{ fieldErrors: object|null, message: string|null }}
 */
export const parseRegisterError = (err, authText) => {
  const apiErrors = err?.data?.errors

  if (apiErrors && typeof apiErrors === "object") {
    const mapped = {}
    for (const [key, messages] of Object.entries(apiErrors)) {
      // Find field matching key case-insensitively
      const fieldKey = Object.keys(FIELD_MAP).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      )
      const field = fieldKey ? FIELD_MAP[fieldKey] : null

      if (field) {
        const firstMessage = (Array.isArray(messages) && messages[0]) || ""
        const lowerMsg = firstMessage.toLowerCase()

        // Handle 'already exists' specific errors
        if (field === "email" && lowerMsg.includes("already exists") && authText.emailExists) {
          mapped[field] = authText.emailExists
        } else if (field === "phoneNumber" && lowerMsg.includes("already exists") && authText.phoneExists) {
          mapped[field] = authText.phoneExists
        } else if (field === "username" && lowerMsg.includes("already exists") && authText.usernameExists) {
          mapped[field] = authText.usernameExists
        } else {
          // Use translated message if available, otherwise fall back to API message
          const translationKey = fieldKey ? FIELD_TRANSLATION_MAP[fieldKey] : null
          mapped[field] =
            (translationKey && authText[translationKey]) ||
            firstMessage ||
            ""
        }
      }
    }
    if (Object.keys(mapped).length > 0) {
      return { fieldErrors: mapped, message: null }
    }
  }

  // Handle generic message translation for "already exists"
  let genericMessage = err?.data?.message || err?.data?.title || authText.registrationFailed
  
  if (typeof genericMessage === "string") {
    const lowerMsg = genericMessage.toLowerCase()
    if (lowerMsg.includes("already exists") || lowerMsg.includes("taken")) {
      if (lowerMsg.includes("username") && authText.usernameExists) {
        return { fieldErrors: { username: authText.usernameExists }, message: null }
      } else if (lowerMsg.includes("email") && authText.emailExists) {
        return { fieldErrors: { email: authText.emailExists }, message: null }
      } else if (lowerMsg.includes("phone") && authText.phoneExists) {
        return { fieldErrors: { phoneNumber: authText.phoneExists }, message: null }
      }
    }
  }

  return {
    fieldErrors: null,
    message: genericMessage,
  }
}
