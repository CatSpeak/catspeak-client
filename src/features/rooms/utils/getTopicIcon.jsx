import React from "react"
import { Landmark, FlaskConical, Brain, Scale, Rocket, Film, Music, Palette, Shirt, Globe, Book, Plane, Utensils, TreePine, Heart, Trophy, Coins, Briefcase, Target, Hash } from "lucide-react"

export const TOPIC_LIST = [
  { key: "history",       match: (t) => t.includes("history"),            Icon: Landmark },
  { key: "science",       match: (t) => t.includes("science"),            Icon: FlaskConical },
  { key: "philosophy",    match: (t) => t.includes("philosophy") || t.includes("psychology"), Icon: Brain },
  { key: "politics",      match: (t) => t.includes("politics"),          Icon: Scale },
  { key: "space",         match: (t) => t.includes("space"),              Icon: Rocket },
  { key: "movies",        match: (t) => t.includes("movie"),              Icon: Film },
  { key: "music",         match: (t) => t.includes("music"),              Icon: Music },
  { key: "art",           match: (t) => t.includes("art"),                Icon: Palette },
  { key: "fashion",       match: (t) => t.includes("fashion"),            Icon: Shirt },
  { key: "culture",       match: (t) => t.includes("culture"),            Icon: Globe },
  { key: "books",         match: (t) => t.includes("book"),               Icon: Book },
  { key: "travel",        match: (t) => t.includes("travel") || t.includes("place"), Icon: Plane },
  { key: "food",          match: (t) => t.includes("food"),               Icon: Utensils },
  { key: "nature",        match: (t) => t.includes("nature") || t.includes("pet"), Icon: TreePine },
  { key: "relationships", match: (t) => t.includes("relationship"),       Icon: Heart },
  { key: "sports",        match: (t) => t.includes("sport") || t.includes("game"), Icon: Trophy },
  { key: "finance",       match: (t) => t.includes("finance"),            Icon: Coins },
  { key: "startups",      match: (t) => t.includes("startup"),            Icon: Briefcase },
  { key: "productivity",  match: (t) => t.includes("productivity"),       Icon: Target },
]

/**
 * Resolve a topic string to its icon + i18n key.
 * Returns { Icon, topicKey } so callers can render `<Icon />` and show
 * `t.rooms.topics[topicKey]` as a tooltip.
 */
export const getTopicMeta = (topic) => {
  if (!topic) return { Icon: Hash, topicKey: "other" }
  const lower = topic.toLowerCase()
  const found = TOPIC_LIST.find((entry) => entry.match(lower))
  if (found) return { Icon: found.Icon, topicKey: found.key }
  return { Icon: Hash, topicKey: "other" }
}

// Backward-compatible JSX helper — renders the icon directly.
export const getTopicIcon = (topic) => {
  const { Icon } = getTopicMeta(topic)
  return <Icon size={14} className="text-white" />
}
