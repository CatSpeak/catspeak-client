import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"

const AccountSettingsPage = () => {
  const { t } = useLanguage()
  const { receiveSystemMsgs, setReceiveSystemMsgs } = useGlobalVideoCall()

  return (
    <div>
      <PageTitle>
        {t.settings?.catSpeakAssistant || "Cat Speak Assistant"}
      </PageTitle>

      <FluentCard>
        <div className="flex items-center justify-between gap-5">
          <label className="text-sm">
            {t.rooms?.chatBox?.showSystemMessages ||
              "Show Cat Speak suggestion messages"}
          </label>

          <Switch
            checked={receiveSystemMsgs}
            onChange={(e) => setReceiveSystemMsgs(e.target.checked)}
            colorClass="peer-checked:bg-green-500"
            showLabel={true}
          />
        </div>
      </FluentCard>
    </div>
  )
}

export default AccountSettingsPage
