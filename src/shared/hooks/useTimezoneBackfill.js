import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "@/store/api/userApi"
import { setCredentials } from "@/store/slices/authSlice"
import { getBrowserTimeZone } from "@/shared/constants/timezones"

/**
 * Syncs user profile with Redux state on load.
 * Only if the user has no TimeZone set in DB (null or empty),
 * fire a single updateUserProfile call to auto-backfill their browser TimeZone.
 */
export const useTimezoneBackfill = () => {
  const authUser = useSelector((state) => state.auth?.user)
  const token = useSelector((state) => state.auth?.token)
  const dispatch = useDispatch()

  const { data: profileResponse, isSuccess } = useGetUserProfileQuery(undefined, {
    skip: !token,
  })
  const [updateUserProfile] = useUpdateUserProfileMutation()
  const firedRef = useRef(false)

  const profileData = profileResponse?.data ?? profileResponse

  useEffect(() => {
    if (!token || !isSuccess || !profileData) return

    // Synchronize Redux auth.user with profileData from DB whenever it arrives
    if (authUser && profileData.timeZone && authUser.timeZone !== profileData.timeZone) {
      dispatch(
        setCredentials({
          user: { ...authUser, ...profileData },
          token,
        }),
      )
    }

    if (firedRef.current) return

    // If profile in DB already has a valid timezone set, DO NOT overwrite!
    if (typeof profileData.timeZone === "string" && profileData.timeZone.trim().length > 0) {
      return
    }

    // Only backfill browser timezone if user's timezone in DB is explicitly null or empty
    const targetTz = getBrowserTimeZone()
    firedRef.current = true

    updateUserProfile({ timeZone: targetTz })
      .unwrap()
      .then((response) => {
        const payload = response?.data ?? response
        if (payload && authUser) {
          dispatch(
            setCredentials({
              user: { ...authUser, ...payload, timeZone: targetTz },
              token,
            }),
          )
        }
      })
      .catch(() => {
        // allow retry on next mount if the request failed
        firedRef.current = false
      })
  }, [authUser, token, isSuccess, profileData, dispatch, updateUserProfile])
}

export default useTimezoneBackfill
