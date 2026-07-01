import React from "react"
import { Landmark, FlaskConical, Brain, Scale, Rocket, Film, Music, Palette, Shirt, Globe, Book, Plane, Utensils, TreePine, Heart, Trophy, Coins, Briefcase, Target, Hash } from "lucide-react"

export const getTopicIcon = (topic) => {
  if (!topic) return <Hash size={14} className="text-white" />
  
  const t = topic.toLowerCase()
  if (t.includes('history')) return <Landmark size={14} className="text-white" />
  if (t.includes('science')) return <FlaskConical size={14} className="text-white" />
  if (t.includes('philosophy') || t.includes('psychology')) return <Brain size={14} className="text-white" />
  if (t.includes('politics')) return <Scale size={14} className="text-white" />
  if (t.includes('space')) return <Rocket size={14} className="text-white" />
  if (t.includes('movie')) return <Film size={14} className="text-white" />
  if (t.includes('music')) return <Music size={14} className="text-white" />
  if (t.includes('art')) return <Palette size={14} className="text-white" />
  if (t.includes('fashion')) return <Shirt size={14} className="text-white" />
  if (t.includes('culture')) return <Globe size={14} className="text-white" />
  if (t.includes('book')) return <Book size={14} className="text-white" />
  if (t.includes('travel') || t.includes('place')) return <Plane size={14} className="text-white" />
  if (t.includes('food')) return <Utensils size={14} className="text-white" />
  if (t.includes('nature') || t.includes('pet')) return <TreePine size={14} className="text-white" />
  if (t.includes('relationship')) return <Heart size={14} className="text-white" />
  if (t.includes('sport') || t.includes('game')) return <Trophy size={14} className="text-white" />
  if (t.includes('finance')) return <Coins size={14} className="text-white" />
  if (t.includes('startup')) return <Briefcase size={14} className="text-white" />
  if (t.includes('productivity')) return <Target size={14} className="text-white" />
  
  return <Hash size={14} className="text-white" />
}
