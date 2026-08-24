import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { China, UK } from "@/shared/assets/icons/flags"
import { MainLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"

const languages = [
  {
    code: "zh",
    name: "Trung Quốc",
    labelKey: "china",
    flag: China,
    className: "left-[10%] top-[44%]",
  },
  {
    code: "en",
    name: "Anh",
    labelKey: "english",
    flag: UK,
    className: "left-[53%] top-[44%]",
  },
]

export default function LanguageCard({ onCommunityChange }) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [activeCommunity, setActiveCommunity] = useState(() => {
    if (typeof window === "undefined") return "zh"
    const saved = localStorage.getItem("communityLanguage")
    if (saved && saved !== "vi") {
      return saved
    }
    if (saved === "vi") {
      localStorage.setItem("communityLanguage", "zh")
    }
    return "zh"
  })

  const handleSelect = (code) => {
    const target = code === "en" || code === "zh" ? code : "zh"
    setActiveCommunity(target)
    localStorage.setItem("communityLanguage", target)
    if (onCommunityChange) onCommunityChange(target)
    navigate(`/${target}/community`)
  }

  return (
    <div className="flex justify-center items-center py-2 sm:py-6 md:py-8 lg:py-4 min-[1280px]:py-8 h-[280px] sm:h-[340px] md:h-[380px] lg:h-[420px] min-[1280px]:h-[480px] w-full max-w-full overflow-visible select-none">
      {/* Ambient background glow */}
      <div className="absolute w-[320px] sm:w-[420px] lg:w-[460px] min-[1280px]:w-[580px] h-[220px] sm:h-[280px] lg:h-[300px] min-[1280px]:h-[380px] bg-rose-500/5 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none" />

      {/* 3D Perspective Viewport */}
      <div
        className="relative scale-[0.48] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.68] min-[1280px]:scale-[0.85] min-[1440px]:scale-[0.95] min-[1600px]:scale-[1] transition-transform duration-300 origin-center"
        style={{ perspective: "1400px" }}
      >
        {/* ═══════════════════════════════════════════════════ */}
        {/* SOFT AMBIENT GROUND CONTACT SHADOW                  */}
        {/* ═══════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[50px]"
          style={{
            transform:
              "rotateX(55deg) rotateZ(-45deg) translateZ(-35px) translate(-6px, 16px) scale(0.96)",
            background: "rgba(15, 23, 42, 0.06)",
            filter: "blur(28px)",
            boxShadow:
              "-8px 18px 36px rgba(15, 23, 42, 0.06), -14px 28px 50px rgba(15, 23, 42, 0.03)",
          }}
        />

        {/* ═══════════════════════════════════════════════════ */}
        {/* MAIN 3D SOLID SLAB OBJECT                           */}
        {/* ═══════════════════════════════════════════════════ */}
        <div
          className="relative h-[420px] w-[650px] overflow-visible rounded-[42px]"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(55deg) rotateZ(-45deg)",
            background:
              "linear-gradient(145deg, #ffffff 0%, #fafbfc 50%, #f4f6f8 100%)",
            /* 3D solid downward edge + soft ambient shadow around the slab */
            boxShadow: `
              0 0 0 1px rgba(255,255,255,1),
              -1px 1px 0 #e2e8f0,
              -2px 2px 0 #cbd5e1,
              -3px 3px 0 #cbd5e1,
              -4px 4px 0 #b4c2d3,
              -5px 5px 0 #9caec4,
              -6px 6px 0 #889bb3,
              -7px 7px 0 #778aa3,
              -8px 8px 0 #687a93,
              -6px 12px 24px -4px rgba(15, 23, 42, 0.08),
              -14px 28px 48px -6px rgba(15, 23, 42, 0.06),
              0 10px 30px rgba(15, 23, 42, 0.04),
              inset 0 2px 1px rgba(255,255,255,1),
              inset 0 -1px 2px rgba(255,255,255,0.8)
            `,
          }}
        >
          {/* Top Surface Specular Sheen */}
          <div
            className="absolute inset-x-8 top-2 h-[2px] rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 25%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 75%, transparent 100%)",
            }}
          />

          {/* ═══════════════════════════════════════════════════ */}
          {/* 1. CATSPEAK 3D LOGO                                 */}
          {/* ═══════════════════════════════════════════════════ */}
          <div
            className="absolute left-[52px] top-[36px]"
            style={{
              transform: "translateZ(8px)",
            }}
          >
            <img
              src={MainLogo}
              alt="CatSpeak"
              className="w-[125px]"
              style={{
                filter:
                  "drop-shadow(-1px 2px 2px rgba(15,23,42,0.12)) drop-shadow(-2px 4px 6px rgba(15,23,42,0.06))",
              }}
            />
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* 2. 3D SOLID RUBY AI BADGE                           */}
          {/* ═══════════════════════════════════════════════════ */}
          <div
            onClick={() => navigate(`/${activeCommunity}/cat-speak`)}
            className="absolute right-[38px] top-[26px] cursor-pointer group/badge"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-white/40 transition-all duration-200 active:translate-y-1 group-hover/badge:scale-105"
              style={{
                transform: "translateZ(8px)",
                background:
                  "linear-gradient(135deg, #C41E3A 0%, #910B09 50%, #7A0907 100%)",
                boxShadow: `
                  -1px 1px 0 #8A0F0D,
                  -2px 2px 0 #7A0907,
                  -3px 3px 0 #6e0806,
                  -4px 4px 0 #600705,
                  -5px 5px 0 #520604,
                  -4px 8px 16px rgba(145, 11, 9, 0.2),
                  inset 0 1.5px 0 rgba(255,255,255,0.6)
                `,
              }}
            >
              {/* Specular dot */}
              <div className="absolute top-2 left-2.5 w-2 h-1 rounded-full bg-white/60 blur-[0.5px]" />

              <span
                className="text-base font-black tracking-wider text-[#FFE66D]"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                }}
              >
                AI
              </span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* 3. SOLID 3D PUSHABLE LANGUAGE BUTTONS               */}
          {/* ═══════════════════════════════════════════════════ */}
          {languages.map((item) => {
            const isSelected = activeCommunity === item.code
            const label =
              t?.header?.countries?.[item.labelKey] ||
              t?.landing?.hero?.countries?.[item.labelKey] ||
              item.name

            return (
              <div
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`absolute ${item.className} group/lang cursor-pointer`}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Unified Solid 3D Button */}
                <div
                  className={`relative flex w-[220px] sm:w-[230px] items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-150 ease-out select-none ${
                    isSelected
                      ? "bg-gradient-to-b from-[#ffffff] to-[#fff8f8] border border-[#910B09]/70 shadow-[0_0_20px_rgba(145,11,9,0.12)]"
                      : "bg-gradient-to-b from-[#ffffff] to-[#f8fafc] border border-slate-200/90 hover:brightness-[1.02]"
                  }`}
                  style={{
                    transform: isSelected
                      ? "translateZ(3px)"
                      : "translateZ(8px)",
                    boxShadow: isSelected
                      ? `
                        -0.5px 0.5px 0 #b31614,
                        -1px 1px 0 #910B09,
                        -1.5px 1.5px 0 #800a08,
                        0 2px 6px rgba(145, 11, 9, 0.16),
                        inset 0 1.5px 0 rgba(255,255,255,1),
                        inset 0 -1px 0 rgba(145,11,9,0.06)
                      `
                      : `
                        -1px 1px 0 #e2e8f0,
                        -2px 2px 0 #cbd5e1,
                        -3px 3px 0 #b4c2d3,
                        -4px 4px 0 #9caec4,
                        -5px 5px 0 #889bb3,
                        -3px 6px 12px -2px rgba(15, 23, 42, 0.08),
                        -6px 12px 20px -4px rgba(15, 23, 42, 0.06),
                        0 4px 10px rgba(15, 23, 42, 0.04),
                        inset 0 1.5px 0 rgba(255,255,255,1)
                      `,
                  }}
                >
                  {/* Flag Token */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.flag}
                      alt={label}
                      className="h-8 w-8 rounded-full object-cover shadow-sm ring-1 ring-black/5"
                    />
                  </div>

                  {/* Language Text */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span
                      className={`text-sm sm:text-base font-black whitespace-nowrap transition-colors duration-150 ${
                        isSelected
                          ? "text-[#910B09]"
                          : "text-gray-800 group-hover/lang:text-[#910B09]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
