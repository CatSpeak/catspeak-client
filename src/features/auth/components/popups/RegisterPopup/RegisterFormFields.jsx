import TextInput from "@/shared/components/ui/inputs/TextInput"
import FormDatePicker from "../../forms/FormDatePicker"
import Dropdown from "@/shared/components/ui/Dropdown"
import { VietNam, China, USA } from "@/shared/assets/icons/flags"
import { ChevronDown } from "lucide-react"
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
    {
      value: "vietnam",
      label: "Vietnam",
      icon: (
        <img
          src={VietNam}
          className="w-[20px] h-[20px] rounded-full object-cover"
          alt="VN"
        />
      ),
    },
    {
      value: "usa",
      label: "United States",
      icon: (
        <img
          src={USA}
          className="w-[20px] h-[20px] rounded-full object-cover"
          alt="US"
        />
      ),
    },
    {
      value: "china",
      label: "China",
      icon: (
        <img
          src={China}
          className="w-[20px] h-[20px] rounded-full object-cover"
          alt="CN"
        />
      ),
    },
  ]

  const phonePrefixes = [
    {
      value: "+1",
      label: "United States",
      icon: (
        <img
          src={USA}
          className="w-[20px] h-[20px] rounded-full object-cover"
          alt="US"
        />
      ),
    },
    {
      value: "+86",
      label: "China",
      icon: (
        <img
          src={China}
          className="w-[20px] h-[20px] rounded-full object-cover"
          alt="CN"
        />
      ),
    },
    {
      value: "+84",
      label: "Vietnam",
      icon: (
        <img
          src={VietNam}
          className="w-[20px] h-[20px] rounded-full object-cover"
          alt="VN"
        />
      ),
    },
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

      {/* Email & Phone - Side by Side */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-2">{authText.emailLabel}</label>
          <TextInput
            type="email"
            variant="square"
            placeholder={authText.emailOnlyPlaceholder}
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

        <div className="flex-1">
          <label className="block text-sm mb-2">{authText.phoneLabel}</label>
          <Dropdown
            options={phonePrefixes}
            value={formData.phonePrefix}
            onChange={(val) => setFormData({ ...formData, phonePrefix: val })}
            dropdownClassName="w-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
            trigger={(isOpen, selectedOption, toggleDropdown) => (
              <TextInput
                type="tel"
                variant="square"
                placeholder={authText.phonePlaceholder}
                value={formData.phoneNumber}
                onChange={handleChange("phoneNumber")}
                className={
                  errors.phoneNumber
                    ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600"
                    : ""
                }
                leftContentWidthClass="pl-[95px]"
                leftContent={
                  <div className="flex items-center h-full">
                    <button
                      type="button"
                      onClick={toggleDropdown}
                      className="flex items-center gap-1 pl-0 pr-1 h-full focus:outline-none cursor-pointer"
                    >
                      <span className="text-base leading-none">
                        {
                          phonePrefixes.find(
                            (p) => p.value === formData.phonePrefix,
                          )?.icon
                        }
                      </span>
                      <ChevronDown size={14} className="text-gray-500" />
                    </button>
                    <span className="text-[#606060] text-sm ml-1">
                      {formData.phonePrefix}
                    </span>
                  </div>
                }
              />
            )}
            renderOption={(option, isSelected) => (
              <div
                className={`w-full h-10 px-3 text-left text-sm flex items-center gap-3 ${
                  isSelected
                    ? "bg-[#F6F6F6] font-semibold"
                    : "hover:bg-[#F6F6F6]"
                }`}
              >
                <span className="text-base shrink-0">{option.icon}</span>
                <span className="truncate flex-1">{option.label}</span>
                <span className="text-[#606060] shrink-0">{option.value}</span>
              </div>
            )}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
          )}
        </div>
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
          <Dropdown
            placeholder={authText.languagePlaceholder}
            value={formData.preferredLanguage}
            onChange={(val) =>
              handleChange("preferredLanguage")({ target: { value: val } })
            }
            options={languageOptions}
            triggerClassName={errors.preferredLanguage ? "!border-red-600" : ""}
          />
          {errors.preferredLanguage && (
            <p className="mt-1 text-xs text-red-600">
              {errors.preferredLanguage}
            </p>
          )}
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
              className={`pr-12 ${
                errors.password
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
          <Dropdown
            placeholder={authText.countryPlaceholder}
            value={formData.country}
            onChange={(val) =>
              handleChange("country")({ target: { value: val } })
            }
            options={countryOptions}
            triggerClassName={errors.country ? "!border-red-600" : ""}
            trigger={
              <button
                type="button"
                className={`text-sm flex items-center justify-between border border-[#C6C6C6] rounded-lg px-4 h-10 shadow-sm w-full bg-white transition-colors hover:bg-gray-50 ${
                  errors.country ? "!border-red-600" : ""
                }`}
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  {
                    countryOptions.find((c) => c.value === formData.country)
                      ?.icon
                  }
                  <span className="truncate">
                    {countryOptions.find((c) => c.value === formData.country)
                      ?.label || authText.countryPlaceholder}
                  </span>
                </div>
                <ChevronDown size={14} className="shrink-0 text-gray-500" />
              </button>
            }
          />
          {errors.country && (
            <p className="mt-1 text-xs text-red-600">{errors.country}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterFormFields
