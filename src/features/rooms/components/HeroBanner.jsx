import React from "react"
import HeroBannerSlider from "./HeroBannerSlider"
import HeroBannerText from "./HeroBannerText"

const HeroBanner = ({ sessionProps }) => {
  return (
    <div className="pl-4 w-full relative overflow-visible pb-6 min-h-[320px] flex flex-col shadow-sm">
      <HeroBannerSlider>
        <HeroBannerText sessionProps={sessionProps} />
      </HeroBannerSlider>
    </div>
  )
}

export default HeroBanner

