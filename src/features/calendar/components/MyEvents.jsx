import React from "react"
import { useGetMyEventsQuery } from "@/store/api/eventsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import EventList from "./EventList"

const MyEvents = () => {
  const { t } = useLanguage()
  const { data, isLoading } = useGetMyEventsQuery()

  return (
    <EventList
      title={t.calendar?.myEvents || "Sự kiện của tôi"}
      data={data}
      isLoading={isLoading}
      defaultColor="#4ECDC4"
      eventFlags={{ isOwner: true }}
    />
  )
}

export default MyEvents
