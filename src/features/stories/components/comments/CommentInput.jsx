import React, { useState, useRef, useEffect } from "react"

/**
 * A text input used for create comment
 * 
 * @param {string}       props.placeholder   - Input placeholder text
 * @param {string}       [props.defaultValue=""] - Pre-filled value (used when editing)
 * @param {(v: string) => void} props.onSubmit  - Called with the trimmed value on submit
 * @param {() => void}   [props.onCancel]    - Called when Hủy is clicked or Escape pressed
 * @param {boolean}      [props.autoFocus=false]
 */
const CommentInput = ({
  placeholder,
  defaultValue = "",
  onSubmit,
  onCancel,
  autoFocus = false,
}) => {
  const [value, setValue] = useState(defaultValue)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  const handleSubmit = () => {
    if (!value.trim()) return
    onSubmit(value.trim())
    setValue("")
    setIsFocused(false)
    inputRef.current?.blur()
  }

  const handleCancel = () => {
    setValue("")
    setIsFocused(false)
    inputRef.current?.blur()
    onCancel?.()
  }

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false)
    }, 150)
  }

  const showButtons = isFocused || value.trim().length > 0

  return (
    <div className="flex flex-col w-full ">
      {/* Input */}
      <div className="w-full rounded-2xl bg-[#F5F5F5] border-[#E2E2E2] border px-4 py-2.5">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder-[#a0a0a0] text-[#3d3d3d] h-auto"
        />
      </div>

      {/* Action buttons */}
      {showButtons && (
        <div className="flex justify-end items-center mt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCancel}
              className="rounded-full border border-[#990011] px-5 py-1.5 text-xs font-semibold text-[#990011] hover:bg-[#990011]/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSubmit}
              disabled={!value.trim()}
              className="rounded-full bg-[#990011] px-5 py-1.5 text-xs font-semibold text-white hover:brightness-90 active:brightness-75 transition-all"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommentInput
