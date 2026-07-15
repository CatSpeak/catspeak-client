import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import BasicInfoSection from "../../user/components/BasicInfoSection"
import AccountPrivacySection from "../../user/components/AccountPrivacySection"

const ProfileAboutTab = ({
  formData,
  editingField,
  isUpdating,
  handleEdit,
  handleCancel,
  handleSave,
  handleChange,
  handleCountryChange,
  t,
  errors,
}) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
      {/* Top Header Card */}
      <FluentCard className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {t.profile?.personalInfo?.title || "Personal Information"}
          </h2>
        </div>

        <BasicInfoSection
          formData={formData}
          editingField={editingField}
          isUpdating={isUpdating}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onChange={handleChange}
          onCountryChange={handleCountryChange}
          t={t}
        />
      </FluentCard>

      {/* Account and Privacy Header Card */}
      <FluentCard className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {t.profile?.personalInfo?.accountAndPrivacy ||
              "Account and Privacy"}
          </h2>
        </div>

        <AccountPrivacySection
          formData={formData}
          editingField={editingField}
          isUpdating={isUpdating}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onChange={handleChange}
          t={t}
          errors={errors}
        />
      </FluentCard>
    </div>
  )
}

export default ProfileAboutTab
