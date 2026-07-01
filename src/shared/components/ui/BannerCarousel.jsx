import React from "react"
import Carousel from "./Carousel"

const BannerCarousel = ({ leftContent, images }) => {
  return (
    <div className="pl-4 w-full relative overflow-visible pb-6 min-h-[320px] flex flex-col shadow-sm">
      <div className="grid grid-cols-12 flex-1 min-h-[280px]">
        {/* Left: Text content */}
        {leftContent}

        {/* Right: Banner image with shared Carousel */}
        <div className="col-span-12 md:col-span-6 flex items-center justify-start p-6 md:p-8 md:pl-0 relative overflow-hidden group">
          <Carousel 
            images={images} 
            className="rounded-2xl shadow-md !aspect-auto min-h-[200px]" 
            objectFit="contain"
            allowFullscreen={false}
          />
        </div>
      </div>
    </div>
  )
}

export default BannerCarousel
