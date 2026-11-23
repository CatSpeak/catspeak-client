import { Navigate, useLocation, useParams } from "react-router-dom"
import { getProfilePath } from "@/shared/utils/navigation"

/**
 * Preserves old shared links of the form /profile/:accountId by sending them
 * to the canonical workspace profile route.
 */
const LegacyProfileRedirect = () => {
  const { accountId } = useParams()
  const location = useLocation()

  return (
    <Navigate
      to={`${getProfilePath(accountId)}${location.search}`}
      replace
    />
  )
}

export default LegacyProfileRedirect
