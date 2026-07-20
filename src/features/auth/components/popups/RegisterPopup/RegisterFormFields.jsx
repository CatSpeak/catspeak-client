import { ChevronDown } from "lucide-react";
import TextInput from "@/shared/components/ui/inputs/TextInput";
import FormDatePicker from "../../forms/FormDatePicker";
import Dropdown from "@/shared/components/ui/Dropdown";
import { countries } from "@/shared/constants/countriesData";

const languageOptions = [
  { value: "english", label: "English" },
  { value: "vietnamese", label: "Tiếng Việt" },
  { value: "chinese", label: "中文" },
];

const countryOptions = countries.map((c) => ({
  key: c.code,
  value: c.value,
  label: c.label,
  searchTerms: `${c.code} ${c.value} ${c.label}`,
  icon: (
    <img
      src={`https://flagcdn.com/w40/${c.value}.png`}
      className="w-[20px] h-[20px] rounded-full object-cover"
      alt={c.code}
    />
  ),
}));

const phonePrefixes = countries
  .filter((c) => c.dialCode)
  .map((c) => ({
    key: c.code,
    value: c.dialCode,
    label: `${c.dialCode} (${c.label})`,
    subtitle: c.label,
    searchTerms: `${c.code} ${c.value} ${c.label} ${c.dialCode}`,
    icon: (
      <img
        src={`https://flagcdn.com/w40/${c.value}.png`}
        className="w-[20px] h-[20px] rounded-full object-cover"
        alt={c.code}
      />
    ),
  }));

const RegisterFormFields = ({
  authText,
  formData,
  setFormData,
  errors,
  setErrors,
}) => {
  const prefixLength = formData.phonePrefix?.length || 3;
  const plClass =
    prefixLength <= 2
      ? "pl-[80px]"
      : prefixLength === 3
        ? "pl-[90px]"
        : prefixLength === 4
          ? "pl-[100px]"
          : prefixLength === 5
            ? "pl-[110px]"
            : "pl-[120px]";

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Username */}
      <div>
        <label className="block text-xs text-[#606060] mb-1">
          {authText.usernameLabel}
        </label>
        <TextInput
          type="text"
          variant="round"
          placeholder={authText.usernamePlaceholder}
          value={formData.username}
          onChange={handleChange("username")}
          error={errors.username}
        />
      </div>

      {/* Email & Phone Number - Side by Side */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs text-[#606060] mb-1">
            {authText.emailLabel}
          </label>
          <TextInput
            type="email"
            variant="round"
            placeholder={authText.emailOnlyPlaceholder}
            value={formData.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs text-[#606060] mb-1">
            {authText.phoneLabel}
          </label>
          <Dropdown
            options={phonePrefixes}
            value={formData.phonePrefix}
            onChange={(val) => setFormData({ ...formData, phonePrefix: val })}
            enableSearch={true}
            searchPlaceholder={
              authText.searchPhonePlaceholder || "Search phone code..."
            }
            dropdownClassName="w-full min-w-[260px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
            trigger={(isOpen, selectedOption, toggleDropdown) => (
              <TextInput
                type="tel"
                variant="round"
                placeholder={authText.phonePlaceholder}
                value={formData.phoneNumber}
                onChange={handleChange("phoneNumber")}
                error={errors.phoneNumber}
                leftContentWidthClass={plClass}
                leftContent={
                  <div className="flex items-center h-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown();
                      }}
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
        </div>
      </div>

      {/* Date of Birth & Language - Side by Side */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs text-[#606060] mb-1">
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
          <label className="block text-xs text-[#606060] mb-1">
            {authText.languageLabel}
          </label>
          <Dropdown
            placeholder={authText.languagePlaceholder}
            value={formData.preferredLanguage}
            onChange={(val) =>
              handleChange("preferredLanguage")({ target: { value: val } })
            }
            options={languageOptions}
            triggerClassName={errors.preferredLanguage ? "!border-red-600" : ""}
            trigger={(isOpen, selectedOption, toggleDropdown) => (
              <button
                type="button"
                onClick={toggleDropdown}
                className={`text-sm flex items-center justify-between border rounded-3xl px-4 h-[56px] w-full bg-white transition-colors hover:border-[#8e0000] focus:border-[#8e0000] ${
                  errors.preferredLanguage
                    ? "border-red-500"
                    : "border-[#e5e5e5]"
                }`}
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  {selectedOption?.icon}
                  <span
                    className={`truncate ${!selectedOption ? "text-[#9e9e9e]" : ""}`}
                  >
                    {selectedOption?.label || authText.languagePlaceholder}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            )}
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
          <label className="block text-xs text-[#606060] mb-1">
            {authText.passwordLabel}
          </label>
          <TextInput
            type="password"
            variant="round"
            placeholder={authText.passwordPlaceholder}
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs text-[#606060] mb-1">
            {authText.countryLabel}
          </label>
          <Dropdown
            placeholder={authText.countryPlaceholder}
            value={formData.country}
            onChange={(val) =>
              handleChange("country")({ target: { value: val } })
            }
            options={countryOptions}
            enableSearch={true}
            searchPlaceholder={
              authText.searchCountryPlaceholder || "Search country..."
            }
            triggerClassName={errors.country ? "!border-red-600" : ""}
            trigger={(isOpen, selectedOption, toggleDropdown) => (
              <button
                type="button"
                onClick={toggleDropdown}
                className={`text-sm flex items-center justify-between border rounded-3xl px-4 h-[56px] w-full bg-white transition-colors hover:border-[#8e0000] focus:border-[#8e0000] ${
                  errors.country ? "border-red-500" : "border-[#e5e5e5]"
                }`}
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  {selectedOption?.icon}
                  <span
                    className={`truncate ${!selectedOption ? "text-[#9e9e9e]" : ""}`}
                  >
                    {selectedOption?.label || authText.countryPlaceholder}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            )}
          />
          {errors.country && (
            <p className="mt-1 text-xs text-red-600">{errors.country}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterFormFields;
