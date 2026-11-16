import { ArrowRight } from "lucide-react"

const LandingHeaderGuestControls = ({ onGetStarted, label }) => {
  const handleRegister = () => onGetStarted?.("register")

  return (
    <button
      type="button"
      onClick={handleRegister}
      className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#990011] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#80000e]"
    >
      {label}
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  )
}

export default LandingHeaderGuestControls
