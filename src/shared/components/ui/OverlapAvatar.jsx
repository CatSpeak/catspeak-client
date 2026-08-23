import React from "react"
import Avatar from "./Avatar"

/**
 * OverlapAvatar component — displays a stacked/overlapping list of user avatars.
 * If the number of avatars exceeds `maxShow`, a "+N" overflow badge is displayed.
 *
 * @param {Array<{id?: number|string, name?: string, avatarUrl?: string, avatar?: string}>} [users] - List of users/items
 * @param {Array}  [items]           - Alias for users
 * @param {Array}  [avatars]         - Alias for users
 * @param {number} [maxShow=3]       - Maximum number of avatars to render before showing "+N"
 * @param {number|string} [size=24]  - Avatar size in pixels or named sizes ('sm', 'md', 'lg')
 * @param {string} [className]       - Additional classes for the container
 */
const OverlapAvatar = ({
  users,
  items,
  avatars,
  students,
  data,
  maxShow = 3,
  size = 24,
  className = "",
}) => {
  const rawList = Array.isArray(users)
    ? users
    : Array.isArray(students)
      ? students
      : Array.isArray(items)
        ? items
        : Array.isArray(avatars)
          ? avatars
          : Array.isArray(data)
            ? data
            : []

  const list = rawList.filter(Boolean)

  if (list.length === 0) {
    return null
  }

  const numericSize =
    typeof size === "number"
      ? size
      : size === "sm"
        ? 32
        : size === "md"
          ? 40
          : size === "lg"
            ? 48
            : parseInt(size, 10) || 24

  const limit = Math.max(1, Number(maxShow) || 3)
  const visibleItems = list.slice(0, limit)
  const remainingCount = list.length - limit

  const fontSize = Math.max(9, Math.round(numericSize * 0.38))

  return (
    <div className={`inline-flex items-center -space-x-2 shrink-0 ${className}`}>
      {visibleItems.map((item, index) => {
        const key = item.id ?? item.accountId ?? item.userId ?? index
        const name = item.name ?? item.fullName ?? item.studentName ?? ""
        const avatarUrl =
          item.avatarUrl ?? item.avatar ?? item.avatarImageUrl ?? item.src ?? null

        return (
          <div
            key={key}
            className="relative rounded-full ring-2 ring-white dark:ring-zinc-900 shrink-0 overflow-hidden"
            style={{ zIndex: index + 1 }}
          >
            <Avatar
              size={numericSize}
              src={avatarUrl}
              name={name}
            />
          </div>
        )
      })}

      {remainingCount > 0 && (
        <div
          className="relative flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-900 shrink-0"
          style={{
            width: `${numericSize}px`,
            height: `${numericSize}px`,
            minWidth: `${numericSize}px`,
            minHeight: `${numericSize}px`,
            fontSize: `${fontSize}px`,
            zIndex: limit + 1,
          }}
          title={`+${remainingCount}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

export default OverlapAvatar
