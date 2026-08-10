import { Layers, Sparkles } from "lucide-react"

export const AI_MODES = [
  {
    id: "room-context",
    label: "Room Context",
    shortLabel: "Room Context",
    description: "Answers using meeting transcripts",
    icon: Layers,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  },
]

export const getAiModeConfig = (modeId) =>
  AI_MODES.find((m) => m.id === modeId) || null
