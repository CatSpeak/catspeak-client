import React from "react"
import { useSelector } from "react-redux"
import { useGetRegisteredEventsQuery } from "@/store/api/eventsApi"
import { selectIsAuthenticated } from "@/store/slices/authSlice"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useLanguage } from "@/shared/context/LanguageContext"
import EventList from "./EventList"
import colors from "@/shared/utils/colors"

const RegisteredEvents = () => {
  const { t } = useLanguage()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { isTeacher } = useRoleOverride()
  const { data, isLoading } = useGetRegisteredEventsQuery(undefined, {
    skip: !isAuthenticated || !isTeacher,
  })

  return (
    <EventList
      title={t.calendar?.registered || "Đã đăng kí"}
      data={data}
      isLoading={isLoading}
      defaultColor={colors.primaryRed}
      eventFlags={{ isRegistered: true }}
    />
  )
}

export default RegisteredEvents
