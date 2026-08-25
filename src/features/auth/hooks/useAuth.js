import { useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  selectCurrentUser,
  selectCurrentToken,
  selectCurrentRefreshToken,
  selectIsAuthenticated,
  selectUserRole,
  selectAuthStatus,
  logout,
} from "@store/slices/authSlice"

import { baseApi } from "@/store/api/baseApi"

export const useAuth = () => {
  const dispatch = useDispatch()

  const user = useSelector(selectCurrentUser)
  const token = useSelector(selectCurrentToken)
  const refreshToken = useSelector(selectCurrentRefreshToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const role = useSelector(selectUserRole)
  const status = useSelector(selectAuthStatus)

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      user,
      token,
      refreshToken,
      isAuthenticated,
      role,
      status,
      isAdmin: role === "Admin",
      isTeacher: user?.accountType === "Teacher",
      accountType: user?.accountType,
      logout: () => {
        dispatch(logout())
        dispatch(baseApi.util.resetApiState())
      },
    }),
    [user, token, refreshToken, isAuthenticated, role, status, dispatch],
  )
}

export default useAuth
