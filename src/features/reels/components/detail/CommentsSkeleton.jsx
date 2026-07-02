import React from "react"

/**
 * Premium shimmer skeleton loading block for comments.
 */
const CommentsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-3" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex gap-2 items-start transition-colors duration-200 rounded-lg hover:bg-black/5" style={{ gap: "12px", padding: "4px 0" }}>
          {/* Avatar Skeleton */}
          <div
            className="rounded-2xl bg-gray-200 animate-pulse"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              flexShrink: 0
            }}
          />
          {/* Details Skeleton */}
          <div className="flex-1 min-w-0 flex flex-col gap-[2px]" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Nickname Skeleton */}
              <div
                className="rounded-2xl bg-gray-200 animate-pulse"
                style={{
                  width: "90px",
                  height: "14px",
                  borderRadius: "4px"
                }}
              />
              {/* Time Skeleton */}
              <div
                className="rounded-2xl bg-gray-200 animate-pulse"
                style={{
                  width: "40px",
                  height: "12px",
                  borderRadius: "4px",
                  marginLeft: "auto"
                }}
              />
            </div>
            {/* Content line 1 Skeleton */}
            <div
              className="rounded-2xl bg-gray-200 animate-pulse"
              style={{
                width: "90%",
                height: "14px",
                borderRadius: "4px",
                marginTop: "2px"
              }}
            />
            {/* Content line 2 Skeleton */}
            <div
              className="rounded-2xl bg-gray-200 animate-pulse"
              style={{
                width: "70%",
                height: "14px",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentsSkeleton
