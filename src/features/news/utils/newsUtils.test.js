import test from "node:test"
import assert from "node:assert/strict"

import {
  COMMUNITY_LANGUAGE_IDS,
  getCommunityName,
  getCommunityLanguageId,
  getCommunityCode,
  hasJapaneseKana,
  hasCjkIdeographs,
  isLikelyChineseText,
  isPostInCommunity,
} from "./newsUtils.js"

test("getCommunityLanguageId normalizes various inputs", () => {
  assert.equal(getCommunityLanguageId(0), 0)
  assert.equal(getCommunityLanguageId("0"), 0)
  assert.equal(getCommunityLanguageId("all"), 0)
  assert.equal(getCommunityLanguageId("All"), 0)

  assert.equal(getCommunityLanguageId(1), 1)
  assert.equal(getCommunityLanguageId("1"), 1)
  assert.equal(getCommunityLanguageId("en"), 1)
  assert.equal(getCommunityLanguageId("English"), 1)

  assert.equal(getCommunityLanguageId(2), 2)
  assert.equal(getCommunityLanguageId("2"), 2)
  assert.equal(getCommunityLanguageId("zh"), 2)
  assert.equal(getCommunityLanguageId("cn"), 2)
  assert.equal(getCommunityLanguageId("chinese"), 2)
  assert.equal(getCommunityLanguageId("Chinese"), 2)

  assert.equal(getCommunityLanguageId(3), 3)
  assert.equal(getCommunityLanguageId("3"), 3)
  assert.equal(getCommunityLanguageId("ja"), 3)
  assert.equal(getCommunityLanguageId("jp"), 3)
  assert.equal(getCommunityLanguageId("japanese"), 3)
  assert.equal(getCommunityLanguageId("Japanese"), 3)
})

test("getCommunityName converts code or id safely", () => {
  assert.equal(getCommunityName(3), "Japanese")
  assert.equal(getCommunityName("3"), "Japanese")
  assert.equal(getCommunityName("ja"), "Japanese")

  assert.equal(getCommunityName(2), "Chinese")
  assert.equal(getCommunityName("2"), "Chinese")
  assert.equal(getCommunityName("zh"), "Chinese")

  assert.equal(getCommunityName(1), "English")
  assert.equal(getCommunityName("1"), "English")
  assert.equal(getCommunityName("en"), "English")

  assert.equal(getCommunityName(0), "All")
  assert.equal(getCommunityName("0"), "All")
  assert.equal(getCommunityName("all"), "All")

  assert.equal(getCommunityName("vi"), "Vietnamese")
  assert.equal(getCommunityName(null), "English")
})

test("detects Japanese kana and Chinese CJK text", () => {
  assert.equal(hasJapaneseKana("こんにちは"), true)
  assert.equal(hasJapaneseKana("カタカナ"), true)
  assert.equal(hasJapaneseKana("日本語のテスト"), true)
  assert.equal(hasJapaneseKana("中文测试"), false)
  assert.equal(hasJapaneseKana("English test"), false)

  assert.equal(hasCjkIdeographs("中文测试"), true)
  assert.equal(hasCjkIdeographs("日本語"), true)
  assert.equal(hasCjkIdeographs("Hello"), false)

  assert.equal(isLikelyChineseText("中文测试学习汉语"), true)
  assert.equal(isLikelyChineseText("日本語のテスト"), false)
  assert.equal(isLikelyChineseText("English"), false)
})

test("isPostInCommunity handles Japanese community (3)", () => {
  // 1. Japanese post with explicit languageCommunity: "Japanese"
  assert.equal(
    isPostInCommunity(
      { postId: 1, title: "Title", languageCommunity: "Japanese", privacy: "Public" },
      "ja",
    ),
    true,
  )

  // 2. Chinese post with explicit languageCommunity: "Chinese" -> REJECTED in ja
  assert.equal(
    isPostInCommunity(
      { postId: 2, title: "Title", languageCommunity: "Chinese", privacy: "Public" },
      "ja",
    ),
    false,
  )

  // 3. Chinese post with numeric languageCommunity: 2 -> REJECTED in ja
  assert.equal(
    isPostInCommunity(
      { postId: 3, title: "Title", languageCommunity: 2, privacy: "Public" },
      "ja",
    ),
    false,
  )

  // 4. Post with languageCommunity: null but Chinese topic -> REJECTED in ja
  assert.equal(
    isPostInCommunity(
      {
        postId: 4,
        title: "Some post",
        languageCommunity: null,
        privacy: "Public",
        topics: [{ topicId: 10, languageCommunity: 2 }],
      },
      "ja",
    ),
    false,
  )

  // 5. Post with languageCommunity: "All" but Chinese topic -> REJECTED in ja
  assert.equal(
    isPostInCommunity(
      {
        postId: 5,
        title: "Some post",
        languageCommunity: "All",
        privacy: "Public",
        topics: [{ topicId: 10, languageCommunity: 2 }],
      },
      "ja",
    ),
    false,
  )

  // 6. Post with languageCommunity: "All" but Chinese CJK text without Kana -> REJECTED in ja
  assert.equal(
    isPostInCommunity(
      {
        postId: 6,
        title: "猫语社区最新通知发布",
        excerpt: "欢迎来到猫语学习平台",
        languageCommunity: "All",
        privacy: "Public",
      },
      "ja",
    ),
    false,
  )

  // 7. Post with languageCommunity: null but Japanese text with Kana -> ACCEPTED in ja
  assert.equal(
    isPostInCommunity(
      {
        postId: 7,
        title: "最新のニュースをお知らせします",
        languageCommunity: null,
        privacy: "Public",
      },
      "ja",
    ),
    true,
  )

  // 8. Post with languageCommunity: null and Chinese CJK text -> REJECTED in ja
  assert.equal(
    isPostInCommunity(
      {
        postId: 8,
        title: "猫语新闻发布",
        languageCommunity: null,
        privacy: "Public",
      },
      "ja",
    ),
    false,
  )

  // 9. Post with non-public privacy -> REJECTED
  assert.equal(
    isPostInCommunity(
      { postId: 9, title: "私有", languageCommunity: "Japanese", privacy: "Private" },
      "ja",
    ),
    false,
  )

  // 10. Universal post with languageCommunity: "All" and neutral English text -> ACCEPTED in ja
  assert.equal(
    isPostInCommunity(
      {
        postId: 10,
        title: "System Maintenance Announcement",
        languageCommunity: "All",
        privacy: "Public",
      },
      "ja",
    ),
    true,
  )
})
