import common from "./common"
import errors from "./errors"
import validation from "./validation"
import * as pages from "./pages"
import * as components from "./components"
import recordings from "./recordings"
import courses from "./courses"

export default {
  ...common,
  errors,
  validation,
  ...pages,
  ...components,
  recordings,
  courses,
}
