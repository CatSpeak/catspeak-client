const colorStyles = {
  orange: {
    card: "bg-[#FEFCE8]/85 border-[#FEF08A]/80",
    badge: "bg-[#FEF08A] text-[#A16207]",
  },
  red: {
    card: "bg-[#FFF1F2]/90 border-[#FECDD3]/80",
    badge: "bg-[#FFE4E6] text-[#910B09]",
  },
  blue: {
    card: "bg-[#EFF6FF]/85 border-[#BFDBFE]/80",
    badge: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  green: {
    card: "bg-[#F0FDF4]/85 border-[#BBF7D0]/80",
    badge: "bg-[#DCFCE7] text-[#15803D]",
  },
  purple: {
    card: "bg-[#FAF5FF]/85 border-[#E9D5FF]/80",
    badge: "bg-[#F3E8FF] text-[#7E22CE]",
  },
}

const ValueCard = ({
  icon,
  title,
  description,
  color = "orange",
  className = "",
}) => {
  const styles = colorStyles[color] || colorStyles.orange

  return (
    <div
      className={`relative flex flex-col items-center text-center h-full backdrop-blur-md rounded-xl p-4 sm:p-6 border ${styles.card} ${className}`}
    >
      {/* 1. Icon Top (Centered) */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-6 ${styles.badge}`}
      >
        {icon}
      </div>

      {/* 2. Title Below Icon (Centered) */}
      <h4 className="text-2xl font-bold mb-2">{title}</h4>

      {/* 3. Description Below Title (Centered) */}
      <p className="text-secondary flex-1">{description}</p>
    </div>
  )
}

export default ValueCard
