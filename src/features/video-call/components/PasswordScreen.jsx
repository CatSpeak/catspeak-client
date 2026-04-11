import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Lock, Eye, EyeOff } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import BackButton from "@/shared/components/ui/buttons/BackButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getCommunityPath } from "@/shared/utils/navigation"

const PasswordScreen = ({ room, error, isLoading, onSubmit }) => {
  const { lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!password.trim() || isLoading) return
    onSubmit(password)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 flex w-full shrink-0 items-center justify-start px-5 py-3 bg-gray-50/95 backdrop-blur-sm">
        <BackButton
          onClick={() => navigate(getCommunityPath(lang || language))}
        >
          {t.rooms.waitingScreen.backToCommunity}
        </BackButton>
      </div>

      {/* Centered Content */}
      <div className="flex flex-1 w-full flex-col items-center justify-center px-5 pb-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6 w-full max-w-[380px]"
        >
          {/* Hidden username for accessibility to fix Chromium DOM warning */}
          <input
            type="text"
            autoComplete="username"
            value={room?.roomId || "room"}
            readOnly
            className="hidden"
          />
          {/* Lock icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#990011]/10 mb-2">
            <Lock size={36} className="text-[#990011]" />
          </div>

          {/* Title & room name */}
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-tight mb-2">
              {t.rooms.passwordScreen.title}
            </h1>
            {room?.name && (
              <p className="text-base text-[#7A7574] font-medium mb-1">
                {room.name}
              </p>
            )}
            {room && (
              <div className="flex flex-wrap justify-center gap-2 mb-3 mt-2">
                {room.requiredLevel && (
                  <span className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {room.requiredLevel}
                  </span>
                )}
                {room.topic &&
                  room.topic.split(",").map((t_topic) => {
                    const trimmed = t_topic.trim()
                    return (
                      <span
                        key={trimmed}
                        className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                      >
                        {t.rooms?.createRoom?.topics?.[trimmed.toLowerCase()] ||
                          trimmed}
                      </span>
                    )
                  })}
              </div>
            )}
            <p className="text-[15px] text-[#7A7574] leading-relaxed">
              {t.rooms.passwordScreen.description}
            </p>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="room-password-screen"
              className="text-sm font-medium"
            >
              {t.rooms.passwordScreen.label}
            </label>
            <div className="relative">
              <TextInput
                id="room-password-screen"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.rooms.passwordScreen.placeholder}
                autoFocus
                autoComplete="new-password"
                className={`pr-10 ${error ? "!border-red-400 focus:!border-red-500 hover:!border-red-500 focus:!ring-red-500" : ""}`.trim()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7574] hover:text-[#333] transition-colors z-10"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className="m-0 text-xs text-red-500">
                {error}
              </p>
            )}
          </div>

          {/* Submit button */}
          <PillButton
            type="submit"
            className="h-11 w-full mt-1"
            loading={isLoading}
            loadingText={t.rooms.passwordScreen.verifying}
            disabled={!password.trim()}
          >
            {t.rooms.passwordScreen.submit}
          </PillButton>
        </form>
      </div>
    </div>
  )
}

export default PasswordScreen
