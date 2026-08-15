import React from "react";

/**
 * Uiverse3DCard Component
 * Based on Uiverse.io snippet by Smit-Prajapati.
 * Features 3D perspective rotation, glassmorphic overlay, 
 * depth-translated elements, and multi-layered popping circles.
 */
const Uiverse3DCard = ({
  title = "CatSpeak 3D",
  subtitle = "Nền tảng giao tiếp cộng đồng đa ngôn ngữ tích hợp AI.",
  badgeText = "AI",
  onActionClick,
  className = "",
}) => {
  return (
    <div className={`group/uiverse relative w-[290px] h-[320px] [perspective:1000px] ${className}`}>
      {/* 3D Card Base */}
      <div className="relative w-full h-full rounded-[40px] bg-gradient-to-br from-[#910B09] via-rose-800 to-amber-900 transition-all duration-500 ease-in-out [transform-style:preserve-3d] shadow-[rgba(145,11,9,0.2)_0px_25px_25px_-5px] group-hover/uiverse:[transform:rotate3d(1,1,0,25deg)] group-hover/uiverse:shadow-[rgba(145,11,9,0.35)_30px_50px_25px_-35px]">
        {/* Layered Popping Logo Circles (translateZ steps) */}
        <div className="absolute right-0 top-0 [transform-style:preserve-3d]">
          <span className="block absolute w-[160px] h-[160px] rounded-full top-2 right-2 bg-rose-400/20 backdrop-blur-sm [transform:translate3d(0,0,20px)] transition-transform duration-500 ease-in-out group-hover/uiverse:[transform:translate3d(0,0,40px)]" />
          <span className="block absolute w-[130px] h-[130px] rounded-full top-3.5 right-3.5 bg-rose-300/30 backdrop-blur-[2px] [transform:translate3d(0,0,40px)] transition-transform duration-500 ease-in-out group-hover/uiverse:[transform:translate3d(0,0,65px)]" />
          <span className="block absolute w-[100px] h-[100px] rounded-full top-5 right-5 bg-rose-200/40 backdrop-blur-[3px] [transform:translate3d(0,0,60px)] transition-transform duration-500 ease-in-out group-hover/uiverse:[transform:translate3d(0,0,90px)]" />
          <span className="block absolute w-[70px] h-[70px] rounded-full top-7 right-7 bg-[#FFF0F2] backdrop-blur-[5px] [transform:translate3d(0,0,80px)] transition-transform duration-500 ease-in-out group-hover/uiverse:[transform:translate3d(0,0,115px)] flex items-center justify-center font-extrabold text-[#910B09] text-xs shadow-md">
            {badgeText}
          </span>
        </div>

        {/* Glass Front Layer */}
        <div className="absolute inset-2 rounded-[36px] bg-gradient-to-b from-white/80 to-white/40 border-l border-b border-white/90 backdrop-blur-md [transform:translate3d(0,0,25px)] transition-all duration-500 ease-in-out [transform-style:preserve-3d]" />

        {/* Content Container (translateZ 35px) */}
        <div className="relative pt-24 px-7 flex flex-col gap-2 [transform:translate3d(0,0,35px)] [transform-style:preserve-3d]">
          <span className="block text-[#910B09] font-black text-xl tracking-tight">
            {title}
          </span>
          <span className="block text-gray-700 text-xs font-medium leading-relaxed">
            {subtitle}
          </span>
        </div>

        {/* Bottom Bar (translateZ 45px) */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between [transform:translate3d(0,0,45px)] [transform-style:preserve-3d]">
          <button
            onClick={onActionClick}
            className="bg-[#910B09] hover:bg-[#7a0907] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition-transform duration-200 hover:[transform:translate3d(0,0,10px)]"
          >
            Khám phá
          </button>
        </div>
      </div>
    </div>
  );
};

export default Uiverse3DCard;
