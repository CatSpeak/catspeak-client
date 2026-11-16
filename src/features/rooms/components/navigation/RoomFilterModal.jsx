import React, { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom"
import { SlidersHorizontal } from "lucide-react"
import { TOPICS, LEVELS } from "../../config/constants"
import Modal from "@/shared/components/ui/Modal"
import ChipFilter from "@/shared/components/ChipFilter"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const CATEGORIES = [
  {
    key: "Knowledge",
    labelKey: "knowledge",
    defaultLabel: "Learn something new",
  },
  {
    key: "Culture",
    labelKey: "culture",
    defaultLabel: "Explore culture and creativity",
  },
  {
    key: "Lifestyle",
    labelKey: "lifestyle",
    defaultLabel: "Enjoy everyday life",
  },
  { key: "Growth", labelKey: "growth", defaultLabel: "Build your future" },
  { key: "Other", labelKey: "other", defaultLabel: "Anything & Everything" },
]

const RoomFilterModal = ({ open, onClose }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [localTopics, setLocalTopics] = useState([])
  const [localLevels, setLocalLevels] = useState([])
  const [localCategories, setLocalCategories] = useState([])

  // Sync state from URL when modal opens
  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setLocalTopics(searchParams.getAll("topics"))
        setLocalLevels(searchParams.getAll("requiredLevels"))
        const catsParam = searchParams.get("categories")
        const parsedCats = catsParam
          ? catsParam
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : []
        setLocalCategories(parsedCats)
      })
    }
  }, [open, searchParams])

  // Map levels based on current language
  const langMap = {
    en: "English",
    zh: "Chinese",
    vi: "Vietnamese",
    ja: "Japanese",
  }
  const currentLanguage = lang ? langMap[lang] : "English"

  const baseLevels = LEVELS[currentLanguage] || LEVELS.English
  const additionalLevels = [
    {
      label: t.rooms?.filters?.levels?.beginner || "Beginner",
      value: "Beginner",
    },
    {
      label: t.rooms?.filters?.levels?.intermediate || "Intermediate",
      value: "Intermediate",
    },
    {
      label: t.rooms?.filters?.levels?.advanced || "Advanced",
      value: "Advanced",
    },
  ]
  const currentLevels = useMemo(
    () => [
      ...baseLevels,
      ...additionalLevels.filter(
        (level) => !baseLevels.some((bl) => bl.value === level.value),
      ),
    ],
    [baseLevels, additionalLevels],
  )

  const categoryItems = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        key: cat.key,
        label: t.rooms?.filters?.categories?.[cat.labelKey] || cat.defaultLabel,
      })),
    [t],
  )

  const levelItems = useMemo(
    () =>
      currentLevels.map((lvl) => ({
        key: lvl.value,
        label: lvl.labelKey
          ? t.rooms?.filters?.levels?.[lvl.labelKey] || lvl.label
          : lvl.label,
      })),
    [currentLevels, t],
  )

  const topicItems = useMemo(
    () =>
      TOPICS.map((topic) => ({
        key: topic,
        label: t.rooms?.filters?.topics?.[topic.toLowerCase()] || topic,
      })),
    [t],
  )

  const toggleCategory = (catKey) => {
    setLocalCategories((prev) =>
      prev.includes(catKey)
        ? prev.filter((c) => c !== catKey)
        : [...prev, catKey],
    )
  }

  const toggleTopic = (topic) => {
    setLocalTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    )
  }

  const toggleLevel = (level) => {
    setLocalLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    )
  }

  const handleApply = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("topics")
    newParams.delete("requiredLevels")
    newParams.delete("categories")

    localTopics.forEach((t) => newParams.append("topics", t))
    localLevels.forEach((l) => newParams.append("requiredLevels", l))
    if (localCategories.length > 0) {
      newParams.set("categories", localCategories.join(","))
    }

    if (
      localTopics.length > 0 ||
      localLevels.length > 0 ||
      localCategories.length > 0
    ) {
      newParams.set("page", "1")
    }

    const communityPath = `/${lang || "en"}/community`
    if (!location.pathname.startsWith(communityPath)) {
      navigate(`${communityPath}?${newParams.toString()}`)
    } else {
      setSearchParams(newParams, { preventScrollReset: true })
    }

    onClose()
  }

  const handleClear = () => {
    setLocalTopics([])
    setLocalLevels([])
    setLocalCategories([])
  }

  const totalSelected =
    localTopics.length + localLevels.length + localCategories.length

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={true}
      className="md:max-w-2xl md:max-h-[85vh] rounded-none md:rounded-xl"
      headerClassName="flex items-center justify-between p-4"
      title={t.rooms?.filters?.title || "Bộ lọc"}
      bodyClassName="px-4 flex-1 overflow-y-auto space-y-4 scrollbar-app"
      footerClassName="p-4 bg-gray-50/80 dark:bg-[#1A1A1A] shrink-0"
      footer={
        <div className="flex items-center gap-2 w-full sm:justify-end">
          <PillButton
            variant="secondary"
            onClick={handleClear}
            className="flex-1 sm:flex-initial sm:min-w-[100px]"
          >
            <span>{t.rooms?.filters?.clear || "Xóa tất cả"}</span>
          </PillButton>

          <PillButton
            variant="primary"
            onClick={handleApply}
            className="flex-1 sm:flex-initial"
          >
            <span>
              {t.rooms?.filters?.apply || "Áp dụng"}
              {totalSelected > 0 && ` (${totalSelected})`}
            </span>
          </PillButton>
        </div>
      }
    >
      {/* Categories Section */}
      <section>
        <h3 className="text-xs text-secondary dark:text-white mb-2">
          {t.rooms?.filters?.categoryLabel ||
            t.rooms?.filters?.categoriesHeading ||
            "Danh mục"}
        </h3>
        <ChipFilter
          items={categoryItems}
          value={localCategories}
          onChange={toggleCategory}
          wrap={true}
          selectedVariant="contrast"
        />
      </section>

      {/* Levels Section */}
      <section>
        <h3 className="text-xs text-secondary dark:text-white mb-2">
          {t.rooms?.filters?.levelsHeading || "Trình độ"}
        </h3>
        <ChipFilter
          items={levelItems}
          value={localLevels}
          onChange={toggleLevel}
          wrap={true}
          selectedVariant="contrast"
        />
      </section>

      {/* Topics Section */}
      <section>
        <h3 className="text-xs text-secondary dark:text-white mb-2">
          {t.rooms?.filters?.topicsHeading || "Chủ đề"}
        </h3>
        <ChipFilter
          items={topicItems}
          value={localTopics}
          onChange={toggleTopic}
          wrap={true}
          selectedVariant="contrast"
        />
      </section>
    </Modal>
  )
}

export default RoomFilterModal
