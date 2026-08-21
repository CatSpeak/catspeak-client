import { useState, useCallback } from 'react'

/**
 * Custom hook that encapsulates the filter modal open/close/apply pattern.
 * Eliminates the repeated filterOpen + filterOpenCount + handleApplyFilter
 * pattern found in CalendarTab, CalendarDayView, and DailyEventPanel.
 *
 * @param {Function} onApplyFilter - Callback from parent to apply the filter
 * @returns {{ filterOpen, filterOpenCount, openFilter, closeFilter, handleApplyFilter }}
 */
const useFilterModal = (onApplyFilter) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOpenCount, setFilterOpenCount] = useState(0)

  const openFilter = useCallback(() => {
    setFilterOpenCount(c => c + 1)
    setFilterOpen(true)
  }, [])

  const closeFilter = useCallback(() => {
    setFilterOpen(false)
  }, [])

  const handleApplyFilter = useCallback((selectedTypes) => {
    if (onApplyFilter) onApplyFilter(selectedTypes)
    setFilterOpen(false)
  }, [onApplyFilter])

  return { filterOpen, filterOpenCount, openFilter, closeFilter, handleApplyFilter }
}

export default useFilterModal
