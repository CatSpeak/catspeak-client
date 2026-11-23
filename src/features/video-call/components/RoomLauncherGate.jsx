import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { Apple, Download, Loader2, Monitor, ShieldAlert } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useCreateDesktopLaunchCodeMutation,
  useGetDesktopLatestReleaseQuery,
} from "@/store/api/authApi"
import { selectIsAuthenticated } from "@/store/slices/authSlice"
import { MainLogo, MainLogoDark } from "@/shared/assets/icons/logo"
import { buildHandoffDeepLink } from "../utils/desktopHandoff"
import {
  detectDesktopPlatform,
  getJoinPreference,
  getProtocolScheme,
  isCatspeakDesktop,
  isMobileDevice,
  setJoinPreference,
  shouldShowDesktopLauncher,
} from "../utils/desktopBridge"

const DOWNLOAD_KEYS = ["win-x64", "mac-arm64", "mac-x64"]

const LABEL_BY_PLATFORM = {
  "win-x64": "downloadWindows",
  "mac-arm64": "downloadMacArm",
  "mac-x64": "downloadMacIntel",
}

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return null
  const mb = bytes / (1024 * 1024)
  return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`
}

/**
 * Web launcher shown on `/:lang/meet/:id`.
 *
 * Renders the room directly for the Electron app, mobile browsers, AI /
 * learning-path rooms, `?web=1` links and users who remembered the web.
 * Otherwise it offers the environment-correct desktop installer, macOS Intel
 * as a secondary link, Beta install guidance and "Join in browser".
 *
 * Ticket 06 owns the launch-code handoff: the primary action requests a fresh
 * one-time code and opens `${scheme}://join?roomId=...&lang=...&code=...`.
 * The first launcher session also auto-attempts that deep link once, after the
 * release payload (and therefore the environment scheme) is available.
 */
const RoomLauncherGate = ({ children, onOpenDesktop }) => {
  const { lang, id: roomId } = useParams()
  const location = useLocation()
  const { t } = useLanguage()
  const isSignedIn = useSelector(selectIsAuthenticated)

  const [preference] = useState(() => getJoinPreference())
  const [rememberChoice, setRememberChoice] = useState(false)
  const [forceBrowser, setForceBrowser] = useState(false)
  const [isOpeningDesktop, setIsOpeningDesktop] = useState(false)
  const [openError, setOpenError] = useState(null)
  const autoAttemptedRef = useRef(false)
  const openingRef = useRef(false)
  const [createLaunchCode] = useCreateDesktopLaunchCodeMutation()

  const showLauncher = useMemo(
    () =>
      shouldShowDesktopLauncher({
        roomId,
        search: location.search,
        isDesktop: isCatspeakDesktop(),
        isMobile: isMobileDevice(),
        preference,
        isSignedIn,
      }),
    [roomId, location.search, preference, isSignedIn],
  )

  const { data: release, isLoading, isError } =
    useGetDesktopLatestReleaseQuery(undefined, { skip: !showLauncher })

  const platform = useMemo(() => detectDesktopPlatform(), [])
  const scheme = getProtocolScheme(release)
  const downloads = release?.downloads || {}
  const copy = t.rooms?.desktopLauncher || {}

  const requestLaunchCode = useCallback(
    async ({ silent }) => {
      if (!roomId || !lang || openingRef.current) return
      openingRef.current = true
      if (!silent) {
        setIsOpeningDesktop(true)
        setOpenError(null)
      }

      try {
        const result = await createLaunchCode({ roomId, lang }).unwrap()
        if (!result?.code) throw new Error("Desktop launch code missing")
        const url = buildHandoffDeepLink({
          release,
          roomId,
          lang,
          code: result.code,
        })
        if (typeof onOpenDesktop === "function") {
          onOpenDesktop({ scheme, roomId, lang, release, code: result.code, url })
        } else if (typeof window !== "undefined") {
          window.location.href = url
        }
      } catch (error) {
        // The automatic attempt stays quiet unless the account is throttled.
        if (!silent || error?.status === 429) {
          setOpenError(error?.status === 429 ? "rateLimited" : "failed")
        }
      } finally {
        openingRef.current = false
        if (!silent) setIsOpeningDesktop(false)
      }
    },
    [createLaunchCode, lang, onOpenDesktop, release, roomId, scheme],
  )

  useEffect(() => {
    if (!showLauncher || forceBrowser || !release) return
    if (autoAttemptedRef.current) return
    autoAttemptedRef.current = true
    requestLaunchCode({ silent: true })
  }, [forceBrowser, release, requestLaunchCode, showLauncher])

  if (!showLauncher || forceBrowser) return children

  const isMac = platform === "mac-arm64" || platform === "mac-x64"
  const primaryKey =
    platform === "win-x64" ? "win-x64" : isMac ? "mac-arm64" : null
  const primaryDownload = primaryKey ? downloads[primaryKey] : null
  const intelDownload = isMac ? downloads["mac-x64"] : null
  const shownKeys = [
    primaryDownload ? primaryKey : null,
    intelDownload ? "mac-x64" : null,
  ].filter(Boolean)
  const otherKeys = DOWNLOAD_KEYS.filter(
    (key) => Boolean(downloads[key]?.url) && !shownKeys.includes(key),
  )

  const rememberIfNeeded = (nextPreference) => {
    if (rememberChoice) setJoinPreference(nextPreference)
  }

  const handleJoinInBrowser = () => {
    rememberIfNeeded("web")
    setForceBrowser(true)
  }

  const handleOpenDesktop = () => {
    rememberIfNeeded("desktop")
    requestLaunchCode({ silent: false })
  }

  const renderDownloadLink = (key, isPrimary) => {
    const download = downloads[key]
    if (!download?.url) return null

    const label = copy[LABEL_BY_PLATFORM[key]] || copy.downloadGeneric
    const size = formatSize(download.sizeBytes)
    const className = isPrimary
      ? "flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-transparent bg-cath-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cath-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1A1A1A]"
      : "flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primaryBg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-500 focus-visible:ring-offset-2 dark:border-[#3F3F3F] dark:bg-[#272727] dark:text-neutral-200 dark:hover:bg-[#3D3D3D] dark:focus-visible:ring-offset-[#1A1A1A]"

    return (
      <a
        key={key}
        href={download.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {key.startsWith("mac") ? (
          <Apple size={20} className="shrink-0" />
        ) : (
          <Monitor size={20} className="shrink-0" />
        )}
        <span className="truncate">{label}</span>
        {size && (
          <span
            className={
              isPrimary
                ? "shrink-0 text-xs text-white/80"
                : "shrink-0 text-xs text-secondary dark:text-[#AAAAAA]"
            }
          >
            {size}
          </span>
        )}
      </a>
    )
  }

  return (
    <div className="h-[100dvh] w-full overflow-y-auto bg-primaryBg text-foreground transition-colors dark:bg-[#0F0F0F] dark:text-white">
      <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-col justify-center px-4 py-8">
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-white p-6 shadow-xl dark:border-darkBorder dark:bg-[#1A1A1A] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <img src={MainLogo} alt="Catspeak" className="h-8 w-auto dark:hidden" />
            <img
              src={MainLogoDark}
              alt="Catspeak"
              className="hidden h-8 w-auto dark:block"
            />
            <span className="rounded-full bg-cath-red-700/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cath-red-700 dark:bg-red-950/40 dark:text-red-400">
              {copy.betaBadge}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold leading-tight text-foreground dark:text-white">
              {copy.title}
            </h1>
            <p className="text-[15px] leading-relaxed text-secondary dark:text-[#AAAAAA]">
              {copy.subtitle}
            </p>
            {release?.version && (
              <p className="text-sm font-medium text-foreground dark:text-neutral-200">
                {(copy.version || "").replace("{{version}}", release.version)}
              </p>
            )}
          </div>

          {isLoading && !release && (
            <div className="flex items-center gap-2 text-sm text-secondary dark:text-[#AAAAAA]">
              <Loader2 size={16} className="animate-spin" />
              <span>{copy.loadingRelease}</span>
            </div>
          )}

          {(isError || (!isLoading && !release)) && (
            <p
              role="alert"
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
            >
              {copy.releaseUnavailable}
            </p>
          )}

          {(primaryDownload || otherKeys.length > 0) && (
            <div className="flex flex-col gap-2">
              {primaryDownload && renderDownloadLink(primaryKey, true)}
              {intelDownload && renderDownloadLink("mac-x64", false)}
              {otherKeys.map((key) => renderDownloadLink(key, false))}
            </div>
          )}

          <PillButton
            variant="secondary"
            className="w-full"
            startIcon={<Download size={20} />}
            loading={isOpeningDesktop}
            loadingText={copy.openingDesktop}
            onClick={handleOpenDesktop}
          >
            {copy.openDesktop}
          </PillButton>

          {openError && (
            <p
              role="alert"
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
            >
              {openError === "rateLimited"
                ? copy.openDesktopRateLimited
                : copy.openDesktopFailed}
            </p>
          )}

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
              <ShieldAlert size={18} className="shrink-0" />
              <span>{copy.betaTitle}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">
              {copy.betaNote}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/80">
              {!isMac && <li>{copy.betaWindows}</li>}
              {isMac && <li>{copy.betaMac}</li>}
              {!platform && <li>{copy.betaMac}</li>}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 dark:border-darkBorder">
            <PillButton
              variant="outline"
              className="w-full"
              onClick={handleJoinInBrowser}
            >
              {copy.joinInBrowser}
            </PillButton>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground dark:text-neutral-200">
              <input
                type="checkbox"
                checked={rememberChoice}
                onChange={(event) => setRememberChoice(event.target.checked)}
                className="h-4 w-4 rounded border-border accent-cath-red-700 dark:border-[#3F3F3F]"
              />
              <span>{copy.rememberChoice}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomLauncherGate
