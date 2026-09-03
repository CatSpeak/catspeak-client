export const NEWS_SORT_OPTIONS = ["createDate", "viewCount", "reactionCount"]

export const isValidSort = (sort) => NEWS_SORT_OPTIONS.includes(sort)

export const DEFAULT_SORT = "createDate"

const normalizeSort = (sort) => (isValidSort(sort) ? sort : DEFAULT_SORT)

export const parseNewsFilter = (search) => {
  const params = new URLSearchParams(search)
  const searchKeyword = params.get("q") || ""
  const sortBy = normalizeSort(params.get("sort"))
  return { searchKeyword, sortBy }
}

export const serializeNewsFilter = ({ searchKeyword = "", sortBy = DEFAULT_SORT }) => {
  const params = new URLSearchParams()
  if (searchKeyword) params.set("q", searchKeyword)
  const normalizedSort = normalizeSort(sortBy)
  if (normalizedSort !== DEFAULT_SORT) params.set("sort", normalizedSort)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export const applyNewsFilter = (currentParams, filters) => {
  const params = new URLSearchParams(currentParams)
  params.delete("q")
  params.delete("sort")
  const serialized = serializeNewsFilter(filters)
  const extra = new URLSearchParams(serialized)
  for (const [key, value] of extra) params.set(key, value)
  return params
}