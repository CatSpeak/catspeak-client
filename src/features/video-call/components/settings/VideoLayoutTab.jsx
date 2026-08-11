import React from "react"
import { Sparkles, LayoutGrid } from "lucide-react"
import Switch from "@/shared/components/ui/inputs/Switch"
import Slider from "@/shared/components/ui/Slider"
import {
  LayoutIconAuto,
  LayoutIconGrid,
  LayoutIconSpotlight,
  LayoutIconSidebar,
} from "./LayoutIcons"

const VideoLayoutTab = ({
  changeLayoutT = {},
  layoutMode = "auto",
  setLayoutMode,
  maxTiles = 16,
  setMaxTiles,
  hideEmptyTiles = false,
  setHideEmptyTiles,
}) => {
  return (
    <div className="flex flex-col text-[#3C4043]">
      <div className="flex flex-col gap-3 mb-6">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="roomLayoutMode"
              value="auto"
              checked={layoutMode === "auto"}
              onChange={() => setLayoutMode?.("auto")}
              className="w-5 h-5 accent-[#1A73E8]"
            />
            <span className="text-[15px] flex items-center gap-2 font-medium">
              {changeLayoutT.auto || "Tự động (linh động)"}{" "}
              <Sparkles size={16} className="text-[#3C4043]" />
            </span>
          </div>
          <div
            className={`p-1.5 border rounded-md transition-colors ${
              layoutMode === "auto"
                ? "border-[#1A73E8] bg-[#E8F0FE]/50"
                : "border-border group-hover:border-gray-300"
            }`}
          >
            <LayoutIconAuto />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="roomLayoutMode"
              value="grid"
              checked={layoutMode === "grid"}
              onChange={() => setLayoutMode?.("grid")}
              className="w-5 h-5 accent-[#1A73E8]"
            />
            <span className="text-[15px] font-medium">
              {changeLayoutT.grid || "Lưới"}
            </span>
          </div>
          <div
            className={`p-1.5 border rounded-md transition-colors ${
              layoutMode === "grid"
                ? "border-[#1A73E8] bg-[#E8F0FE]/50"
                : "border-border group-hover:border-gray-300"
            }`}
          >
            <LayoutIconGrid />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="roomLayoutMode"
              value="spotlight"
              checked={layoutMode === "spotlight"}
              onChange={() => setLayoutMode?.("spotlight")}
              className="w-5 h-5 accent-[#1A73E8]"
            />
            <span className="text-[15px] font-medium">
              {changeLayoutT.spotlight || "Tiêu điểm"}
            </span>
          </div>
          <div
            className={`p-1.5 border rounded-md transition-colors ${
              layoutMode === "spotlight"
                ? "border-[#1A73E8] bg-[#E8F0FE]/50"
                : "border-border group-hover:border-gray-300"
            }`}
          >
            <LayoutIconSpotlight />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="roomLayoutMode"
              value="sidebar"
              checked={layoutMode === "sidebar"}
              onChange={() => setLayoutMode?.("sidebar")}
              className="w-5 h-5 accent-[#1A73E8]"
            />
            <span className="text-[15px] font-medium">
              {changeLayoutT.sidebar || "Thanh bên"}
            </span>
          </div>
          <div
            className={`p-1.5 border rounded-md transition-colors ${
              layoutMode === "sidebar"
                ? "border-[#1A73E8] bg-[#E8F0FE]/50"
                : "border-border group-hover:border-gray-300"
            }`}
          >
            <LayoutIconSidebar />
          </div>
        </label>
      </div>

      {/* Tiles count */}
      <div
        className={`flex flex-col mb-4 transition-opacity border-t border-border pt-4 ${
          layoutMode !== "grid" && layoutMode !== "auto"
            ? "opacity-50 pointer-events-none"
            : ""
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {changeLayoutT.tilesLabel || "Số ô tối đa"}
            </span>
            <span className="text-xs text-gray-500">
              {changeLayoutT.tilesDescription ||
                "Số ô tối đa được hiển thị trên màn hình."}
            </span>
          </div>
          <span className="text-sm font-semibold text-[#1A73E8] bg-blue-50 px-2.5 py-0.5 rounded-md min-w-[32px] text-center">
            {maxTiles}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LayoutGrid size={20} className="text-gray-500 shrink-0" />
          <div className="flex-1 px-1">
            <Slider
              value={maxTiles}
              min={4}
              max={49}
              step={1}
              onChange={(e) => setMaxTiles?.(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Hide empty tiles */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-[15px] font-medium">
          {changeLayoutT.hideNonVideo || "Ẩn ô không có video"}
        </span>
        <Switch
          checked={hideEmptyTiles}
          onChange={(e) => setHideEmptyTiles?.(e.target.checked)}
          colorClass="peer-checked:bg-[#1A73E8]"
        />
      </div>
    </div>
  )
}

export default VideoLayoutTab
