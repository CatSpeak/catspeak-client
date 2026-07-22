import React from "react";
import ProfileDropdown from "@/features/user/components/ProfileDropdown";
import { useAuth } from "@/features/auth";
import { MessageWidget } from "@/features/chat";
import { NotificationWidget } from "@/features/notifications";

const LandingHeaderUserControls = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated && <MessageWidget />}

      <NotificationWidget />

      <ProfileDropdown />
    </div>
  );
};

export default LandingHeaderUserControls;
