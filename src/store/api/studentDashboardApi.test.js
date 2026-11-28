import { describe, expect, it } from "vitest"
import { transformCommunity } from "./studentDashboardApi"

describe("ISS-13: learner dashboard community CTA targets", () => {
  it("points challenges, videos and articles at existing routes", () => {
    const data = transformCommunity({ data: {} })

    expect(data.challengesJoined.targetUrl).toBe("/workspace/reels")
    expect(data.publishedVideos.targetUrl).toBe("/workspace/reels")
    expect(data.publishedArticles.targetUrl).toBe("/workspace/profile?tab=home")
    expect(data.createdRooms.targetUrl).toBe("/workspace/rooms")
    expect(data.friends.targetUrl).toBe("/workspace/profile?tab=friends")
  })

  it("ignores the legacy /games and ?tab=posts destinations", () => {
    const data = transformCommunity({
      data: { participatedChallengesCount: 3, publishedPostsCount: 2 },
    })

    expect(data.challengesJoined.count).toBe(3)
    expect(data.challengesJoined.targetUrl).not.toBe("/games")
    expect(data.publishedArticles.targetUrl).not.toBe(
      "/workspace/profile?tab=posts",
    )
  })
})
