import { useContext } from "react"
import InChatCallContext from "./InChatCallContext"

export const useInChatCallContext = () => {
  const context = useContext(InChatCallContext)
  if (!context) {
    throw new Error(
      "useInChatCallContext must be used within an InChatCallProvider",
    )
  }
  return context
}

export default useInChatCallContext
