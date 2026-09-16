import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { CO_HOST_ALL } from "./constants.js"
import en from "../../shared/i18n/locales/en/components/rooms.js"
import ja from "../../shared/i18n/locales/ja/components/rooms.js"
import vi from "../../shared/i18n/locales/vi/components/rooms.js"
import zh from "../../shared/i18n/locales/zh/components/rooms.js"

const LOCALES = { en, ja, vi, zh }
const MAPS = [
  "permissions",
  "permissionsRoom",
  "permissionHelpers",
  "permissionHelpersRoom",
]

test("every locale translates every co-host code in all four maps", () => {
  for (const [lang, messages] of Object.entries(LOCALES)) {
    const coHost = messages?.coHost
    assert.ok(coHost, `${lang} has coHost`)
    for (const map of MAPS) {
      assert.ok(coHost[map], `${lang} has coHost.${map}`)
      for (const code of CO_HOST_ALL) {
        assert.ok(coHost[map][code], `${lang}.${map}.${code} is missing`)
      }
    }
  }
})

test("every locale names all three permission groups in both scopes", () => {
  for (const [lang, messages] of Object.entries(LOCALES)) {
    const coHost = messages?.coHost
    for (const id of ["student_management", "member_moderation", "room_security"]) {
      assert.ok(coHost.groups?.[id], `${lang}.groups.${id} is missing`)
    }
    assert.ok(coHost.groupStudentManagementRoom, `${lang}.groupStudentManagementRoom`)
    assert.ok(coHost.groupMemberModerationRoom, `${lang}.groupMemberModerationRoom`)
    assert.ok(coHost.groupRoomSecurity, `${lang}.groupRoomSecurity`)
  }
})
