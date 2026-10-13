/**
 * Serializes an object of query parameters for fetchBaseQuery.
 * Ensures arrays are serialized as repeated parameters (`topicIds=1&topicIds=2`)
 * which aligns with ASP.NET Core model binding, rather than comma-separated strings (`topicIds=1,2`).
 *
 * @param {Record<string, any>} params
 * @returns {string} Serialized query string without leading '?'
 */
export const defaultParamsSerializer = (params) => {
  if (!params || typeof params !== "object") return ""

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item))
        }
      })
    } else {
      searchParams.append(key, String(value))
    }
  }

  return searchParams.toString()
}
