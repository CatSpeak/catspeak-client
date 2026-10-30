/* eslint import/no-unresolved: ["error", { ignore: ["^node:"] }] */
import test from "node:test"
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import { build, transform } from "esbuild"
import { readFile } from "node:fs/promises"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter, Routes, Route, matchRoutes } from "react-router-dom"

// Compile the real guard in memory. Stub only app hooks/UI so these tests can run
// with node:test, without a browser, DOM, or a separate test-runner dependency.
const require = createRequire(import.meta.url)
let fixture
let privateScreenMounts
const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL("./ClassroomAccessGuard.jsx", import.meta.url))],
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  packages: "external",
  external: ["@/*"],
})
const compiled = { exports: {} }
const testRequire = (name) => {
  if (name === "react") {
    return { ...require(name), useEffect: (effect) => fixture.effects.push(effect) }
  }
  if (name === "@/features/auth") return { useAuth: () => fixture.auth }
  if (name === "@/store/api/coursesApi") {
    return {
      useLazyGetStudentClassDetailQuery: () => [(id) => fixture.requests.push({ id, source: "student" }), fixture.query],
      useLazyGetClassDetailQuery: () => [(id) => fixture.requests.push({ id, source: "teacher" }), fixture.query],
    }
  }
  if (name === "@/shared/context/LanguageContext") {
    return { useLanguage: () => ({ t: { courses: {} } }) }
  }
  if (name === "@/shared/components/ui/indicators") {
    return { LoadingSpinner: () => createElement("div", null, "Checking access") }
  }
  if (name === "react-router-dom") {
    return {
      ...require(name),
      Navigate: ({ to }) => createElement("a", { href: to }, "Redirect"),
    }
  }
  return require(name)
}
new Function("require", "module", "exports", outputFiles[0].text)(
  testRequire, compiled, compiled.exports,
)
const ClassroomAccessGuard = compiled.exports.default

// Inspect the actual route configuration as well as rendering the guard below.
// Unrelated feature imports are inert placeholders; no application pages load.
const routeSource = await readFile(new URL("../../../routes/routesConfig.jsx", import.meta.url), "utf8")
const routeModule = { exports: {} }
const { code: routeCode } = await transform(routeSource, { loader: "jsx", format: "cjs", jsx: "automatic" })
const Placeholder = () => null
const placeholderModule = new Proxy({ __esModule: true }, { get: (target, key) => target[key] ?? Placeholder })
new Function("require", "module", "exports", routeCode)((name) => {
  if (name === "react" || name === "react/jsx-runtime" || name === "react-router-dom") return require(name)
  if (name === "@/features/courses/components/ClassroomAccessGuard") return { __esModule: true, default: ClassroomAccessGuard }
  return placeholderModule
}, routeModule, routeModule.exports)
const routes = routeModule.exports.default
const containsGuard = (element) => Boolean(element && (
  element.type === ClassroomAccessGuard
  || (Array.isArray(element.props?.children)
    ? element.props.children.some(containsGuard)
    : containsGuard(element.props?.children))
))

const PrivateScreen = () => {
  privateScreenMounts += 1
  return createElement("div", null, "Private sessions")
}

const renderGuard = ({
  query = {},
  user = { accountId: 25, accountType: "Student" },
  isAuthenticated = true,
  path = "/workspace/learning/class/42",
  standaloneQuiz = false,
  instructorView = false,
} = {}) => {
  privateScreenMounts = 0
  fixture = {
    effects: [],
    requests: [],
    auth: { user, isAuthenticated },
    query: {
      currentData: { id: 42, instructorId: 7, isEnrolled: false },
      originalArgs: "42",
      isUninitialized: false,
      isFetching: false,
      isLoading: false,
      refetch: () => {},
      ...query,
    },
  }
  const content = standaloneQuiz
    ? createElement(Route, {
      path: "/workspace/courses/class/:classId/quiz/:quizId/take",
      element: createElement(ClassroomAccessGuard, null, createElement(PrivateScreen)),
    })
    : createElement(Route, { element: createElement(ClassroomAccessGuard, { instructorView }) },
      createElement(Route, {
        path: "/workspace/learning/class/:id/*",
        element: createElement(PrivateScreen),
      }),
    )
  const markup = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] },
    createElement(Routes, null, content),
  ))
  fixture.effects.forEach((effect) => effect())
  return markup
}

test("unenrolled classroom and direct lesson links redirect without mounting private screens", () => {
  for (const suffix of ["", "?tab=grading&quizId=3", "/review", "/links/4", "/bulletin-board/8", "/bulletin-board/posts/9"]) {
    assert.match(renderGuard({ path: `/workspace/learning/class/42${suffix}` }), /href="\/workspace\/explore-courses\/class\/42"/)
    assert.equal(privateScreenMounts, 0)
  }
})

test("confirmed enrollment permits access, including a free class", () => {
  assert.match(renderGuard({ query: { currentData: { id: 42, isEnrolled: true, tuitionFee: 0 } } }), /Private sessions/)
  assert.equal(privateScreenMounts, 1)
})

test("a free class still requires confirmed enrollment before opening lessons or assignments", () => {
  for (const isEnrolled of [false, undefined, null]) {
    for (const search of ["", "?tab=lecture-hall", "?tab=grading&assignmentId=3"]) {
      assert.match(renderGuard({
        path: `/workspace/learning/class/42${search}`,
        query: { currentData: { id: 42, isEnrolled, price: 0, tuitionFee: 0 } },
      }), /href="\/workspace\/explore-courses\/class\/42"/)
      assert.equal(privateScreenMounts, 0)
    }
  }
})

test("a missing classroom redirects to explore without rendering cached private content", () => {
  assert.match(renderGuard({
    query: { error: { status: 404 }, currentData: { id: 42, isEnrolled: true } },
  }), /href="\/workspace\/explore-courses"/)
  assert.equal(privateScreenMounts, 0)
})

test("a teacher role or paid subscription does not replace enrollment", () => {
  assert.match(renderGuard({ user: { accountId: 25, accountType: "Teacher", isTeacher: true, subscription: "Premium" } }), /Redirect/)
  assert.equal(privateScreenMounts, 0)
})

test("the class instructor can still access their own class", () => {
  for (const user of [{ accountId: "7" }, { id: 7, accountType: "Student" }]) {
    assert.match(renderGuard({ user }), /Private sessions/)
    assert.equal(privateScreenMounts, 1)
  }
})

test("missing, pending, or malformed enrollment values do not grant access", () => {
  for (const isEnrolled of [undefined, null, false, "true", 1]) {
    assert.match(renderGuard({ query: { currentData: { id: 42, isEnrolled, enrollmentStatus: "Pending" } } }), /Redirect/)
    assert.equal(privateScreenMounts, 0)
  }
})

test("loading and cache revalidation keep private screens unmounted", () => {
  for (const pending of [{ isLoading: true }, { isFetching: true }, { isUninitialized: true }, { originalArgs: "41" }]) {
    assert.match(renderGuard({ query: { currentData: { id: 42, isEnrolled: true }, ...pending } }), /Checking access/)
    assert.equal(privateScreenMounts, 0)
  }
})

test("entry and API cache resets recheck enrollment, without repeatedly fetching settled data", () => {
  renderGuard({ query: { isUninitialized: true, originalArgs: undefined } })
  assert.deepEqual(fixture.requests, [{ id: "42", source: "student" }])
  renderGuard({ query: { currentData: { id: 42, isEnrolled: true } } })
  assert.deepEqual(fixture.requests, [])
  assert.match(renderGuard({ query: { isUninitialized: true, currentData: undefined, originalArgs: undefined } }), /Checking access/)
  assert.deepEqual(fixture.requests, [{ id: "42", source: "student" }])
  assert.equal(privateScreenMounts, 0)
})

test("errors, missing data, and data from another class fail closed", () => {
  for (const query of [
    { error: { status: 500 } },
    { error: { status: "FETCH_ERROR" }, currentData: { id: 42, isEnrolled: true } },
    { currentData: undefined },
    { currentData: { id: 41, isEnrolled: true } },
  ]) {
    assert.match(renderGuard({ query }), /role="alert"/)
    assert.equal(privateScreenMounts, 0)
  }
})

test("instructor routes retain finished-class access through teacher details and require ownership", () => {
  renderGuard({ instructorView: true, query: { isUninitialized: true, originalArgs: undefined } })
  assert.deepEqual(fixture.requests, [{ id: "42", source: "teacher" }])
  assert.match(renderGuard({
    instructorView: true,
    user: { accountId: 7 },
    query: { currentData: { id: 42, teacher: { accountId: "7" }, status: "FINISHED" } },
  }), /Private sessions/)
  assert.equal(privateScreenMounts, 1)
  assert.match(renderGuard({ instructorView: true, query: { currentData: { id: 42, teacherId: 7, isEnrolled: true } } }), /Redirect/)
  assert.equal(privateScreenMounts, 0)
})

test("API access denials override previously cached enrollment", () => {
  for (const status of [401, 403]) {
    assert.match(renderGuard({ query: { error: { status }, currentData: { id: 42, isEnrolled: true } } }), /Redirect/)
    assert.equal(privateScreenMounts, 0)
  }
})

test("standalone quiz routes use classId and check enrollment before loading the quiz", () => {
  const options = { standaloneQuiz: true, path: "/workspace/courses/class/42/quiz/8/take" }
  assert.match(renderGuard(options), /href="\/workspace\/explore-courses\/class\/42"/)
  assert.equal(privateScreenMounts, 0)
  assert.match(renderGuard({ ...options, query: { currentData: { id: 42, isEnrolled: true } } }), /Private sessions/)
  assert.equal(privateScreenMounts, 1)
})

test("lost authentication cannot render cached classroom content", () => {
  assert.match(renderGuard({ isAuthenticated: false, query: { currentData: { id: 42, isEnrolled: true } } }), /Redirect/)
  assert.equal(privateScreenMounts, 0)
})

test("every configured classroom URL has an access guard, including legacy teacher links", () => {
  const paths = [
    "/workspace/learning/class/42",
    "/workspace/learning/class/42/review",
    "/workspace/learning/class/42/links/4",
    "/workspace/learning/class/42/bulletin-board/8",
    "/workspace/learning/class/42/bulletin-board/posts/9",
    "/workspace/learning/class/42/bulletin-board/8/create-post",
    "/workspace/learning/class/42/bulletin-board/8/edit-post/9",
    "/workspace/courses/class/42",
    "/workspace/courses/class/42/create-assignment",
    "/workspace/courses/class/42/assignment/3",
    "/workspace/courses/class/42/assignment/3/edit",
    "/workspace/courses/class/42/create-exam",
    "/workspace/courses/class/42/quiz/3",
    "/workspace/courses/class/42/quiz/3/edit",
    "/workspace/courses/class/42/quiz/3/submission/25",
    "/workspace/courses/class/42/quiz/3/take",
    "/workspace/courses/class/42/links/4",
    "/workspace/courses/class/42/bulletin-board/8",
    "/workspace/courses/class/42/bulletin-board/posts/9",
    "/workspace/courses/class/42/bulletin-board/8/create-post",
    "/workspace/courses/class/42/bulletin-board/8/edit-post/9",
  ]
  for (const path of paths) {
    const matches = matchRoutes(routes, path)
    assert.ok(matches?.some(({ route }) => containsGuard(route.element)), `Missing classroom guard: ${path}`)
  }
})

test("public class pages remain accessible without an enrollment guard", () => {
  for (const path of ["/explore-courses/class/42", "/workspace/explore-courses/class/42"]) {
    const matches = matchRoutes(routes, path)
    assert.ok(matches)
    assert.equal(matches.some(({ route }) => containsGuard(route.element)), false)
  }
})
