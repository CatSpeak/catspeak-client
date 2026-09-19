import { Navigate, Outlet } from "react-router-dom"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { getCommunityLang } from "@/shared/utils/navigation"

const CommunityGuard = ({ language = "zh", children }) => {
  const { currentLang } = useActiveLink()
  const communityLang = currentLang || getCommunityLang()

  if (communityLang !== language) {
    return <Navigate to={`/${getCommunityLang(communityLang)}/community`} replace />
  }

  return children || <Outlet />
}

export default CommunityGuard
