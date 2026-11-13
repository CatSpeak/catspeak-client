import React, { useCallback, useMemo, useState } from "react"
import { useNavigate, Outlet, useParams } from "react-router-dom"
import { Film, ListPlus, Plus } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useAuth } from "@/features/auth"

import Tabs from "@/shared/components/ui/navigation/Tabs"
import CreateReelModal from "../components/modals/CreateReelModal"
import WorkspaceMyReelsTab from "../components/tabs/WorkspaceMyReelsTab"
import WorkspacePlaylistsTab from "../components/tabs/WorkspacePlaylistsTab"
import { PillButton } from "@/shared/components/ui/buttons"

const getLocale = (lang) => {
  if (lang === "zh") return "zh-CN"
  if (lang === "vi") return "vi-VN"
  return "en-US"
}

const WorkspaceReelsContent = ({ userId }) => {
  const { t } = useLanguage()
  const { userTimeZone } = useTimezone()
  const navigate = useNavigate()
  const currentLang = localStorage.getItem("communityLanguage") || "en"
  const locale = getLocale(currentLang)

  const [activeTab, setActiveTab] = useState("myReels")
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const ws = t?.catSpeak?.reels?.workspace || {}

  const tabs = useMemo(
    () => [
      { id: "myReels", label: ws?.tabs?.myReels || "My Reels", icon: Film },
      {
        id: "playlists",
        label: ws?.tabs?.playlists || "Playlists",
        icon: ListPlus,
      },
    ],
    [ws],
  )

  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const { formatDate } = useTimezone()

  const formatNumber = useCallback(
    (value) => numberFormatter.format(value || 0),
    [numberFormatter],
  )

  const { id } = useParams()

  const handleUploadClose = useCallback(() => {
    setIsUploadOpen(false)
  }, [])

  return (
    <div className="text-gray-800 dark:text-neutral-200">
      {!id && <div className="hidden"></div>}

      {id ? (
        <Outlet />
      ) : (
        <>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            fullWidth={false}
            className="mb-4"
          />

          {activeTab === "myReels" ? (
            <div>
              <div className="flex justify-end mb-4 px-4">
                {!id && activeTab === "myReels" && (
                  <PillButton onClick={() => setIsUploadOpen(true)}>
                    <span className="hidden sm:inline">
                      {t.catSpeak?.reels?.uploadReel || "Upload Reel"}
                    </span>
                  </PillButton>
                )}
              </div>

              <WorkspaceMyReelsTab
                userId={userId}
                formatDate={formatDate}
                formatNumber={formatNumber}
                navigate={navigate}
                setIsUploadOpen={setIsUploadOpen}
              />
            </div>
          ) : (
            <WorkspacePlaylistsTab
              formatNumber={formatNumber}
              formatDate={formatDate}
              navigate={navigate}
            />
          )}
        </>
      )}

      {isUploadOpen && (
        <CreateReelModal open={isUploadOpen} onClose={handleUploadClose} />
      )}
    </div>
  )
}

const WorkspaceReelsPage = () => {
  const { user } = useAuth()
  const userId = user?.accountId

  return <WorkspaceReelsContent key={userId || "anonymous"} userId={userId} />
}

export default WorkspaceReelsPage
