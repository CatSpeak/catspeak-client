import React from "react";

const Breadcrumb = ({ items, separator = "/", className = "" }) => {
  return (
    <div
      className={`flex min-w-0 max-w-full items-center gap-3 overflow-hidden text-sm leading-[1.4] ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="min-w-[120px] flex-1 truncate font-semibold text-cath-red-700 dark:text-[#FF0033]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="shrink-0 font-normal text-[#7b7979] dark:text-[#AAAAAA] transition-colors hover:text-black dark:hover:text-white hover:underline"
              >
                {item.label}
              </button>
            )}

            {!isLast && <span className="shrink-0 text-[#7b7979] dark:text-[#AAAAAA] font-medium">{separator}</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
