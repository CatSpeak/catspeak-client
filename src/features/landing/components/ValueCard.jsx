import { ValueCardBg } from "@/shared/assets/images/home"

const colorConfig = {
  purple: {
    solid: "from-white to-purple-500",
    glass: "from-white/60 to-purple-500/20 text-purple-700",
  },
  blue: {
    solid: "from-white to-blue-400",
    glass: "from-white/60 to-blue-400/20 text-blue-600",
  },
  orange: {
    solid: "from-white to-orange-400",
    glass: "from-white/60 to-orange-400/20 text-orange-600",
  },
  green: {
    solid: "from-white to-green-500",
    glass: "from-white/60 to-green-500/20 text-green-600",
  },
}

const ValueCard = ({
  icon,
  title,
  description,
  color = "orange",
  className = "",
}) => {
  const styles = colorConfig[color] || colorConfig.orange
  return (
    <div
      className={`relative flex w-full max-w-[280px] h-auto flex-col transition-transform drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] ${className}`}
    >
      <img
        src={ValueCardBg}
        alt="Background"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="relative z-10 w-full h-full p-6 flex flex-col gap-4">
        {/* Header: Title + Icon */}
        <div className="flex justify-between items-start w-full">
          <h4
            className="font-bold leading-tight text-cath-red-500 flex-1 pr-4 text-lg"
          >
            {title}
          </h4>

          <div className="relative h-14 w-14 flex-shrink-0 mr-6">
            {/* Layer 1: Bottom/Back (Top-Left) - Solid Gradient */}
            <div
              className={`absolute top-0 left-0 h-12 w-12 rounded-[14px] bg-gradient-to-br ${styles.solid} opacity-80`}
            />

            {/* Layer 2: Top/Front (Bottom-Right) - Glass Gradient + Icon */}
            <div
              className={`absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/40 bg-gradient-to-br ${styles.glass} backdrop-blur-sm shadow-sm`}
            >
              {icon}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mt-auto text-sm">
          {description}
        </p>
      </div>
    </div>
  )
}

export default ValueCard
