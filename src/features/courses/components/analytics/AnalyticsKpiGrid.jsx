import React from "react"
import AnalyticsKpiCard from "./AnalyticsKpiCard"

const AnalyticsKpiGrid = ({ items = [], cols = 5 }) => {
  const gridColsClass =
    cols === 6
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 mb-4"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 mb-4"

  return (
    <div className={gridColsClass}>
      {items.map((item, index) => (
        <AnalyticsKpiCard
          key={index}
          label={item.label}
          value={item.value}
          delta={item.delta}
          tone={item.tone}
          note={item.note}
        />
      ))}
    </div>
  )
}

export default AnalyticsKpiGrid
