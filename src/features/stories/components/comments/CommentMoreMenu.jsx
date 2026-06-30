import React, { useState, useRef, useEffect } from "react"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"

/**
 * The "⋮" context menu shown on a comment the current user owns.
 *
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDelete
 */
const CommentMoreMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#9e9e9e] hover:bg-[#f0f0f0] transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[130px] overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-lg">
          <button
            type="button"
            onClick={() => { onEdit(); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#3d3d3d] hover:bg-[#f5f5f5] transition-colors"
          >
            <Pencil size={14} />
            Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={() => { onDelete(); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Xóa
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentMoreMenu
