import React from "react"
import { VolumeX, Volume1, Volume2 } from "lucide-react"

/**
 * Reusable Volume Slider component with hover expansion animation.
 * Features a mute toggle button and a smooth sliding volume track.
 */
const VolumeSlider = ({ isMuted, volume, onVolumeChange, onToggleMute }) => {
  return (
    <div
      className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-1.5 transition-all duration-300 group/volume overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center cursor-pointer transition-all duration-200 border border-white/10 shrink-0"
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX size={18} color="white" />
        ) : volume < 0.6 ? (
          <Volume1 size={18} color="white" />
        ) : (
          <Volume2 size={18} color="white" />
        )}
      </button>

      {/* Volume Slider - expands to the right smoothly */}
      <div className="max-w-0 group-hover/volume:max-w-24 transition-all duration-300 ease-in-out opacity-0 group-hover/volume:opacity-100 flex items-center group-hover/volume:ml-2 group-hover/volume:mr-1 overflow-visible">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={onVolumeChange}
          style={{
            background: `linear-gradient(to right, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.25) ${(isMuted ? 0 : volume) * 100}%)`,
          }}
          className="w-24 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.4)] hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-transform"
        />
      </div>
    </div>
  )
}

export default VolumeSlider
