import React from "react"
import { Link } from "react-router-dom"
import { MainLogo, IconLogo } from "@/shared/assets/icons/logo"

const HeaderLogo = () => {
  return (
    <div className="flex items-center">
      <Link
        to="/"
        className="flex items-center"
        aria-label="Cat Speak Home"
      >
        {/* Compact mark on small screens — matches header control scale (~36px) */}
        <img
          src={IconLogo}
          alt=""
          width={36}
          height={36}
          className="h-8 w-8 shrink-0 sm:h-9 sm:w-9 lg:hidden"
          draggable={false}
        />
        <img
          src={MainLogo}
          alt="Cat Speak logo"
          className="hidden h-10 w-auto lg:block"
          draggable={false}
        />
      </Link>
    </div>
  )
}

export default HeaderLogo
