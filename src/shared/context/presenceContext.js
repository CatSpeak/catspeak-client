import { createContext, useContext } from "react"

export const GlobalPresenceContext = createContext(undefined)

export const useGlobalPresence = () => {
  const context = useContext(GlobalPresenceContext)
  if (context === undefined) {
    throw new Error(
      "useGlobalPresence must be used within a GlobalPresenceProvider",
    )
  }
  return context
}
