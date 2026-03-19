/**
 * Migration example: Before & After
 *
 * This file shows how typical TypeScript code translates
 * into the haskellish-effect style. ESLint rules are relaxed
 * for this file since it contains "before" examples.
 */

// ============================================================
// BEFORE: Vanilla TypeScript (implicit side effects everywhere)
// ============================================================

// Side effect: network call, can throw, no type-level indication
async function fetchUser_before(id: number): Promise<any> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// Side effect: console output, hidden in a "pure-looking" function
function processUser_before(user: any): string {
  console.log("Processing user:", user.name) // hidden side effect!
  return user.name.toUpperCase()
}

// Side effect: Date access for "pure" formatting
function formatTimestamp_before(): string {
  return new Date().toISOString() // impure! depends on current time
}

// ============================================================
// AFTER: haskellish-effect style (all effects explicit)
// ============================================================

import {
  Effect,
  Schema,
  pipe,
  tryFetch,
  jsonParse,
  safeDate,
} from "haskellish-effect"
import { unsafeConsole } from "haskellish-effect/unsafe"

const UserSchema = Schema.Struct({
  name: Schema.String,
  id: Schema.Number,
})

// AFTER: Effect type signature makes side effects explicit
const fetchUser_after = (
  id: number,
): Effect.Effect<typeof UserSchema.Type, unknown> =>
  pipe(
    tryFetch(`/api/users/${id}`),
    Effect.flatMap((r) =>
      Effect.tryPromise({
        try: () => r.text(),
        catch: (e) => e,
      }),
    ),
    Effect.flatMap((text) => jsonParse(text)),
    Effect.flatMap(Schema.decodeUnknown(UserSchema)),
  )

// AFTER: Side effect is explicit via unsafeConsole import
const processUser_after = (
  user: typeof UserSchema.Type,
): Effect.Effect<string> =>
  Effect.sync(() => {
    unsafeConsole.log("Processing user:", user.name) // side effect is visible in imports
    return user.name.toUpperCase()
  })

// AFTER: Impurity is captured in Effect
const formatTimestamp_after: Effect.Effect<string> = pipe(
  safeDate,
  Effect.map((d) => d.toISOString()),
)

// Make TypeScript happy — these are used in comments/demos above
void fetchUser_before
void processUser_before
void formatTimestamp_before
void fetchUser_after
void processUser_after
void formatTimestamp_after
