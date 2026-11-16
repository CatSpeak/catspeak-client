import React from "react"

const AgreementCheckbox = ({ name, rules, children, checked, onChange, ...props }) => {
  return (
    <div className="flex items-start gap-2 py-2 text-left">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-[#3F3F3F] dark:bg-[#272727] text-cath-red-700 focus:ring-cath-red-700"
        {...props}
      />
      <label
        htmlFor={name}
        className="block flex-1 cursor-pointer text-sm text-gray-600 dark:text-neutral-300"
      >
        {children}
      </label>
    </div>
  )
}

export default AgreementCheckbox
