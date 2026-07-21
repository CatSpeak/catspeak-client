import Modal from "@/shared/components/ui/Modal";
import Switch from "@/shared/components/ui/inputs/Switch";
import Slider from "@/shared/components/ui/Slider";
import { Sparkles, LayoutGrid } from "lucide-react";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";

const LOCAL_STORAGE_KEY = "catspeak_video_layout_settings";

// Icons for layout modes
const LayoutIconAuto = () => (
  <div className="flex gap-[2px] w-12 h-8">
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
  </div>
);

const LayoutIconGrid = () => (
  <div className="flex flex-col gap-[2px] w-12 h-8">
    <div className="flex gap-[2px] h-1/3">
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
    </div>
    <div className="flex gap-[2px] h-1/3">
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
    </div>
    <div className="flex gap-[2px] h-1/3">
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
      <div className="bg-gray-300 w-1/4 h-full rounded-[1px]" />
    </div>
  </div>
);

const LayoutIconSpotlight = () => (
  <div className="w-12 h-8 bg-gray-300 rounded-[2px]" />
);

const LayoutIconSidebar = () => (
  <div className="flex gap-[2px] w-12 h-8">
    <div className="bg-gray-300 flex-1 h-full rounded-[2px]" />
    <div className="flex flex-col gap-[2px] w-3 h-full">
      <div className="bg-gray-300 w-full h-1/3 rounded-[1px]" />
      <div className="bg-gray-300 w-full h-1/3 rounded-[1px]" />
      <div className="bg-gray-300 w-full h-1/3 rounded-[1px]" />
    </div>
  </div>
);

const ChooseLayoutModal = ({ open, onClose }) => {
  const {
    layoutMode,
    setLayoutMode,
    maxTiles,
    setMaxTiles,
    hideEmptyTiles,
    setHideEmptyTiles,
  } = useGlobalVideoCall();

  const handleLayoutChange = (mode) => {
    setLayoutMode(mode);
  };

  return (
    <Modal open={open} onClose={onClose} title="Điều chỉnh chế độ xem" className="md:max-w-[380px]">
      <div className="flex flex-col text-[#3C4043] p-1 pb-4 w-full">
        {/* Layout Modes */}
        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="layoutMode"
                value="auto"
                checked={layoutMode === "auto"}
                onChange={() => handleLayoutChange("auto")}
                className="w-5 h-5 accent-[#1A73E8]"
              />
              <span className="text-[15px] flex items-center gap-2">
                Tự động (linh động) <Sparkles size={16} className="text-[#3C4043]" />
              </span>
            </div>
            <div className={`p-1.5 border rounded-md transition-colors ${layoutMode === "auto" ? "border-[#1A73E8] bg-[#E8F0FE]/50" : "border-gray-200 group-hover:border-gray-300"}`}>
              <LayoutIconAuto />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="layoutMode"
                value="grid"
                checked={layoutMode === "grid"}
                onChange={() => handleLayoutChange("grid")}
                className="w-5 h-5 accent-[#1A73E8]"
              />
              <span className="text-[15px]">Lưới</span>
            </div>
            <div className={`p-1.5 border rounded-md transition-colors ${layoutMode === "grid" ? "border-[#1A73E8] bg-[#E8F0FE]/50" : "border-gray-200 group-hover:border-gray-300"}`}>
              <LayoutIconGrid />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="layoutMode"
                value="spotlight"
                checked={layoutMode === "spotlight"}
                onChange={() => handleLayoutChange("spotlight")}
                className="w-5 h-5 accent-[#1A73E8]"
              />
              <span className="text-[15px]">Tiêu điểm</span>
            </div>
            <div className={`p-1.5 border rounded-md transition-colors ${layoutMode === "spotlight" ? "border-[#1A73E8] bg-[#E8F0FE]/50" : "border-gray-200 group-hover:border-gray-300"}`}>
              <LayoutIconSpotlight />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="layoutMode"
                value="sidebar"
                checked={layoutMode === "sidebar"}
                onChange={() => handleLayoutChange("sidebar")}
                className="w-5 h-5 accent-[#1A73E8]"
              />
              <span className="text-[15px]">Thanh bên</span>
            </div>
            <div className={`p-1.5 border rounded-md transition-colors ${layoutMode === "sidebar" ? "border-[#1A73E8] bg-[#E8F0FE]/50" : "border-gray-200 group-hover:border-gray-300"}`}>
              <LayoutIconSidebar />
            </div>
          </label>
        </div>

        {/* Tiles count */}
        <div className={`flex flex-col mb-4 transition-opacity ${layoutMode !== 'grid' && layoutMode !== 'auto' ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Số ô</span>
              <span className="text-xs text-gray-500">
                Số ô tối đa được hiển thị, tùy vào kích thước cửa sổ.
              </span>
            </div>
            <span className="text-base font-semibold text-[#1A73E8] bg-blue-50 px-2 py-0.5 rounded-md min-w-[32px] text-center">{maxTiles}</span>
          </div>
          <div className="flex items-center gap-4">
            <LayoutGrid size={24} className="text-gray-600" />
            <div className="flex-1 px-2">
              <Slider
                value={maxTiles}
                min={4}
                max={49}
                step={1}
                onChange={(e) => setMaxTiles(Number(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-600 rounded-[1px]" />
              ))}
            </div>
          </div>
        </div>

        {/* Hide empty tiles */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium">Ẩn ô không có video</span>
          <Switch
            checked={hideEmptyTiles}
            onChange={(e) => setHideEmptyTiles(e.target.checked)}
            colorClass="peer-checked:bg-[#1A73E8]"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ChooseLayoutModal;