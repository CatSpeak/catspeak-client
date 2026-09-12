export const VIDEO_TILE_MIN_HEIGHT_CLASS = "min-h-[100px]"

const VIDEO_TILE_ROOT_BASE =
  "group relative h-full w-full overflow-hidden rounded-xl transition-all duration-200 ease-in-out [container-type:inline-size]"

/**
 * Pure class seam for the VideoTile root (unit-testable, single source of
 * truth for the static part of the root className).
 *
 * `compact` is for small tiles (watch-together strip): it drops the
 * min-h-[100px] floor so a short wrapper no longer clips the card (H2), and
 * the strip pairs it with a 16:9 wrapper so the avatar/overlay fit (H3).
 */
export const getVideoTileRootClass = ({
  compact = false,
  isVideoVisible = false,
  clickable = false,
} = {}) => {
  const minHeight = compact ? "min-h-0" : VIDEO_TILE_MIN_HEIGHT_CLASS
  return (
    `${VIDEO_TILE_ROOT_BASE} ${minHeight}` +
    (isVideoVisible ? " bg-neutral-900" : "") +
    (clickable ? " cursor-pointer" : "")
  )
}

// ── Compact content seams (avatar + bottom overlay) ──────────────────────
// Geometry of the strip tile: h-20 w-36 → 144×80. The avatar is vertically
// centered; the name pill is absolutely positioned at the bottom. The card
// is only healthy when the pill's top edge clears the avatar's bottom edge.

export const COMPACT_TILE_HEIGHT_PX = 80
export const COMPACT_AVATAR_PX = 32
export const COMPACT_OVERLAY_HEIGHT_PX = 20
export const COMPACT_OVERLAY_MARGIN_PX = 4

const FULL_AVATAR_CLASS =
  "!w-[20cqi] !h-[20cqi] !max-w-[128px] !max-h-[128px] !min-w-[48px] !min-h-[48px] !text-[clamp(0.875rem,8cqi,2rem)] !border-none"
const FULL_OVERLAY_BAR_CLASS =
  "absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none z-20"
const FULL_OVERLAY_PILL_CLASS =
  "flex min-w-0 items-center gap-1 sm:gap-1.5 rounded-full bg-black/40 px-2 py-1 sm:px-3 sm:py-2 text-white backdrop-blur-sm pointer-events-auto"
const FULL_OVERLAY_NAME_CLASS = "min-w-0 truncate font-medium text-xs sm:text-sm"
const COMPACT_AVATAR_CLASS =
  "!w-[32px] !h-[32px] !min-w-[32px] !min-h-[32px] !max-w-[32px] !max-h-[32px] !text-xs !border-none"
const COMPACT_OVERLAY_BAR_CLASS =
  "absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1 pointer-events-none z-20"
const COMPACT_OVERLAY_PILL_CLASS =
  "flex min-w-0 items-center gap-1 rounded-full bg-black/40 px-1.5 py-0.5 text-white backdrop-blur-sm pointer-events-auto"
const COMPACT_OVERLAY_NAME_CLASS = "min-w-0 truncate font-medium text-[10px]"

/**
 * Compact values (H3): 32px avatar + ~20px pill + 4px margin inside the
 * 80px tile → pill-top (56) clears avatar-bottom (56). Full-size values
 * below stay untouched for grid layouts.
 */
export const getVideoTileAvatarSize = ({ compact = false } = {}) =>
  compact ? COMPACT_AVATAR_PX : 64

export const getVideoTileAvatarClass = ({ compact = false } = {}) =>
  compact ? COMPACT_AVATAR_CLASS : FULL_AVATAR_CLASS

export const getVideoTileOverlayBarClass = ({ compact = false } = {}) =>
  compact ? COMPACT_OVERLAY_BAR_CLASS : FULL_OVERLAY_BAR_CLASS

export const getVideoTileOverlayPillClass = ({ compact = false } = {}) =>
  compact ? COMPACT_OVERLAY_PILL_CLASS : FULL_OVERLAY_PILL_CLASS

export const getVideoTileOverlayNameClass = ({ compact = false } = {}) =>
  compact ? COMPACT_OVERLAY_NAME_CLASS : FULL_OVERLAY_NAME_CLASS

export const getCompactGeometry = () => ({
  tileH: COMPACT_TILE_HEIGHT_PX,
  avatarPx: COMPACT_AVATAR_PX,
  overlayH: COMPACT_OVERLAY_HEIGHT_PX,
  overlayMargin: COMPACT_OVERLAY_MARGIN_PX,
})

/** Pill top edge must clear the centered avatar's bottom edge. */
export const tileContentFits = ({ tileH, avatarPx, overlayH, overlayMargin }) =>
  tileH - overlayMargin - overlayH >= tileH / 2 + avatarPx / 2
