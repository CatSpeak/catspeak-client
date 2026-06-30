import React from "react"
import colors from "@/shared/utils/colors"

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center flex-wrap sm:text-xs font-bold tracking-wider text-gray-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="text-primary font-bold text-xs truncate max-w-[200px] sm:max-w-xs">{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-gray-400 hover:text-gray-800 transition-colors focus:outline-none bg-transparent border-0 p-0 m-0 cursor-pointer font-bold hover:underline"
              >
                {item.label}
              </button>
            )}

            {!isLast && <span className="mx-2.5 shrink-0 text-gray-300 font-normal">/</span>}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb

