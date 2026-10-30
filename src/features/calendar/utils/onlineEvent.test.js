import test from "node:test"
import assert from "node:assert/strict"
import { isValidMeetingUrl } from "./onlineEvent.js"

test("online events accept meeting URLs but reject addresses and unsafe schemes", () => {
  for (const value of ["https://meet.google.com/abc-defg-hij", " https://zoom.us/j/123?pwd=abc ", "http://example.com/meeting"]) {
    assert.equal(isValidMeetingUrl(value), true)
  }
  for (const value of ["", "123 Main Street", "javascript:alert(1)", "data:text/html,test", "https://"]) {
    assert.equal(isValidMeetingUrl(value), false)
  }
})
