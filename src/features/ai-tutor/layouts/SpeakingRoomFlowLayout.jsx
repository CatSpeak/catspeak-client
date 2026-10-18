import { useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth"

const SpeakingRoomFlowLayout = () => {
  const [sessionCredentials, setSessionCredentials] = useState(null)
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // BUG-SS-12: hết hạn đăng nhập giữa phiên (refresh token thất bại thì store
  // logout) thì mở đăng nhập, đăng nhập xong quay lại đúng trang đang dùng.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          requireLogin: true,
          redirectTo: location.pathname + location.search + location.hash,
        }}
      />
    )
  }

  return <Outlet context={{ sessionCredentials, setSessionCredentials }} />
}

export default SpeakingRoomFlowLayout
