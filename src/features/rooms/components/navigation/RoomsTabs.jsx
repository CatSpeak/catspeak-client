import React from "react"
import { MessageCircle, Monitor, Users, Layers } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { motion } from "framer-motion"

const RoomsTabs = ({ tab, setTab }) => {
  const { t } = useLanguage()

  const tabs = [
    { value: "communicate", label: t.rooms.tabs.community },
    { value: "teachers", label: t.rooms.tabs.teachers },
    { value: "forum", label: t.rooms.tabs.forum },
  ]

  return (
    <div className="flex items-center gap-8 mb-6 ">
      {tabs.map((tItem) => {
        const isSelected = tab === tItem.value
        return (
          <button
            key={tItem.value}
            onClick={() => setTab(tItem.value)}
            className={`relative pb-3 font-nunito px-6 text-lg transition-colors ${
              isSelected
                ? "text-cath-red-700 font-semibold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tItem.label}
            {isSelected && (
              <motion.div
                layoutId="rooms-active-tab-border"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-cath-red-700"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default RoomsTabs
