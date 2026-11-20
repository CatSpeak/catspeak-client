import { IconLogo, MainLogo, MainLogoDark } from "@/shared/assets/icons/logo"
import { Link } from "react-router-dom"

const LandingHeaderLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center gap-2" aria-label="Cat Speak Home">
        {/* Cat Icon (all screens) */}
        <img
          src={IconLogo}
          alt="Cat Speak"
          className="h-10 w-10 shrink-0"
          draggable={false}
        />

        {/* Wordmark: Light Mode (>= xl) */}
        <img
          src={MainLogo}
          alt="Cat Speak"
          className="h-6 w-auto shrink-0 hidden xl:block dark:hidden"
          draggable={false}
        />

        {/* Wordmark: Dark Mode (>= xl) */}
        <img
          src={MainLogoDark}
          alt="Cat Speak"
          className="h-6 w-auto shrink-0 hidden dark:xl:block"
          draggable={false}
        />
      </Link>
    </div>
  )
}

export default LandingHeaderLogo
