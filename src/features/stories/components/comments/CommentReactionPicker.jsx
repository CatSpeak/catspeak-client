import React from "react"
import { REACTIONS } from "./constants"

/**
 * Floating emoji picker that appears on hover above the Like button.
 * Renders one button per reaction type defined in REACTIONS.
 *
 * @param {(type: number) => void} props.onReact - Called with the reaction type number
 */
const CommentReactionPicker = ({ onReact }) => (
  <div className="absolute bottom-full left-0 mb-1 flex items-center gap-1 rounded-full border border-gray-100 bg-white p-1 shadow-lg z-20">
    {Object.entries(REACTIONS).map(([type, cfg]) => {
      const Icon = cfg.icon
      return (
        <button
          key={type}
          type="button"
          onClick={(e) => { e.stopPropagation(); onReact(parseInt(type, 10)) }}
          className="rounded-full p-1.5 hover:-translate-y-1 transition-transform"
          title={cfg.label}
        >
          <Icon size={20} className={`${cfg.color} ${cfg.fill}`} />
        </button>
      )
    })}
  </div>
)

export default CommentReactionPicker
