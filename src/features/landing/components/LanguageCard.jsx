import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { China, UK, Japan } from "@/shared/assets/icons/flags"
import { MainLogo, MainLogoDark } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { useTheme } from "@/shared/context/ThemeContext"

const languages = [
  {
    code: "zh",
    name: "China",
    labelKey: "china",
    flag: China,
    className: "left-[10%] top-[44%]",
  },
  {
    code: "en",
    name: "English",
    labelKey: "english",
    flag: UK,
    className: "left-[53%] top-[44%]",
  },
  {
    code: "ja",
    name: "Japan",
    labelKey: "japan",
    flag: Japan,
    className: "left-[31.5%] top-[70%]",
  },
]

export default function LanguageCard({ onCommunityChange }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isDark } = useTheme()

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
    const target = code === "en" || code === "zh" || code === "ja" ? code : "zh"
    setActiveCommunity(target)
    localStorage.setItem("communityLanguage", target)
    if (onCommunityChange) onCommunityChange(target)
    navigate(`/${target}/community`)
  }

  return (
    <div className="flex justify-center items-center py-2 sm:py-6 md:py-8 lg:py-4 xl:py-8 h-[280px] sm:h-[340px] md:h-[380px] lg:h-[420px] xl:h-[480px] w-full max-w-full overflow-visible select-none">
      {/* 3D Perspective Viewport */}
      <div
        className="relative scale-[0.5] sm:scale-[0.62] md:scale-[0.72] lg:scale-[0.85] xl:scale-100 transition-transform duration-300 origin-center"
        style={{ perspective: "1400px" }}
      >
        {/* ═══════════════════════════════════════════════════ */}
        {/* SOFT AMBIENT GROUND CONTACT SHADOW                  */}
        {/* ═══════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[50px] transition-all duration-300"
          style={{
            transform:
              "rotateX(55deg) rotateZ(-45deg) translateZ(-35px) translate(-6px, 16px) scale(0.96)",
            background: isDark
              ? "rgba(0, 0, 0, 0.75)"
              : "rgba(15, 23, 42, 0.06)",
            filter: isDark ? "blur(24px)" : "blur(28px)",
            boxShadow: isDark
              ? "-14px 28px 52px rgba(0, 0, 0, 0.95), -22px 44px 76px rgba(0, 0, 0, 0.85)"
              : "-8px 18px 36px rgba(15, 23, 42, 0.06), -14px 28px 50px rgba(15, 23, 42, 0.03)",
          }}
        />

        {/* ═══════════════════════════════════════════════════ */}
        {/* MAIN 3D SOLID SLAB OBJECT                           */}
        {/* ═══════════════════════════════════════════════════ */}
        <div
          className="relative h-[420px] w-[650px] overflow-visible rounded-[42px] transition-all duration-300"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(55deg) rotateZ(-45deg)",
            background: isDark
              ? "linear-gradient(145deg, #18191E 0%, #131417 50%, #0E0F11 100%)"
              : "linear-gradient(145deg, #ffffff 0%, #fafbfc 50%, #f4f6f8 100%)",
            /* 3D solid downward edge + contact shadow */
            boxShadow: isDark
              ? `
                0 0 0 1px rgba(255, 255, 255, 0.07),
                -1px 1px 0 #22242B,
                -2px 2px 0 #1C1D23,
                -3px 3px 0 #16171C,
                -4px 4px 0 #111215,
                -5px 5px 0 #0C0D0F,
                -6px 6px 0 #09090B,
                -7px 7px 0 #060608,
                -8px 8px 0 #030304,
                -10px 20px 36px -4px rgba(0, 0, 0, 0.85),
                -18px 38px 64px -6px rgba(0, 0, 0, 0.7),
                0 14px 40px rgba(0, 0, 0, 0.55),
                inset 0 1px 1px rgba(255, 255, 255, 0.1),
                inset 0 -1px 2px rgba(0, 0, 0, 0.7)
              `
              : `
                0 0 0 1px rgba(255, 255, 255, 1),
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
                inset 0 2px 1px rgba(255, 255, 255, 1),
                inset 0 -1px 2px rgba(255, 255, 255, 0.8)
              `,
          }}
        >
          {/* Top Surface Specular Sheen */}
          <div
            className="absolute inset-x-8 top-2 h-[2px] rounded-full pointer-events-none transition-all duration-300"
            style={{
              background: isDark
                ? "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 20%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.03) 80%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.95) 25%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.95) 75%, transparent 100%)",
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
              src={isDark ? MainLogoDark : MainLogo}
              alt="CatSpeak"
              className="w-[125px] transition-all duration-300"
              style={{
                filter: isDark
                  ? "drop-shadow(-1px 2px 3px rgba(0, 0, 0, 0.8)) drop-shadow(-2px 4px 8px rgba(0, 0, 0, 0.5))"
                  : "drop-shadow(-1px 2px 2px rgba(15, 23, 42, 0.12)) drop-shadow(-2px 4px 6px rgba(15, 23, 42, 0.06))",
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
              className={`relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border transition-all duration-200 active:translate-y-1 group-hover/badge:scale-105 ${
                isDark ? "border-white/15" : "border-white/40"
              }`}
              style={{
                transform: "translateZ(8px)",
                background: isDark
                  ? "linear-gradient(135deg, #BA1B30 0%, #8C0E1C 50%, #610712 100%)"
                  : "linear-gradient(135deg, #C41E3A 0%, #910B09 50%, #7A0907 100%)",
                boxShadow: isDark
                  ? `
                    -1px 1px 0 #690B15,
                    -2px 2px 0 #50070F,
                    -3px 3px 0 #39040A,
                    -4px 4px 0 #240206,
                    -4px 8px 16px rgba(0, 0, 0, 0.7),
                    0 4px 12px rgba(186, 27, 48, 0.25),
                    inset 0 1.5px 0 rgba(255, 255, 255, 0.35)
                  `
                  : `
                    -1px 1px 0 #8A0F0D,
                    -2px 2px 0 #7A0907,
                    -3px 3px 0 #6e0806,
                    -4px 4px 0 #600705,
                    -5px 5px 0 #520604,
                    -4px 8px 16px rgba(145, 11, 9, 0.2),
                    inset 0 1.5px 0 rgba(255, 255, 255, 0.6)
                  `,
              }}
            >
              {/* Specular dot */}
              <div
                className={`absolute top-2 left-2.5 w-2 h-1 rounded-full blur-[0.5px] ${
                  isDark ? "bg-white/40" : "bg-white/60"
                }`}
              />

              <span
                className="text-base font-black tracking-wider text-[#FFE66D]"
                style={{
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
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
                      ? isDark
                        ? "bg-gradient-to-b from-[#2A0F13] to-[#1C0A0D] border border-[#B31D2E]/80 shadow-[0_0_14px_rgba(179,29,46,0.2)]"
                        : "bg-gradient-to-b from-[#ffffff] to-[#fff8f8] border border-[#910B09]/70 shadow-[0_0_20px_rgba(145,11,9,0.12)]"
                      : isDark
                      ? "bg-gradient-to-b from-[#202228] to-[#17181D] border border-white/8 hover:border-white/15 hover:brightness-105"
                      : "bg-gradient-to-b from-[#ffffff] to-[#f8fafc] border border-slate-200/90 hover:brightness-[1.02]"
                  }`}
                  style={{
                    transform: isSelected
                      ? "translateZ(3px)"
                      : "translateZ(8px)",
                    boxShadow: isSelected
                      ? isDark
                        ? `
                          -0.5px 0.5px 0 #6E121C,
                          -1px 1px 0 #520D15,
                          -1.5px 1.5px 0 #3A090F,
                          0 2px 8px rgba(179, 29, 46, 0.25),
                          inset 0 1px 0 rgba(255, 120, 140, 0.25),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.6)
                        `
                        : `
                          -0.5px 0.5px 0 #b31614,
                          -1px 1px 0 #910B09,
                          -1.5px 1.5px 0 #800a08,
                          0 2px 6px rgba(145, 11, 9, 0.16),
                          inset 0 1.5px 0 rgba(255,255,255,1),
                          inset 0 -1px 0 rgba(145,11,9,0.06)
                        `
                      : isDark
                      ? `
                        -1px 1px 0 #2B2D36,
                        -2px 2px 0 #21232A,
                        -3px 3px 0 #18191E,
                        -4px 4px 0 #101115,
                        -5px 5px 0 #0A0A0D,
                        -3px 6px 12px -2px rgba(0, 0, 0, 0.65),
                        -6px 12px 20px -4px rgba(0, 0, 0, 0.5),
                        0 4px 10px rgba(0, 0, 0, 0.35),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
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
                      className={`h-8 w-8 rounded-full object-cover shadow-sm ${
                        isDark ? "ring-1 ring-white/10" : "ring-1 ring-black/5"
                      }`}
                    />
                  </div>

                  {/* Language Text */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span
                      className={`text-sm sm:text-base font-black whitespace-nowrap transition-colors duration-150 ${
                        isSelected
                          ? isDark
                            ? "text-[#FF7A8A]"
                            : "text-[#910B09]"
                          : isDark
                          ? "text-gray-200 group-hover/lang:text-[#FF7A8A]"
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
