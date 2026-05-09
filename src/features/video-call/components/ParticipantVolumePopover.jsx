import React, { useState, useEffect } from "react"
import { MoreVertical, Volume2, VolumeX } from "lucide-react"
import Popover from "@/shared/components/ui/Popover"
import Slider from "@/shared/components/ui/Slider"
import { useLanguage } from "@/shared/context/LanguageContext"

const ParticipantVolumeSlider = ({ participant }) => {
  const { t } = useLanguage()
  const pl = t.rooms.videoCall.participantList

  // Volume is 0 → 1
  const [volume, setVolume] = useState(1)
  const [prevVolume, setPrevVolume] = useState(1)

  // Initial load from participant
  useEffect(() => {
    if (!participant || participant.isLocal) return
    if (typeof participant.getVolume === "function") {
      let v = participant.getVolume()
      if (typeof v !== "number" || isNaN(v)) {
        v = 1
      }
      setVolume(v)
      if (v > 0) setPrevVolume(v)
    }
  }, [participant])

  // Keep prevVolume in sync even if volume changes externally
  useEffect(() => {
    if (volume > 0) {
      setPrevVolume(volume)
    }
  }, [volume])

  const applyVolume = (val) => {
    setVolume(val)

    if (participant && !participant.isLocal) {
      if (typeof participant.setVolume === "function") {
        participant.setVolume(val)
      } else {
        // Fallback for older livekit versions
        participant.audioTrackPublications.forEach((pub) => {
          if (pub.track && typeof pub.track.setVolume === "function") {
            pub.track.setVolume(val)
          }
        })
      }
    }
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    applyVolume(val)
  }

  const handleToggleMute = () => {
    if (volume <= 0.001) {
      // muted → restore previous
      applyVolume(prevVolume || 1)
    } else {
      // unmuted → mute
      applyVolume(0)
    }
  }

  const isMuted = volume <= 0.001

  return (
    <div className="bg-white rounded-lg shadow-lg border border-[#e5e5e5] p-3 flex flex-col gap-2 w-48 relative">
      <div className="flex items-center justify-between text-xs text-[#606060] mb-1">
        <span>{pl.volume}</span>
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Clickable mute toggle */}
        <button
          onClick={handleToggleMute}
          className="cursor-pointer"
          title={isMuted ? pl.unmute : pl.mute}
        >
          {isMuted ? (
            <VolumeX size={20} strokeWidth={1} />
          ) : (
            <Volume2 size={20} strokeWidth={1} />
          )}
        </button>

        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          title={pl.adjustVolume}
        />
      </div>
    </div>
  )
}

export const ParticipantVolumePopover = ({ participant }) => {
  const { t } = useLanguage()
  const pl = t.rooms.videoCall.participantList

  if (participant.isLocal) return null

  return (
    <Popover
      trigger={
        <button
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#E5E5E5]"
          title={pl.options}
        >
          <MoreVertical size={20} />
        </button>
      }
      content={<ParticipantVolumeSlider participant={participant} />}
      placement="bottom-right"
    />
  )
}
