import { useState, useEffect } from "react";
import { China, UK, VietNam } from "@/shared/assets/icons/flags";
import { MainLogo } from "@/shared/assets/icons/logo";
import { Check } from "lucide-react";

const languages = [
  {
    code: "vi",
    name: "Việt Nam",
    flag: VietNam,
    className: "left-[7%] top-[38%]",
  },
  {
    code: "zh",
    name: "Trung Quốc",
    flag: China,
    className: "left-[39%] top-[38%]",
  },
  {
    code: "en",
    name: "Anh",
    flag: UK,
    className: "left-[71%] top-[38%]",
  },
];

export default function LanguageCard({ onCommunityChange }) {
  const [activeCommunity, setActiveCommunity] = useState("vi");

  useEffect(() => {
    const saved = localStorage.getItem("communityLanguage");
    if (saved) {
      setActiveCommunity(saved);
    }
  }, []);

  const handleSelect = (code) => {
    setActiveCommunity(code);
    localStorage.setItem("communityLanguage", code);
    if (onCommunityChange) {
      onCommunityChange(code);
    }
  };

  return (
    <div className="flex justify-center items-center py-10 md:py-20 h-[320px] md:h-auto overflow-visible select-none">
      {/* Ambient background glow */}
      <div className="absolute w-[450px] h-[300px] bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* 3D Perspective Container */}
      <div className="relative perspective-[1200px] scale-[0.52] sm:scale-75 md:scale-100 transition-transform duration-300 origin-center">
        
        {/* Main 3D Board Slab Object */}
        <div className="relative h-[420px] w-[650px] [transform:rotateX(55deg)_rotateZ(-45deg)] [transform-style:preserve-3d] overflow-visible">
          
          {/* Layer 1: Soft Floor Shadow Underneath Slab (translateZ -30px) */}
          <div className="absolute inset-0 rounded-[44px] bg-black/20 blur-xl [transform:translateZ(-30px)]" />

          {/* Layer 2: 3D Side Edge Base Slab (translateZ 0px) */}
          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-slate-300 via-gray-300 to-slate-400 border border-slate-400/50 shadow-md [transform:translateZ(0px)]" />

          {/* Layer 3: 3D Bevel Edge Plate (translateZ 8px) */}
          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-gray-200 via-slate-100 to-gray-300 [transform:translateZ(8px)]" />

          {/* Layer 4: Top Surface Plate (translateZ 18px) */}
          <div className="relative h-full w-full rounded-[40px] bg-gradient-to-br from-white/95 via-white/85 to-slate-50/90 backdrop-blur-md shadow-[0_25px_50px_rgba(0,0,0,0.15)] border border-white [transform:translateZ(18px)] [transform-style:preserve-3d]">
            
            {/* Logo */}
            <img
              src={MainLogo}
              alt="logo"
              className="absolute left-[65px] top-[40px] w-[120px] [transform:translateZ(25px)] transition-transform duration-300 hover:[transform:translateZ(40px)]"
            />

            {/* AI Badge - 3D Block Object */}
            <div className="absolute right-[28px] top-[24px] group/badge cursor-pointer [transform-style:preserve-3d]">
              {/* Static Drop Shadow on board surface */}
              <div className="absolute left-[3px] top-[8px] h-[52px] w-[52px] rounded-2xl bg-black/20 blur-[2px]" />

              {/* 3D Red Edge Base Layer */}
              <div className="absolute top-0 left-0 w-[54px] h-[54px] rounded-2xl bg-gradient-to-b from-[#7A0907] to-[#910B09] [transform:translateZ(20px)] border border-rose-900/40" />

              {/* Main Badge Top Face Plate */}
              <div className="relative flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9E0C1D] to-[#D06F7A] text-base font-extrabold tracking-wide text-[#FFE66D] border border-white/50 shadow-md [transform:translateZ(35px)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/badge:[transform:translateZ(85px)]">
                AI
              </div>
            </div>

            {/* 3 Community Language Cards - Clickable Community Switcher */}
            {languages.map((item) => {
              const isSelected = activeCommunity === item.code;
              return (
                <div
                  key={item.code}
                  onClick={() => handleSelect(item.code)}
                  className={`absolute ${item.className} group/lang cursor-pointer [transform-style:preserve-3d]`}
                >
                  {/* Static 3D Drop Shadow on board floor */}
                  <div className="absolute left-[4px] top-[10px] h-[52px] w-[172px] sm:w-[182px] rounded-2xl bg-black/15 blur-[2px]" />

                  {/* 3D Side Edge Thickness Base Layer */}
                  <div className="absolute top-0 left-0 w-[170px] sm:w-[180px] h-[56px] rounded-2xl bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 border border-gray-300/80 shadow-inner [transform:translateZ(15px)]" />

                  {/* Top Face Card Plate */}
                  <div
                    className={`relative flex w-[170px] sm:w-[180px] items-center gap-3.5 rounded-2xl bg-white px-6 py-4 border transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isSelected
                        ? "border-[#910B09] ring-2 ring-[#910B09]/30 shadow-lg [transform:translateZ(50px)]"
                        : "border-gray-100 shadow-md [transform:translateZ(30px)] group-hover/lang:[transform:translateZ(80px)] group-hover/lang:border-[#910B09]/40"
                    }`}
                  >
                    {/* Top specular highlight line */}
                    <div className="absolute inset-x-2 top-1 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white to-transparent" />

                    {/* Left edge 3D shadow */}
                    <div className="absolute left-0 top-2 bottom-2 w-[5px] rounded-l-2xl bg-black/10 blur-[1px] [transform:translateZ(-3px)]" />

                    {/* Bottom edge 3D shadow */}
                    <div className="absolute bottom-0 left-2 right-2 h-[5px] rounded-b-2xl bg-black/10 blur-[1px] [transform:translateZ(-3px)]" />

                    <img
                      src={item.flag}
                      alt={item.name}
                      className="h-9 w-9 rounded-full object-cover shadow-sm flex-shrink-0 transition-transform duration-300"
                    />

                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-extrabold transition-colors whitespace-nowrap ${
                          isSelected ? "text-[#910B09]" : "text-gray-900 group-hover/lang:text-[#910B09]"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Active Checkmark Badge */}
                    {isSelected && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-[#910B09] text-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
