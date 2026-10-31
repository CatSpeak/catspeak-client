/* eslint import/no-unresolved: ["error", { ignore: ["^node:"] }] */
import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { transform } from "esbuild"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

const require = createRequire(import.meta.url)
let fixture
const labels = {
  enrollmentAccessNotice: "Access has not been confirmed",
  recheckEnrollment: "Check status again",
  viewEnrollmentDetails: "View enrollment details",
  classLoadFailed: "Failed to load class",
}
const source = await readFile(new URL("./StudentClassDetailPage.jsx", import.meta.url), "utf8")
const { code } = await transform(source, { loader: "jsx", format: "cjs", jsx: "automatic" })
const compiled = { exports: {} }
const Empty = () => null
new Function("require", "module", "exports", code)((name) => {
  if (name === "react") return {
    ...require(name),
    lazy: () => () => createElement("div", null, "Private classroom content"),
  }
  if (name === "react/jsx-runtime") return require(name)
  if (name === "react-router-dom") return {
    useParams: () => ({ id: "17" }),
    useNavigate: () => () => {},
    useSearchParams: () => [new URLSearchParams(fixture.search), () => {}],
  }
  if (name === "react-hot-toast") return {
    toast: { error: (message, options) => fixture.toasts.push({ message, options }) },
  }
  if (name === "@/store/api/coursesApi") return {
    useGetStudentClassDetailQuery: (id, options) => {
      fixture.queryOptions = options
      return { currentData: fixture.data, refetch: () => {}, ...fixture.query }
    },
    useEnrollInCourseMutation: () => [() => {}, {}],
  }
  if (name === "@/store/api/userApi") return { useGetUserProfileQuery: () => ({ data: { id: 2 } }) }
  if (name === "@/shared/context/LanguageContext") return {
    useLanguage: () => ({ t: { courses: { studentCourseDetail: labels } } }),
  }
  if (name === "@/shared/hooks/useTimezone") return { useTimezone: () => ({ formatWeeklySchedule: () => "" }) }
  if (name === "../components/RoleSwitcher") return { useRoleOverride: () => ({ isStudent: true }) }
  if (name === "../utils/courseUtils") return { getClassEnrollmentIssue: () => null }
  if (name === "../components/ClassDetailTabs") return {
    default: (props) => { fixture.tabs = props; return null },
    __esModule: true,
  }
  if (name === "@/shared/components/ui/indicators") return { LoadingSpinner: () => createElement("div", null, "Loading") }
  return new Proxy({ __esModule: true, default: Empty }, { get: (obj, key) => obj[key] ?? Empty })
}, compiled, compiled.exports)

const render = (overrides = {}) => {
  fixture = { data: { id: 17, isEnrolled: false }, query: {}, search: "", toasts: [], ...overrides }
  return renderToStaticMarkup(createElement(compiled.exports.default))
}

test("the locked lecture hall shows recovery actions instead of a blank screen", () => {
  const html = render()
  assert.match(html, /Access has not been confirmed/)
  assert.match(html, /Check status again/)
  assert.match(html, /View enrollment details/)
  assert.doesNotMatch(html, /Private classroom content/)
  assert.equal(fixture.queryOptions.refetchOnMountOrArgChange, true)
  assert.equal(fixture.tabs.tabs.find((tab) => tab.value === "grading").locked, true)
})

test("confirmed enrollment opens the requested grading tab", () => {
  const html = render({ data: { id: 17, isEnrolled: true }, search: "tab=grading" })
  assert.equal(fixture.tabs.activeTab, "grading")
  assert.equal(fixture.tabs.tabs.find((tab) => tab.value === "grading").locked, false)
  assert.match(html, /Private classroom content/)
  assert.doesNotMatch(html, /Access has not been confirmed/)
})

test("repeated locked-tab clicks reuse one toast ID", () => {
  render()
  fixture.tabs.onLockedSelect("grading")
  fixture.tabs.onLockedSelect("grading")
  assert.equal(fixture.toasts.length, 2)
  assert.equal(fixture.toasts[0].options.id, "class-access-17")
  assert.equal(fixture.toasts[0].options.id, fixture.toasts[1].options.id)
})

test("failed requests do not get misreported as missing enrollment", () => {
  const html = render({ query: { error: { status: 500 } } })
  assert.match(html, /Failed to load class/)
  assert.doesNotMatch(html, /Access has not been confirmed/)
})
