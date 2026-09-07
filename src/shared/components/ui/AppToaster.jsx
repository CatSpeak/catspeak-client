import React, { useRef, useEffect, useState } from "react"
import { Toast } from "primereact/toast"
import { setGlobalToastRef } from "@/shared/utils/toastBridge"

import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

/**
 * AppToaster Component powered by PrimeReact / PrimeNG Toast
 * - Matches the exact Aura Dark Solid design from Prime documentation:
 *   - Background: Solid dark (#18181b, 0% blur)
 *   - Title: text-sm font-semibold text-white
 *   - Detail: text-xs text-neutral-400 mt-1
 *   - Top-right close button (pi pi-times)
 * - Position: bottom-left (desktop), bottom-center (mobile)
 */
const AppToaster = () => {
  const toastRef = useRef(null)
  const [position, setPosition] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640
      ? "bottom-center"
      : "bottom-left",
  )

  useEffect(() => {
    setGlobalToastRef(toastRef.current)

    const handleResize = () => {
      setPosition(window.innerWidth < 640 ? "bottom-center" : "bottom-left")
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      setGlobalToastRef(null)
    }
  }, [])

  return <Toast ref={toastRef} position={position} />
}

export default AppToaster
