import React from "react"
import { FiMessageCircle } from "react-icons/fi"

const FloatingButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-cath-red-700 text-white shadow-lg transition hover:scale-105"
      aria-label="Mở tin nhắn"
    >
      <FiMessageCircle className="h-6 w-6" />
    </button>
  )
}

export default FloatingButton
