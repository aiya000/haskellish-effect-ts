/**
 * Entry point — this is where Effects get executed.
 * The "edge of the world" where pure descriptions become real side effects.
 */
import { Effect, pipe, Option } from "haskellish-effect"
import { unsafeConsole } from "haskellish-effect/unsafe"
import { safeDivide, validateUsername, describeValidation } from "./pure.js"
import { program, UserServiceLive } from "./http-service.js"
import { logWithTimestamp } from "./unsafe-boundary.js"

// --- Pure computations (no Effect needed) ---

const divisionResult = safeDivide(10, 3)
const divisionDisplay = pipe(
  divisionResult,
  Option.map((n) => `10 / 3 = ${n}`),
  Option.getOrElse(() => "Division by zero!"),
)

const validationResult = describeValidation(validateUsername("alice_42"))

// --- Effectful program ---

const mainProgram = Effect.gen(function* () {
  yield* logWithTimestamp("Starting haskellish-effect example")

  // Run the HTTP service program
  const user = yield* pipe(
    program,
    Effect.provide(UserServiceLive),
    Effect.catchAll((error) =>
      Effect.succeed({
        id: 0,
        name: "fallback",
        email: `error: ${String(error)}`,
      }),
    ),
  )

  yield* Effect.sync(() => {
    unsafeConsole.log("Division:", divisionDisplay)
    unsafeConsole.log("Validation:", validationResult)
    unsafeConsole.log("User:", user)
  })

  yield* logWithTimestamp("Done")
})

// The only place where we actually run the Effect
Effect.runPromise(mainProgram).catch((error) => {
  unsafeConsole.error("Fatal:", error)
})
