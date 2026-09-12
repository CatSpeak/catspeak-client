/**
 * Pure seam for the watch-together media unit wrapper (unit-testable).
 *
 * Single centered column (max-w-5xl) holding one light card
 * (video + toolbar) plus the participant strip below. Mobile: the unit
 * centers vertically inside the container via `m-auto` — letterbox style,
 * black wraps evenly top/bottom instead of pooling below. When content
 * outgrows the screen (short viewport / many participants) auto margins
 * collapse to zero and the parent's overflow-y-auto takes over scrolling.
 * Desktop (`md:`): reset to zero margin, top-aligned layout unchanged.
 */
export const getWatchMediaUnitClass = () =>
  "m-auto flex w-full max-w-5xl shrink-0 flex-col gap-3 md:m-0 md:mx-auto"
