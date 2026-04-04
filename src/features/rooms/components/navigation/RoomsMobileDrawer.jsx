import React from "react"
import { X } from "lucide-react"
import useScrollLock from "@/shared/hooks/useScrollLock"

const RoomsMobileDrawer = ({ isOpen, onClose, title, children }) => {
  useScrollLock(isOpen)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1300] bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-[1301] h-full w-full sm:w-[320px] bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[56px] items-center justify-between border-b border-gray-200 px-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100vh-56px)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  )
}

export default RoomsMobileDrawer
