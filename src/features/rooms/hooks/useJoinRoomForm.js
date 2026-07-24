import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

const getLanguageName = (langCode) => {
  switch (langCode) {
    case "zh":
      return "Chinese"
    case "vi":
      return "Vietnamese"
    case "en":
      return "English"
    default:
      return "English"
  }
}

export const useJoinRoomForm = () => {
  const [topics, setTopics] = useState([])
  const [selectedLevel, setSelectedLevel] = useState("")

  const navigate = useNavigate()
  const { lang } = useParams()

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  const handleTopicChange = (e) => {
    const value = e.target ? e.target.value : e
    if (Array.isArray(value) && value.length <= 3) {
      setTopics(value)
    }
  }

  const resetForm = () => {
    setTopics([])
    setSelectedLevel("")
  }

  const submitJoin = (onSuccess) => {
    if (!selectedLanguage) return
    const preferences = {
      roomType: "Group",
      topics: topics.length > 0 ? topics : [],
      languageType: selectedLanguage,
      requiredLevel: selectedLevel || undefined,
    }
    if (onSuccess) onSuccess()
    navigate("/queue", { state: preferences })
  }

  const isJoinDisabled = !selectedLanguage

  return {
    topics,
    selectedLevel,
    setSelectedLevel,
    handleTopicChange,
    resetForm,
    submitJoin,
    isJoinDisabled,
    selectedLanguage,
  }
}
