const colorStyles = {
  orange: {
    card: "bg-[#FEFCE8]/85 border-[#FEF08A]/80 dark:bg-[#2b281d]/90 dark:border-[#5b4e2c]",
    badge: "bg-[#FEF08A] text-[#A16207]",
  },
  red: {
    card: "bg-[#FFF1F2]/90 border-[#FECDD3]/80 dark:bg-[#302124]/90 dark:border-[#633238]",
    badge: "bg-[#FFE4E6] text-[#910B09]",
  },
  blue: {
    card: "bg-[#EFF6FF]/85 border-[#BFDBFE]/80 dark:bg-[#202832]/90 dark:border-[#354e68]",
    badge: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  green: {
    card: "bg-[#F0FDF4]/85 border-[#BBF7D0]/80 dark:bg-[#1d2b23]/90 dark:border-[#355843]",
    badge: "bg-[#DCFCE7] text-[#15803D]",
  },
  purple: {
    card: "bg-[#FAF5FF]/85 border-[#E9D5FF]/80 dark:bg-[#29212f]/90 dark:border-[#513b61]",
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
      className={`relative flex h-full flex-col items-center rounded-xl border p-4 text-center backdrop-blur-md transition-colors dark:text-gray-100 sm:p-6 ${styles.card} ${className}`}
    >
      {/* 1. Icon Top (Centered) */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-6 ${styles.badge}`}
      >
        {icon}
      </div>

      {/* 2. Title Below Icon (Centered) */}
      <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h4>

      {/* 3. Description Below Title (Centered) */}
      <p className="flex-1 text-secondary dark:text-gray-300">{description}</p>
    </div>
  )
}

export default ValueCard
