import React from "react";

const Breadcrumb = ({ items, className = "" }) => {
  return (
    <div
      className={`max-w-full overflow-hidden font-nunito text-sm leading-[1.4] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span
                className="font-semibold text-cath-red-700"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="font-normal text-[#7b7979] hover:text-black hover:underline"
              >
                {item.label}
              </button>
            )}

            {!isLast && <span className="mx-2 text-[#7b7979]">/</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
