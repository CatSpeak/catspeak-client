import React from "react"
import { Send } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"

/**
 * Shared input bar for creating stories.
 *
 * @param {Object} props
 * @param {string} props.inputValue
 * @param {(e: React.ChangeEvent) => void} props.onChange
 * @param {() => void} props.onSend
 * @param {number} props.myCount
 * @param {number} props.totalCount
 */
const StoryInputBar = ({
  inputValue,
  onChange,
  onSend,
  myCount,
  totalCount,
}) => {
  const { t } = useLanguage()

  return (
    <div className="mb-2 flex flex-col md:flex-row items-center justify-between gap-3 px-1 pt-1 -mx-1 -mt-1">
      <div className="flex w-full items-start gap-2">
        <TextInput
          value={inputValue}
          onChange={onChange}
          maxLength={200}
          placeholder={t.catSpeak.mail.placeholder}
          containerClassName="flex-1 md:w-72 md:flex-none"
          className="!border-[#c38300]/70 focus:!border-[#990011] focus:!ring-[#990011] hover:!border-[#990011]"
          showCount
        />
        <button
          type="button"
          onClick={onSend}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#990011] transition hover:scale-105 hover:bg-[#990011]/10"
          aria-label="Send message"
        >
          <Send />
        </button>
      </div>

      <div className="shrink-0 text-sm whitespace-nowrap text-[#7A7574]">
        <span className="font-semibold">{myCount}</span>{" "}
        {t.catSpeak.mail.yours} |{" "}
        <span className="font-semibold">{totalCount}</span>{" "}
        {t.catSpeak.mail.total}
      </div>
    </div>
  )
}

export default StoryInputBar
