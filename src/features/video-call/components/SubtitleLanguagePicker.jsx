import React, { useRef, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { VietNam, China, UK, Japan, USA } from "@/shared/assets/icons/flags"
import Radio from "@/shared/components/ui/inputs/Radio"
import MenuItem from "@/shared/components/ui/MenuItem"
import ListItem from "@/shared/components/ui/ListItem"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import useMediaQuery from "@/shared/hooks/useMediaQuery"

export const LANGUAGE_FLAGS = {
  vi: VietNam,
  zh: China,
  en: UK,
  ja: Japan,
  "en-US": USA,
  "en-GB": UK,
  "zh-CN": China,
}

export const getLanguageFlag = (lang) => {
  if (!lang) return null
  if (LANGUAGE_FLAGS[lang]) return LANGUAGE_FLAGS[lang]
  const prefix = lang.split("-")[0]?.toLowerCase()
  return LANGUAGE_FLAGS[prefix] || null
}

/**
 * Language selection popover.
 *
 * @param {string[]}       languages        — ordered list of supported language codes
 * @param {string|null}    selectedLanguage — currently highlighted language (null = none)
 * @param {(lang) => void} onSelect         — called with the chosen language code
 * @param {string}         [label]          — header text inside the popover
 * @param {() => void}     [onClose]        — called when user clicks outside
 * @param {() => void}     [onBack]         — called when the back button is clicked (replaces label)
 * @param {string}         [backLabel]      — text for the back button
 * @param {Record<string,string>} [languageNames] — localized display names per language code
 */
const SubtitleLanguagePicker = ({
  languages = [],
  selectedLanguage,
  onSelect,
  label = "Select language",
  onClose,
  onBack,
  backLabel = "Back",
  languageNames,
  className = "w-full rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white shadow-lg",
}) => {
  const ref = useRef(null)
  const isMobile = useMediaQuery("(max-width: 767px)")

  // Close on outside click
  useEffect(() => {
    if (!onClose) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  const headerTitle = label || backLabel || "Language"

  const renderItem = ({
    key,
    icon,
    label: itemLabel,
    isSelected,
    onClick,
    isLast,
  }) => {
    if (isMobile) {
      return (
        <ListItem
          key={key}
          onClick={onClick}
          selected={isSelected}
          hoverEffect={true}
          leftContent={icon}
          rightContent={<Radio checked={isSelected} />}
          className="w-full h-12 min-h-[48px]"
          contentClassName="px-4"
        >
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {itemLabel}
          </span>
        </ListItem>
      )
    }

    return (
      <MenuItem
        key={key}
        icon={icon}
        label={itemLabel}
        isSelected={isSelected}
        rightContent={<Radio checked={isSelected} />}
        onClick={onClick}
        isFirst={false}
        isLast={isLast}
      />
    )
  }

  return (
    <div ref={ref} className={className}>
      <div className="flex flex-col w-full">
        {/* Mobile Top Navigation Header */}
        <div className="flex md:hidden items-center gap-1 border-b border-[#F0F0F0] dark:border-[#3F3F3F] h-[56px] px-1 text-gray-800 dark:text-white">
          {onBack && (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onBack}
              title={backLabel}
            >
              <ArrowLeft />
            </IconButton>
          )}
          <span className="text-xl font-bold truncate">
            {headerTitle}
          </span>
        </div>

        {/* Desktop Header */}
        {onBack ? (
          <div className="hidden md:block border-b border-border dark:border-[#3F3F3F] pt-[2px] pb-[2px]">
            <MenuItem
              icon={<ArrowLeft />}
              label={
                <span className="font-semibold text-gray-900 dark:text-white">
                  {headerTitle}
                </span>
              }
              onClick={onBack}
              roundedClass="group-first:rounded-t-xl rounded-b"
            />
          </div>
        ) : label ? (
          <div className="hidden md:block border-b border-border dark:border-[#3F3F3F] px-4 py-2.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {label}
            </span>
          </div>
        ) : null}

        {/* Language Options List */}
        <div className="flex flex-col w-full py-[2px]">
          {languages?.map((lang, index) => {
            const isSelected = selectedLanguage === lang
            const flag = getLanguageFlag(lang)
            const displayName = languageNames?.[lang] ?? lang

            return renderItem({
              key: lang,
              icon: flag ? (
                <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border dark:border-[#3F3F3F]">
                  <img
                    src={flag}
                    alt={displayName}
                    className="block h-full w-full object-cover"
                    draggable={false}
                  />
                </span>
              ) : undefined,
              label: displayName,
              isSelected,
              onClick: () => onSelect(lang),
              isLast: index === languages.length - 1,
            })
          })}
        </div>
      </div>
    </div>
  )
}

export default SubtitleLanguagePicker
