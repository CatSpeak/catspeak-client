import React from "react"

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center flex-wrap gap-3 font-nunito text-sm leading-[1.4]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="font-semibold text-cath-red-700">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="font-normal text-[#7b7979] hover:text-black hover:underline transition-colors"
              >
                {item.label}
              </button>
            )}

            {!isLast && (
              <span className="shrink-0 text-[#7b7979]">/</span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb
