export const NEWS_SORT_OPTIONS = ["createDate", "viewCount", "reactionCount"]

export const isValidSort = (sort) => NEWS_SORT_OPTIONS.includes(sort)

export const DEFAULT_SORT = "createDate"

const normalizeSort = (sort) => (isValidSort(sort) ? sort : DEFAULT_SORT)

export const parseNewsFilter = (search) => {
  const params = new URLSearchParams(search)
  const searchKeyword = params.get("q") || ""
  const sortBy = normalizeSort(params.get("sort"))
  const allTopicValues = [
    ...params.getAll("topicIds"),
    ...params.getAll("topicId"),
  ]
  const topicIds = allTopicValues
    .flatMap((val) => val.split(","))
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id))

  const uniqueTopicIds = Array.from(new Set(topicIds))
  return { searchKeyword, sortBy, topicIds: uniqueTopicIds }
}

export const serializeNewsFilter = ({
  searchKeyword = "",
  sortBy = DEFAULT_SORT,
  topicIds = [],
}) => {
  const params = new URLSearchParams()
  if (searchKeyword) params.set("q", searchKeyword)
  const normalizedSort = normalizeSort(sortBy)
  if (normalizedSort !== DEFAULT_SORT) params.set("sort", normalizedSort)
  if (Array.isArray(topicIds) && topicIds.length > 0) {
    params.set("topicIds", topicIds.join(","))
  }
  const query = params.toString()
  return query ? `?${query}` : ""
}

export const applyNewsFilter = (currentParams, filters) => {
  const params = new URLSearchParams(currentParams)
  params.delete("q")
  params.delete("sort")
  params.delete("topicIds")
  params.delete("topicId")
  const serialized = serializeNewsFilter(filters)
  const extra = new URLSearchParams(serialized)
  for (const [key, value] of extra) params.set(key, value)
  return params
}