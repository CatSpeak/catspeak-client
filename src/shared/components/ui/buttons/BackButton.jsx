import React from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

/**
 * Reusable back‑navigation button.
 *
 * @param {Object}  props
 * @param {string}  [props.to]        – If provided, renders a <Link> for client‑side navigation.
 * @param {Function} [props.onClick]  – If provided (and no `to`), renders a <button> with this handler.
 * @param {React.ReactNode} props.children – Label text.
 * @param {string}  [props.className] – Extra classes merged onto the element.
 */
const BackButton = ({ to, onClick, children, className = "" }) => {
  const base =
    "group flex text-sm items-center gap-2 h-10 px-3 rounded-lg w-fit text-gray-600 hover:text-gray-900 hover:bg-[#E5E5E5] transition-colors font-medium"

  if (to) {
    return (
      <Link to={to} className={`${base} ${className}`}>
        <ArrowLeft className="transition-all duration-200 group-hover:-translate-x-1 group-hover:text-cath-red-700" />
        {children}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={`${base} ${className}`}>
      <ArrowLeft className="transition-all duration-200 group-hover:-translate-x-1 group-hover:text-cath-red-700" />
      {children}
    </button>
  )
}

export default BackButton
