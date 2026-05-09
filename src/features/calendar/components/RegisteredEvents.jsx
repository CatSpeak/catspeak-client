import React from "react"
import { useGetRegisteredEventsQuery } from "@/store/api/eventsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import EventList from "./EventList"

const RegisteredEvents = () => {
  const { t } = useLanguage()
  const { data, isLoading } = useGetRegisteredEventsQuery()

  return (
    <EventList
      title={t.calendar?.registered || "Đã đăng kí"}
      data={data}
      isLoading={isLoading}
      defaultColor="#990011"
      eventFlags={{ isRegistered: true }}
    />
  )
}

export default RegisteredEvents
