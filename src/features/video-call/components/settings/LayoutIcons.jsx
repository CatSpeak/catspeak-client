import React from "react"

export const LayoutIconAuto = () => (
  <div className="flex gap-[2px] w-12 h-8">
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
    <div className="bg-gray-300 w-1/4 h-full rounded-[2px]" />
  </div>
)

export const LayoutIconGrid = () => (
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
)

export const LayoutIconSpotlight = () => (
  <div className="w-12 h-8 bg-gray-300 rounded-[2px]" />
)

export const LayoutIconSidebar = () => (
  <div className="flex gap-[2px] w-12 h-8">
    <div className="bg-gray-300 flex-1 h-full rounded-[2px]" />
    <div className="flex flex-col gap-[2px] w-3 h-full">
      <div className="bg-gray-300 w-full h-1/3 rounded-[1px]" />
      <div className="bg-gray-300 w-full h-1/3 rounded-[1px]" />
      <div className="bg-gray-300 w-full h-1/3 rounded-[1px]" />
    </div>
  </div>
)
