/**
 * Demonstrates explicit unsafe boundaries.
 * Like Haskell's System.IO.Unsafe, importing from haskellish-effect/unsafe
 * is a clear signal that this module performs side effects.
 */
import { Effect } from 'haskellish-effect'
import { unsafeConsole, UnsafeDate } from 'haskellish-effect/unsafe'

// This function explicitly uses unsafe bindings — the import makes it obvious
export const logWithTimestamp = (message: string): Effect.Effect<void> =>
  Effect.sync(() => {
    const now = new UnsafeDate()
    unsafeConsole.log(`[${now.toISOString()}] ${message}`)
  })

// The caller sees that this module imports from /unsafe,
// making the side-effect boundary visible in the dependency graph
export const debugTrace = <A>(label: string, value: A): Effect.Effect<A> =>
  Effect.sync(() => {
    unsafeConsole.debug(`[DEBUG ${label}]:`, value)
    return value
  })
