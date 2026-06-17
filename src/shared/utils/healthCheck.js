/**
 * Checks if the API server and its dependencies are healthy.
 * This polls the GET /api/health endpoint.
 * 
 * @returns {Promise<boolean>} True if the server is healthy (Status 200, "Healthy" body).
 *                             False if the server is down, unreachable, or unhealthy (e.g. 502/503).
 */
export async function checkIsServerHealthy() {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api"
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const response = await fetch(`${normalizedBaseUrl}/health`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.status === "Healthy") {
        return true
      }
    }
    return false
  } catch (error) {
    // Network error, CORS error, or server unreachable
    return false
  }
}
