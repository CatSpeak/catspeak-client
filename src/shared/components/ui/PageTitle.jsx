import React from "react"

const PageTitle = ({
  children,
  as: Component = "h1",
  className = "",
  ...props
}) => {
  return (
    <Component
      className={`text-3xl font-bold text-gray-900 dark:text-white line-clamp-2 ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default PageTitle
