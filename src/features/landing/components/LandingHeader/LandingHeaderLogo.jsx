import { IconLogo } from "@/shared/assets/icons/logo"
import { Link } from "react-router-dom"
import { LandingPageLogo } from "../../assets"

const LandingHeaderLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center" aria-label="Cat Speak Home">
        {/* Mobile & Tablet (< 1280px) */}
        <img
          src={IconLogo}
          alt="Cat Speak logo"
          className="block h-10 w-auto min-[1280px]:hidden"
          draggable={false}
        />

        {/* Desktop (>= 1280px) */}
        <img
          src={LandingPageLogo}
          alt="Cat Speak logo"
          className="hidden h-10 w-auto min-[1280px]:block"
          draggable={false}
        />
      </Link>
    </div>
  )
}

export default LandingHeaderLogo
