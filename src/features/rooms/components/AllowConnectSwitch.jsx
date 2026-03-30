import React, { useState } from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const AllowConnectSwitch = () => {
  const { t } = useLanguage()
  const [allowConnect, setAllowConnect] = useState(false)
  const [isDevModalOpen, setIsDevModalOpen] = useState(false)

  const handleSwitchChange = (event) => {
    const checked = event.target.checked
    if (checked) {
      setIsDevModalOpen(true)
    } else {
      setAllowConnect(false)
    }
  }

  return (
    <>
      {/* 
      <div className="flex items-center gap-2 px-2 text-[#990011] font-medium">
        <Switch checked={allowConnect} onChange={handleSwitchChange} />
        {t.rooms?.welcome?.allowConnect}
      </div>

      <InDevelopmentModal
        open={isDevModalOpen}
        onCancel={() => setIsDevModalOpen(false)}
      />
      */}
    </>
  )
}

export default AllowConnectSwitch
