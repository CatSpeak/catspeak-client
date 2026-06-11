import React from "react"
import colors from "@/shared/utils/colors"

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span style={{ color: colors.headingColor }}>{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-[#606060] hover:text-black hover:underline"
              >
                {item.label}
              </button>
            )}

            {!isLast && <span className="mx-3 shrink-0 text-[#606060]">/</span>}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb
