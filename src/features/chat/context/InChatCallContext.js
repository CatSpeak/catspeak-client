import { createContext } from "react"

export const InChatCallContext = createContext(null)

export { default as useInChatCallContext } from "./useInChatCallContext"

export default InChatCallContext
