import React from "react";
import { Outlet } from "react-router-dom";


const UserPagesLayout = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Outlet />
    </div>
  );
};

export default UserPagesLayout;
