import { useState } from "react"
import { Outlet } from "react-router-dom"

const SpeakingRoomFlowLayout = () => {
  const [sessionCredentials, setSessionCredentials] = useState(null)
  return <Outlet context={{ sessionCredentials, setSessionCredentials }} />
}

export default SpeakingRoomFlowLayout
