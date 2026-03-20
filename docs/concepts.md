# Core Concepts

## Pure vs Effect

The fundamental distinction in this system:

### Pure Code

```typescript
// This function is pure — same input always gives same output
const add = (a: number, b: number): number => a + b

// Pure data transformations
const users = pipe(rawData, Array.filter(isActive), Array.map(toDisplayName))
```

Pure code:

- Has no side effects
- Is referentially transparent (can be replaced with its result)
- Is easy to test (just check input → output)
- Can be freely memoized, parallelized, or reordered

### Effectful Code

```typescript
// This function describes a side effect — it doesn't execute it yet
const getUser = (id: number): Effect.Effect<User, HttpError> =>
  pipe(
    tryFetch(`/api/users/${id}`),
    Effect.flatMap(parseJson),
    Effect.flatMap(Schema.decodeUnknown(User)),
  )
```

Effectful code:

- Returns `Effect<A, E, R>` — a _description_ of what to do
- The `E` type parameter tells you what can go wrong
- The `R` type parameter tells you what dependencies are needed
- Nothing happens until you call `Effect.runPromise`

## Closed World Model

Traditional TypeScript has an "open world" — any code can access any global:

```typescript
// Any file can do this — no import needed, no indication of side effects
function surprise() {
  fetch('/api/track', {
    method: 'POST',
    body: JSON.stringify({ event: 'surprise' }),
  })
  console.log('Did something hidden!')
}
```

In the closed world model, **if you didn't import it, you can't use it**:

```typescript
// ❌ ESLint error: Direct access to global "fetch" is not allowed
fetch('/api/data')

// ✅ Must use the safe wrapper
import { tryFetch } from 'haskellish-effect'
const result = tryFetch('/api/data') // Returns Effect, not Promise
```

## Capability-Based Design

Each capability (network, console, time, randomness) must be explicitly acquired:

| Capability           | Safe Import                                                                   | Unsafe Import                                       |
| -------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| HTTP                 | `tryFetch` from `haskellish-effect`                                           | `unsafeFetch` from `haskellish-effect/unsafe`       |
| Console              | `consoleLog`, `consoleWarn`, `consoleError`, etc. from `haskellish-effect`    | `unsafeConsole` from `haskellish-effect/unsafe`     |
| JSON                 | `jsonParse`, `jsonStringify` from `haskellish-effect`                         | `unsafeJSON` from `haskellish-effect/unsafe`        |
| Time                 | `safeNow`, `safeDate` from `haskellish-effect`                                | `UnsafeDate` from `haskellish-effect/unsafe`        |
| Randomness           | `safeRandom` from `haskellish-effect`                                         | `unsafeMath` from `haskellish-effect/unsafe`        |
| Timers               | `safeSetTimeout`, `safeSetInterval` from `haskellish-effect`                  | `unsafeSetTimeout` from `haskellish-effect/unsafe`  |
| Mutable State        | `Ref` from `haskellish-effect` (wraps Effect's `Ref`)                         | `let`/`var` declarations (blocked by `no-mutation`) |
| Stateful Computation | `Ref` from `haskellish-effect` (wraps Effect's `Ref`)                         | Reassignment (blocked by `no-mutation`)             |

Safe wrappers return `Effect` values — the side effect is tracked in the type system.
Unsafe bindings give you raw access — but the import path makes this visible.

## Unsafe Boundaries

Like Haskell's `System.IO.Unsafe`, the `haskellish-effect/unsafe` module is an explicit escape hatch. It's not forbidden — it's _visible_.

```typescript
import { unsafeConsole } from 'haskellish-effect/unsafe'

// Anyone reading this file immediately sees the unsafe import
// The dependency graph makes the side-effect boundary clear
```

Rules of thumb:

1. **Prefer safe wrappers** — they compose with Effect and provide error typing
2. **Use unsafe bindings at the boundary** — logging, debugging, FFI
3. **Never hide unsafe in a "pure-looking" module** — the import should be in the file that uses it

## State Management (with `no-mutation` enabled)

When the `no-mutation` rule is enabled, `let`/`var` declarations and reassignment are banned. Instead, use Effect's `Ref` (re-exported from `haskellish-effect`) for managed mutable state — equivalent to Haskell's `IORef`:

```typescript
import { Effect, Ref } from 'haskellish-effect'

const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0) // create a new ref
  yield* Ref.update(counter, (n) => n + 1) // update with a pure function
  yield* Ref.set(counter, 42) // overwrite with a value
  return yield* Ref.get(counter) // read the current value → 42
})
```

`Ref` keeps mutable state inside `Effect`, making it explicit and composable without needing `let` or reassignment.
