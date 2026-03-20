/**
 * State management example — IORef and State.
 *
 * When the `no-mutation` rule is enabled, `let`/`var` and reassignment
 * are banned. Use IORef for mutable references and State for stateful
 * computations — all managed within Effect.
 */
import {
  Effect,
  pipe,
  newIORef,
  readIORef,
  writeIORef,
  modifyIORef,
  runState,
  getState,
  putState,
  modifyState,
  consoleLog,
} from 'haskellish-effect'

// --- IORef: a mutable reference inside Effect ---

// Equivalent to Haskell's:
//   do ref <- newIORef 0
//      modifyIORef ref (+1)
//      modifyIORef ref (+1)
//      readIORef ref       -- 2
export const iorefExample: Effect.Effect<number> = Effect.gen(function* () {
  const counter = yield* newIORef(0)
  yield* modifyIORef(counter, (n) => n + 1)
  yield* modifyIORef(counter, (n) => n + 1)
  return yield* readIORef(counter) // 2
})

// --- IORef: write and read ---

export const iorefWriteExample: Effect.Effect<string> = Effect.gen(
  function* () {
    const ref = yield* newIORef('hello')
    yield* writeIORef(ref, 'world')
    return yield* readIORef(ref) // "world"
  },
)

// --- State: stateful computation with runState ---

// Equivalent to Haskell's:
//   runState (do modify (+10); get) 0  -- (10, 10)
export const stateExample: Effect.Effect<readonly [number, number]> = runState(
  0,
  (ref) =>
    Effect.gen(function* () {
      yield* modifyState(ref, (s) => s + 10)
      return yield* getState(ref)
    }),
)

// --- State: accumulator pattern ---

// Build a list of results without mutation
export const accumulatorExample: Effect.Effect<
  readonly [ReadonlyArray<string>, number]
> = runState(0, (ref) =>
  Effect.gen(function* () {
    const results: ReadonlyArray<string> = []
    yield* modifyState(ref, (s) => s + 1)
    const first = yield* getState(ref)
    yield* modifyState(ref, (s) => s + 1)
    const second = yield* getState(ref)
    yield* putState(ref, 100)
    const third = yield* getState(ref)
    return [...results, `step1=${first}`, `step2=${second}`, `step3=${third}`]
  }),
)

// --- Putting it all together ---

export const stateManagementProgram = Effect.gen(function* () {
  const count = yield* iorefExample
  yield* consoleLog(`IORef counter: ${count}`)

  const word = yield* iorefWriteExample
  yield* consoleLog(`IORef write: ${word}`)

  const [result, finalState] = yield* stateExample
  yield* consoleLog(`State result: ${result}, final state: ${finalState}`)

  const [steps, total] = yield* accumulatorExample
  yield* consoleLog(`Accumulator steps: ${pipe(steps).join(', ')}`)
  yield* consoleLog(`Accumulator total: ${total}`)
})
