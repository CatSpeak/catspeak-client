import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useExchangeDesktopLaunchCodeMutation } from "@/store/api/authApi"
import { setCredentials } from "@/store/slices/authSlice"
import { MainLogo, MainLogoDark } from "@/shared/assets/icons/logo"
import {
  HANDOFF_ERROR_KINDS,
  HANDOFF_ROOM_ID_PATTERN,
  classifyHandoffError,
  getHandoffErrorMeta,
  isRetryableHandoffError,
  parseHandoffSearch,
  runHandoffExchangeOnce,
} from "../utils/desktopHandoff"

const Spinner = ({ label }) => (
  <div className="flex flex-col items-center gap-4 py-6 text-center">
    <Loader2 size={32} className="animate-spin text-cath-red-700 dark:text-red-400" />
    <p className="text-sm text-secondary dark:text-[#AAAAAA]">{label}</p>
  </div>
)

/**
 * Public `/desktop/handoff` landing page used by the one-time launch code.
 * Exchanges the code exactly once (React StrictMode + single-flight safe),
 * stores the returned credentials and continues to the room, where the normal
 * WaitingScreen handles camera/microphone/password/waiting-room checks.
 */
const DesktopAuthHandoffPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const copy = t.rooms?.desktopHandoff || {}

  const parsed = useMemo(
    () => parseHandoffSearch(location.search),
    [location.search],
  )

  const [status, setStatus] = useState(parsed.valid ? "exchanging" : "error")
  const [errorKind, setErrorKind] = useState(
    parsed.valid ? null : HANDOFF_ERROR_KINDS.invalid,
  )
  const handledCodeRef = useRef(null)
  const mountedRef = useRef(true)
  const [exchangeLaunchCode] = useExchangeDesktopLaunchCodeMutation()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const retry = useCallback(async () => {
    if (!parsed.valid || !mountedRef.current) return
    setStatus("exchanging")
    setErrorKind(null)

    try {
      const auth = await runHandoffExchangeOnce(parsed.code, () =>
        exchangeLaunchCode({ code: parsed.code }).unwrap(),
      )
      dispatch(setCredentials(auth))
      if (mountedRef.current) {
        setStatus("success")
        navigate(`/${parsed.lang}/meet/${parsed.roomId}`, { replace: true })
      }
    } catch (error) {
      if (!mountedRef.current) return
      setErrorKind(classifyHandoffError(error))
      setStatus("error")
    }
  }, [dispatch, exchangeLaunchCode, navigate, parsed])

  useEffect(() => {
    if (!parsed.valid) return
    if (handledCodeRef.current === parsed.code) return
    handledCodeRef.current = parsed.code
    // Defer so the effect does not synchronously cascade a state update; the
    // ref still guarantees a single automatic exchange per code (StrictMode).
    void Promise.resolve().then(retry)
  }, [parsed.code, parsed.valid, retry])

  const hasValidRoom =
    parsed.roomId && HANDOFF_ROOM_ID_PATTERN.test(parsed.roomId)
  const roomHref = hasValidRoom
    ? `/${parsed.lang}/meet/${parsed.roomId}`
    : `/${parsed.lang}/community`

  const meta = getHandoffErrorMeta(errorKind)
  const isBusy = status === "exchanging"
  const showRetry = parsed.valid && status === "error"
  const showBackToRoom = hasValidRoom

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-primaryBg px-4 py-8 text-foreground transition-colors dark:bg-[#0F0F0F] dark:text-white">
      <div className="w-full max-w-[480px] rounded-3xl border border-border bg-white p-6 shadow-xl dark:border-darkBorder dark:bg-[#1A1A1A] sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <img src={MainLogo} alt="Catspeak" className="h-8 w-auto dark:hidden" />
          <img
            src={MainLogoDark}
            alt="Catspeak"
            className="hidden h-8 w-auto dark:block"
          />
          <span className="rounded-full bg-cath-red-700/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cath-red-700 dark:bg-red-950/40 dark:text-red-400">
            {copy.badge}
          </span>
        </div>

        <h1 className="text-xl font-bold leading-tight text-foreground dark:text-white">
          {copy.title}
        </h1>

        {isBusy && (
          <div className="mt-4">
            <Spinner label={copy.exchanging} />
          </div>
        )}

        {status === "success" && (
          <div className="mt-4">
            <Spinner label={copy.redirecting} />
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  {copy[meta.titleKey]}
                </p>
                <p className="text-xs leading-relaxed text-red-700/90 dark:text-red-200/80">
                  {copy[meta.messageKey]}
                </p>
              </div>
            </div>

            {showRetry && (
              <PillButton
                variant="primary"
                className="w-full"
                startIcon={<RefreshCw size={18} />}
                onClick={retry}
              >
                {copy.retry}
              </PillButton>
            )}

            <Link
              to={roomHref}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primaryBg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-500 dark:border-[#3F3F3F] dark:bg-[#272727] dark:text-neutral-200 dark:hover:bg-[#3D3D3D]"
            >
              <ArrowLeft size={18} />
              {showBackToRoom ? copy.backToRoom : copy.backToHome}
            </Link>

            {parsed.valid && !isRetryableHandoffError(errorKind) && (
              <p className="text-center text-xs text-secondary dark:text-[#AAAAAA]">
                {copy.newCodeHint}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DesktopAuthHandoffPage
