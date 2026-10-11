import { useState, useMemo, useCallback } from "react"
import { useGetConversationMembersQuery } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Custom hook for @mentions autocomplete in chat input.
 * Handles fetching group members, querying @filter, keyboard navigation (Up/Down/Enter/Tab/Esc),
 * and inserting mention tokens with cursor preservation.
 *
 * @param {object} params
 * @param {string} params.value - Current input text
 * @param {Function} params.onChange - Callback to update input text
 * @param {string|number|null} params.conversationId - Active conversation ID
 * @param {boolean} params.isGroup - Whether active conversation is a group
 * @param {Array} params.participants - Fallback participants array
 * @param {React.RefObject} params.textareaRef - Ref to the input textarea
 */
export default function useMentionAutocomplete({
  value,
  onChange,
  conversationId,
  isGroup,
  participants = [],
  textareaRef,
}) {
  const { t } = useLanguage()

  const [mentionQuery, setMentionQuery] = useState(null)
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0)
  const [mentionedAccountIds, setMentionedAccountIds] = useState([])

  const { data: membersResponse = [] } = useGetConversationMembersQuery(
    conversationId,
    { skip: !conversationId || !isGroup },
  )

  const activeMembers = useMemo(() => {
    const list = Array.isArray(membersResponse)
      ? membersResponse
      : membersResponse?.data || []
    return list.length > 0 ? list : participants
  }, [membersResponse, participants])

  const mentionItems = useMemo(() => {
    if (mentionQuery === null) return []
    const list = []
    const cleanQ = (mentionQuery || "").toLowerCase()
    if (
      isGroup &&
      (!cleanQ || "all".includes(cleanQ) || "tatca".includes(cleanQ))
    ) {
      list.push({
        isAll: true,
        accountId: 0,
        username: "all",
        fullName: t?.chat?.mentions?.allMembers || "All members (@all)",
      })
    }
    const cleanQTrim = cleanQ.trim()
    activeMembers.forEach((m) => {
      const uName = (m.username || "").toLowerCase()
      const fName = (m.fullName || m.name || "").toLowerCase()
      if (
        !cleanQTrim ||
        uName.includes(cleanQTrim) ||
        fName.includes(cleanQTrim)
      ) {
        list.push(m)
      }
    })
    return list
  }, [activeMembers, mentionQuery, isGroup, t])

  const handleSelectMention = useCallback(
    (item) => {
      if (!item || mentionStartIndex < 0) return
      const before = value.slice(0, mentionStartIndex)
      const mentionText = `@${item.username || "all"} `
      const cursorPos = textareaRef.current?.selectionStart ?? value.length
      const after = value.slice(cursorPos)
      const newValue = `${before}${mentionText}${after}`
      onChange(newValue)

      if (!item.isAll && item.accountId) {
        setMentionedAccountIds((prev) =>
          prev.includes(item.accountId) ? prev : [...prev, item.accountId],
        )
      }

      setMentionQuery(null)
      setMentionStartIndex(-1)
      setMentionSelectedIndex(0)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newPos = before.length + mentionText.length
          textareaRef.current.setSelectionRange(newPos, newPos)
        }
      }, 0)
    },
    [value, mentionStartIndex, onChange, textareaRef],
  )

  /**
   * Detects @mentions trigger from input text and cursor position.
   */
  const checkMentionTrigger = useCallback((val, cursorPos) => {
    const textBeforeCursor = val.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_\-À-ỹ]*)$/)
    if (atMatch) {
      const query = atMatch[1]
      const atPos = textBeforeCursor.lastIndexOf("@")
      setMentionQuery(query)
      setMentionStartIndex(atPos)
      setMentionSelectedIndex(0)
    } else {
      setMentionQuery(null)
      setMentionStartIndex(-1)
    }
  }, [])

  /**
   * Handles keyboard navigation inside mention autocomplete dropdown.
   * Returns true if event was handled (intercepted), false otherwise.
   */
  const handleMentionKeyDown = useCallback(
    (e) => {
      if (mentionQuery === null || mentionItems.length === 0) {
        return false
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setMentionSelectedIndex((prev) => (prev + 1) % mentionItems.length)
        return true
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setMentionSelectedIndex(
          (prev) => (prev - 1 + mentionItems.length) % mentionItems.length,
        )
        return true
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        const chosen = mentionItems[mentionSelectedIndex] || mentionItems[0]
        if (chosen) {
          handleSelectMention(chosen)
        }
        return true
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setMentionQuery(null)
        setMentionStartIndex(-1)
        return true
      }

      return false
    },
    [mentionQuery, mentionItems, mentionSelectedIndex, handleSelectMention],
  )

  const resetMentions = useCallback(() => {
    setMentionedAccountIds([])
    setMentionQuery(null)
    setMentionStartIndex(-1)
    setMentionSelectedIndex(0)
  }, [])

  return {
    mentionQuery,
    mentionItems,
    mentionSelectedIndex,
    mentionedAccountIds,
    handleSelectMention,
    checkMentionTrigger,
    handleMentionKeyDown,
    resetMentions,
  }
}
