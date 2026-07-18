import React, { useCallback, useMemo, useState } from "react"
import { useNavigate, Outlet, useParams } from "react-router-dom"
import { Film, ListPlus, Plus } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"

import Tabs from "@/shared/components/ui/navigation/Tabs"
import CreateReelModal from "../components/modals/CreateReelModal"
import WorkspaceMyReelsTab from "../components/tabs/WorkspaceMyReelsTab"
import WorkspacePlaylistsTab from "../components/tabs/WorkspacePlaylistsTab"

const getLocale = (lang) => {
  if (lang === "zh") return "zh-CN"
  if (lang === "vi") return "vi-VN"
  return "en-US"
}

const WorkspaceReelsContent = ({ userId }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const currentLang = localStorage.getItem("communityLanguage") || "en"
  const locale = getLocale(currentLang)

  const [activeTab, setActiveTab] = useState("myReels")
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const ws = t?.catSpeak?.reels?.workspace || {}

  const tabs = useMemo(() => [
    { id: "myReels", label: ws?.tabs?.myReels || "My Reels", icon: Film },
    { id: "playlists", label: ws?.tabs?.playlists || "Playlists", icon: ListPlus },
  ], [ws])

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }),
    [locale]
  )
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return Number.isNaN(date.getTime()) ? dateStr : dateFormatter.format(date)
  }, [dateFormatter])

  const formatNumber = useCallback(
    (value) => numberFormatter.format(value || 0),
    [numberFormatter]
  )

  const { id } = useParams()

  const handleUploadClose = useCallback(() => {
    setIsUploadOpen(false)
  }, [])

  return (
    <div className="flex flex-col gap-5 text-gray-800">
      {!id && (
        <div className="hidden">
        </div>
      )}

      {id ? (
        <Outlet />
      ) : (
        <>
          <div className="flex justify-between items-center border-b border-gray-200 mb-4">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              fullWidth={false}
              className="border-none mb-0"
            />
            {!id && activeTab === "myReels" && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="bg-cath-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-cath-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-1 text-sm shrink-0 mb-3 ml-4"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">{t.catSpeak?.reels?.uploadReel || "Upload Reel"}</span>
              </button>
            )}
          </div>

          {activeTab === "myReels" ? (
            <WorkspaceMyReelsTab
              userId={userId}
              formatDate={formatDate}
              formatNumber={formatNumber}
              navigate={navigate}
              setIsUploadOpen={setIsUploadOpen}
            />
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
