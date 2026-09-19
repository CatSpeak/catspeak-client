import { Navigate, Outlet } from "react-router-dom"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import {
  DEFAULT_COMMUNITY_LANG,
  getCommunityLang,
} from "@/shared/utils/navigation"

const CommunityGuard = ({ language = DEFAULT_COMMUNITY_LANG, children }) => {
  const { currentLang } = useActiveLink()
  const communityLang = currentLang || getCommunityLang()

  if (communityLang !== language) {
    return <Navigate to={`/${getCommunityLang(communityLang)}/community`} replace />
  }

  return children || <Outlet />
}

export default CommunityGuard
