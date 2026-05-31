import React from "react"
import { useGetRegisteredEventsQuery } from "@/store/api/eventsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import EventList from "./EventList"
import colors from "@/shared/utils/colors"

const RegisteredEvents = () => {
  const { t } = useLanguage()
  const { data, isLoading } = useGetRegisteredEventsQuery()

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
