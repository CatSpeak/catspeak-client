import React from "react";
import ProfileAvatarNCover from "@/shared/components/profile/ProfileAvatarNCover";

const AccountHeader = ({ user, formData, t, isOwnProfile = true }) => {
  return (
    <ProfileAvatarNCover
      user={user}
      formData={formData}
      t={t}
      isOwnProfile={isOwnProfile}
    />
  );
};

export default AccountHeader;
