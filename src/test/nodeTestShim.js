// Vitest compatibility shim for the pre-existing `node:test`-based unit tests
// under src/features/video-call. Those files must keep working under plain
// `node --test`, but `vitest run` also includes this folder.
import { test } from "vitest"

export default test
