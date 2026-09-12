/**
 * Pure seam for the watch-together media unit wrapper (unit-testable).
 *
 * Mobile: the unit (video + toolbar + strip) centers vertically inside the
 * black container via `m-auto` — letterbox style, black wraps evenly
 * top/bottom instead of pooling below. When content outgrows the screen
 * (short viewport / many participants) auto margins collapse to zero and the
 * parent's overflow-y-auto takes over scrolling.
 * Desktop (`md:`): reset to zero margin, top-aligned light layout unchanged.
 */
export const getWatchMediaUnitClass = () => "m-auto w-full shrink-0 md:m-0"
