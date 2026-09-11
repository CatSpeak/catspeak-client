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
