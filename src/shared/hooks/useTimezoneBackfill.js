import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useUpdateUserProfileMutation } from "@/store/api/userApi"
import { setCredentials } from "@/store/slices/authSlice"
import { getBrowserTimeZone } from "@/shared/constants/timezones"

/**
 * On every render where the user has no TimeZone set in DB (null or empty),
 * fire a single updateUserProfile call to auto-backfill their browser TimeZone.
 * After the mutation succeeds, synchronise Redux so the rest of the app
 * and Settings dropdown immediately reflects the auto-detected value.
 */
export const useTimezoneBackfill = () => {
  const user = useSelector((state) => state.auth?.user)
  const token = useSelector((state) => state.auth?.token)
  const dispatch = useDispatch()
  const [updateUserProfile] = useUpdateUserProfileMutation()
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    if (!user) return
    if (typeof user.timeZone === "string" && user.timeZone.length > 0) return

    const targetTz = getBrowserTimeZone()
    firedRef.current = true

    updateUserProfile({ timeZone: targetTz })
      .unwrap()
      .then((response) => {
        const payload = response?.data ?? response
        if (payload && user) {
          dispatch(
            setCredentials({
              user: { ...user, ...payload, timeZone: targetTz },
              token,
            }),
          )
        }
      })
      .catch(() => {
        // allow retry on next mount if the request failed
        firedRef.current = false
      })
  }, [user, token, dispatch, updateUserProfile])
}

export default useTimezoneBackfill
