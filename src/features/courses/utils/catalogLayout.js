/**
 * Pure layout-decision logic for the Explore catalog.
 * Kept dependency-free so node:test can run it without @/ alias resolution.
 */

/**
 * Whether a catalog item should render in "list" form given the current view mode.
 * In list mode EVERY item — course or standalone class — renders as a list row.
 * @param {{ isClassItem?: boolean }} item
 * @param {"grid" | "list"} viewMode
 * @returns {"grid" | "list"}
 */
export function resolveItemLayout(item, viewMode) {
  if (viewMode !== "list") return "grid"
  return "list"
}
