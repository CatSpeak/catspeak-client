/**
 * Checks if the API server is reachable and running.
 * This polls the GET /api/health endpoint.
 *
 * @returns {Promise<boolean>} True if the server is reachable (Status 200, 503 health response, etc.).
 *                             False if the server is down or unreachable (network error, 502/504 gateway timeout).
 */
export async function checkIsServerHealthy(retries = 2, delayMs = 1000) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api"
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${normalizedBaseUrl}/health`)

      // If server responded with 200-499 or 503 (ASP.NET Health Checks return 503 when probes are unhealthy/degraded while server is online),
      // the server is reachable and active.
      if (
        response.ok ||
        response.status === 503 ||
        (response.status >= 200 && response.status < 500)
      ) {
        try {
          const data = await response.json()
          if (
            data &&
            (data.status === "Healthy" ||
              data.status === "Degraded" ||
              data.status === "Unhealthy")
          ) {
            return true
          }
        } catch {
          // If response body is not JSON or custom structure, HTTP status still proves server is reachable
          return true
        }
        return true
      }
    } catch (error) {
      // Network error, CORS error, or server unreachable
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return false
}
