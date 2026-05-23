import TextInput from "@/shared/components/ui/inputs/TextInput"
import FormDatePicker from "../../forms/FormDatePicker"
import FormSelectField from "../../forms/FormSelectField"

const RegisterFormFields = ({
  authText,
  formData,
  setFormData,
  errors,
  setErrors,
}) => {

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "vietnamese", label: "Tiếng Việt" },
    { value: "chinese", label: "中文" },
  ]

  const countryOptions = [
    { value: "vietnam", label: "Vietnam" },
    { value: "usa", label: "United States" },
    { value: "china", label: "China" },
  ]

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Username */}
      <div>
        <label className="block text-sm mb-2">{authText.fullNameLabel}</label>
        <TextInput
          variant="square"
          placeholder={authText.fullNamePlaceholder}
          value={formData.username}
          onChange={handleChange("username")}
          className={
            errors.username
              ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600"
              : ""
          }
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-600">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm mb-2">{authText.emailLabel}</label>
        <TextInput
          type="email"
          variant="square"
          placeholder={authText.emailPlaceholder}
          value={formData.email}
          onChange={handleChange("email")}
          className={
            errors.email
              ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600"
              : ""
          }
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Date of Birth & Language - Side by Side */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-2">
            {authText.dateOfBirthLabel}
          </label>
          <FormDatePicker
            placeholder={authText.dateOfBirthPlaceholder}
            value={formData.dateOfBirth}
            onChange={handleChange("dateOfBirth")}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth}
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm mb-2">{authText.languageLabel}</label>
          <FormSelectField
            placeholder={authText.languagePlaceholder}
            value={formData.preferredLanguage}
            onChange={handleChange("preferredLanguage")}
            error={!!errors.preferredLanguage}
            errorText={errors.preferredLanguage}
            options={languageOptions}
          />
        </div>
      </div>

      {/* Password & Country - Side by Side */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-2">{authText.passwordLabel}</label>
          <div className="relative">
            <TextInput
              type="password"
              variant="square"
              placeholder={authText.passwordPlaceholder}
              value={formData.password}
              onChange={handleChange("password")}
              className={`pr-12 ${errors.password
                ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600"
                : ""
                }`}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm mb-2">{authText.countryLabel}</label>
          <FormSelectField
            placeholder={authText.countryPlaceholder}
            value={formData.country}
            onChange={handleChange("country")}
            error={!!errors.country}
            errorText={errors.country}
            options={countryOptions}
          />
        </div>
      </div>
    </div>
  )
}

export default RegisterFormFields
