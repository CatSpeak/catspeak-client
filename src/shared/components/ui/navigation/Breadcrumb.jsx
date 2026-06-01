import React from "react"
import { ChevronRight } from "lucide-react"
import colors from "@/shared/utils/colors"

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center text-xl font-bold flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span style={{ color: colors.headingColor }}>
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-[#7A7574] hover:text-black transition-colors"
              >
                {item.label}
              </button>
            )}

            {!isLast && (
              <ChevronRight color={colors.primaryRed} className="mx-2 shrink-0" />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb
