import { Navigate } from "react-router-dom"

/**
 * PublicRoute - Component để điều hướng các route public
 * Nếu user đã đăng nhập, có thể redirect đến trang chính
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con
 * @param {boolean} props.isAuthenticated - Trạng thái đăng nhập
 * @param {string} props.redirectTo - Đường dẫn redirect nếu đã đăng nhập (mặc định: '/workspace/dashboard')
 */
const PublicRoute = ({
  children,
  isAuthenticated = false,
  redirectTo = "/workspace/dashboard",
}) => {
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default PublicRoute
