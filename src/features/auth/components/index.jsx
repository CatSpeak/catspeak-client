import { useState, useEffect } from "react"
import LoginPopup from "./popups/LoginPopup"
import RegisterPopup from "./popups/RegisterPopup"
import ResetPasswordPopup from "./popups/ResetPasswordPopup"
import VerifyEmailOtpPopup from "./popups/VerifyEmailOtpPopup"

// The AnimatePresence inside each Popup's Modal will handle the cross-fade cleanly
// when their respective 'open' prop toggles from true to false.
const Auth = ({ isOpen, mode = "login", email = "", onClose, onSwitchMode }) => {
  return (
    <>
      <LoginPopup
        key="login"
        open={isOpen && mode === "login"}
        onClose={onClose}
        onSwitchMode={onSwitchMode}
      />
      <RegisterPopup
        key="register"
        open={isOpen && mode === "register"}
        onClose={onClose}
        onSwitchMode={onSwitchMode}
      />
      <ResetPasswordPopup
        key="forgot"
        open={isOpen && (mode === "forgot" || mode === "reset-password")}
        onClose={onClose}
        onSwitchMode={onSwitchMode}
      />
      <VerifyEmailOtpPopup
        key="verify-email"
        open={isOpen && mode === "verify-email"}
        email={email}
        onClose={onClose}
        onSwitchMode={onSwitchMode}
      />
    </>
  )
}

export default Auth

