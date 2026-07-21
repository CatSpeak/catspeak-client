import React from "react"
import ConversationItem from "./ConversationItem"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { useLanguage } from "@/shared/context/LanguageContext"

const ConversationList = ({
  conversations,
  currentUser,
  isLoading,
  isError,
  onSelectConversation,
}) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-cath-red-700">
        {isLoading ? (
          <LoadingSpinner className="flex items-center justify-center py-4" />
        ) : isError ? (
          <ErrorMessage message={t?.messages?.error || "Error loading data"} className="py-4" />
        ) : conversations.length === 0 ? (
          <EmptyState message={t?.messages?.noMessages || "No messages yet"} className="py-4" />
        ) : (
          <div className="flex flex-col gap-1 p-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.conversationId}
                conversation={conv}
                currentUser={currentUser}
                onClick={() => onSelectConversation(conv)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList
