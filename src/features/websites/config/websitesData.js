import {
  BookOpenCheckIcon,
  Newspaper,
  LaptopMinimal,
  BookOpenCheck,
  LibraryBig,
  Headphones,
  NotebookPen,
  Puzzle,
  MicVocal,
  Baby,
  BookOpenText,
  Library,
  Languages,
  Gamepad2,
} from "lucide-react"
import {
  RESOURCE_CATEGORY_META,
  WEBSITE_GROUPS,
  getWebsiteCount,
} from "./websitesCatalog"

const ICONS = {
  BookOpenCheckIcon,
  Newspaper,
  LaptopMinimal,
  BookOpenCheck,
  LibraryBig,
  Headphones,
  NotebookPen,
  Puzzle,
  MicVocal,
  Baby,
  BookOpenText,
  Library,
  Languages,
  Gamepad2,
}

const resolveIcon = (iconKey) => (iconKey ? ICONS[iconKey] : undefined)

export const RESOURCE_CATEGORIES = Object.fromEntries(
  Object.entries(RESOURCE_CATEGORY_META).map(([key, meta]) => [
    key,
    { ...meta, icon: resolveIcon(meta.iconKey) },
  ]),
)

export const websites = WEBSITE_GROUPS.map((group) => ({
  ...group,
  icon: resolveIcon(group.iconKey),
}))

export { getWebsiteCount }
