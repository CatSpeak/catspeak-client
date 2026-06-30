import React from "react"
import colors from "@/shared/utils/colors"

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center flex-wrap text-[14px] pb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="font-bold text-[#990011]">{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-[#9ca3af] cursor-default"
              >
                {item.label}
              </button>
            )}

            {!isLast && <span className="mx-3 shrink-0 font-light text-[#d1d5db]">/</span>}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb
