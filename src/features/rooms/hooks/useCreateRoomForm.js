import { useState } from "react"
import { useCreateRoomMutation } from "@/store/api/roomsApi"

const INITIAL_STATE = {
  mode: "join",
  name: "",
  topics: [],
  selectedLevel: "",
  isPrivate: false,
  password: "",
  thumbnail: null
}

export const useCreateRoomForm = () => {
  const [formData, setFormData] = useState(INITIAL_STATE)
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation()

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(INITIAL_STATE)
  }

  const switchMode = (newMode) => {
    setFormData({
      ...INITIAL_STATE,
      mode: newMode
    })
  }

  const handleTopicChange = (event) => {
    const newValue = event.target ? event.target.value : event
    const maxLimit = 3
    if (Array.isArray(newValue) && newValue.length <= maxLimit) {
      handleChange("topics", newValue)
    }
  }

  return {
    formData,
    handleChange,
    handleTopicChange,
    resetForm,
    switchMode,
    createRoom,
    isCreating
  }
}
