import Modal from "@/shared/components/ui/Modal"
import Switch from "@/shared/components/ui/inputs/Switch"
import Radio from "@/shared/components/ui/inputs/Radio"
import Slider from "@/shared/components/ui/Slider"
import ListItem from "@/shared/components/ui/ListItem"
import { LayoutGrid } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"

const LOCAL_STORAGE_KEY = "catspeak_video_layout_settings"

// Icons for layout modes
const LayoutIconAuto = () => (
  <div className="flex gap-[2px] w-12 h-8">
    <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[2px]" />
  </div>
)

const LayoutIconGrid = () => (
  <div className="flex flex-col gap-[2px] w-12 h-8">
    <div className="flex gap-[2px] h-1/3">
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
    </div>
    <div className="flex gap-[2px] h-1/3">
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
    </div>
    <div className="flex gap-[2px] h-1/3">
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-1/4 h-full rounded-[1px]" />
    </div>
  </div>
)

const LayoutIconSpotlight = () => (
  <div className="w-12 h-8 bg-gray-300 dark:bg-neutral-600 rounded-[2px]" />
)

const LayoutIconSidebar = () => (
  <div className="flex gap-[2px] w-12 h-8">
    <div className="bg-gray-300 dark:bg-neutral-600 flex-1 h-full rounded-[2px]" />
    <div className="flex flex-col gap-[2px] w-3 h-full">
      <div className="bg-gray-300 dark:bg-neutral-600 w-full h-1/3 rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-full h-1/3 rounded-[1px]" />
      <div className="bg-gray-300 dark:bg-neutral-600 w-full h-1/3 rounded-[1px]" />
    </div>
  </div>
)

const ChooseLayoutModal = ({ open, onClose }) => {
  const { t } = useLanguage()
  const changeLayoutT = t?.rooms?.videoCall?.changeLayout || {}

  const {
    layoutMode,
    setLayoutMode,
    maxTiles,
    setMaxTiles,
    hideEmptyTiles,
    setHideEmptyTiles,
  } = useGlobalVideoCall()

  const handleLayoutChange = (mode) => {
    setLayoutMode(mode)
  }

  const layoutOptions = [
    {
      id: "auto",
      label: changeLayoutT.auto || "Tự động (linh động)",
      icon: <LayoutIconAuto />,
    },
    {
      id: "grid",
      label: changeLayoutT.grid || "Lưới",
      icon: <LayoutIconGrid />,
    },
    {
      id: "spotlight",
      label: changeLayoutT.spotlight || "Tiêu điểm",
      icon: <LayoutIconSpotlight />,
    },
    {
      id: "sidebar",
      label: changeLayoutT.sidebar || "Thanh bên",
      icon: <LayoutIconSidebar />,
    },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={changeLayoutT.title || "Điều chỉnh chế độ xem"}
      className="md:max-w-[380px]"
      bodyClassName="!px-0"
    >
      <div className="flex flex-col text-[#3C4043] dark:text-neutral-200 w-full">
        {/* Layout Modes */}
        <div
          role="radiogroup"
          aria-label={changeLayoutT.title || "Điều chỉnh chế độ xem"}
          className="flex flex-col mb-4"
        >
          {layoutOptions.map((option) => {
            const isSelected = layoutMode === option.id
            return (
              <ListItem
                key={option.id}
                as="div"
                role="radio"
                aria-checked={isSelected}
                selected={isSelected}
                onClick={() => handleLayoutChange(option.id)}
                hoverEffect
                leftContent={<Radio checked={isSelected} />}
                rightContent={
                  <div className="p-1 border border-border dark:border-[#3F3F3F] rounded-md transition-colors group-hover:border-gray-400 dark:group-hover:border-neutral-500">
                    {option.icon}
                  </div>
                }
              >
                {option.label}
              </ListItem>
            )
          })}
        </div>

        {/* Tiles count */}
        <div
          className={`px-4 flex flex-col mb-4 transition-opacity ${
            layoutMode !== "grid" && layoutMode !== "auto"
              ? "opacity-50 pointer-events-none"
              : ""
          }`}
        >
          <div className="flex flex-col mb-2">
            <span className="text-base font-medium">
              {changeLayoutT.tilesLabel || "Số ô"}
            </span>
            <span className="text-sm text-secondary dark:text-[#AAAAAA]">
              {changeLayoutT.tilesDescription ||
                "Số ô tối đa được hiển thị, tùy vào kích thước cửa sổ."}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <LayoutGrid
              size={24}
              className="text-gray-600 dark:text-neutral-400 shrink-0"
            />
            <div className="flex-1 px-2">
              <Slider
                value={maxTiles}
                min={4}
                max={49}
                step={1}
                onChange={(e) => setMaxTiles(Number(e.target.value))}
              />
            </div>
            <span className="text-base font-medium min-w-[28px] text-right shrink-0">
              {maxTiles}
            </span>
          </div>
        </div>

        {/* Hide empty tiles */}
        <ListItem
          as="div"
          onClick={() => setHideEmptyTiles(!hideEmptyTiles)}
          hoverEffect
          rightContent={
            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={hideEmptyTiles}
                onChange={(e) => setHideEmptyTiles(e.target.checked)}
                colorClass="peer-checked:bg-cath-red-700 dark:peer-checked:bg-cath-red-1000"
              />
            </div>
          }
        >
          <span>{changeLayoutT.hideNonVideo || "Ẩn ô không có video"}</span>
        </ListItem>
      </div>
    </Modal>
  )
}

export default ChooseLayoutModal
