import { useContext } from "react"
import ConversationSignalRContext from "./ConversationSignalRContext"

export const useConversationSignalRContext = () => {
  return useContext(ConversationSignalRContext)
}

export default useConversationSignalRContext
