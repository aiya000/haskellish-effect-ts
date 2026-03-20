# Learning Path

## Track 1: No Haskell Background

If you're coming from ordinary TypeScript, here's the progression:

### Step 1: Understand `pipe`

```typescript
// Instead of method chaining:
const result1 = arr.filter((x) => x > 0).map((x) => x * 2)

// Use pipe for function composition:
import { pipe, Array } from 'haskellish-effect'
const result2 = pipe(
  arr,
  Array.filter((x) => x > 0),
  Array.map((x) => x * 2),
)
```

`pipe` takes a value and passes it through a sequence of functions. It's the backbone of functional composition.

### Step 2: Understand `Option` (replacing null/undefined)

```typescript
import { Option, pipe, Array } from 'haskellish-effect'

// Instead of: const head = arr[0]; // might be undefined!
const head = pipe(arr, Array.head) // Option<number>

// Transform only if present
const doubled = pipe(
  head,
  Option.map((x) => x * 2),
)

// Extract with a default
const value = pipe(
  doubled,
  Option.getOrElse(() => 0),
)
```

### Step 3: Understand `Either` (replacing throw/catch)

```typescript
import { Either } from 'haskellish-effect'

// Instead of: if (bad) throw new Error("bad");
const validate = (x: string): Either.Either<string, ValidationError> =>
  x.length > 0 ? Either.right(x) : Either.left({ _tag: 'Empty' })
```

### Step 4: Understand `Effect` (replacing async/await)

```typescript
import { Effect, pipe, tryFetch } from 'haskellish-effect'

// Instead of: const response = await fetch(url);
// Use:
const program = pipe(
  tryFetch(url),
  Effect.flatMap((response) =>
    Effect.tryPromise({
      try: () => response.json(),
      catch: (e) => e,
    }),
  ),
)

// Nothing happens until:
Effect.runPromise(program)
```

### Step 5: Understand Services (dependency injection)

```typescript
import { Effect, Context, Layer } from 'haskellish-effect'

// Define what the service does (like an interface)
class Logger extends Context.Tag('Logger')<
  Logger,
  {
    readonly log: (msg: string) => Effect.Effect<void>
  }
>() {}

// Define how it works (the implementation)
const LoggerLive = Layer.succeed(Logger, {
  log: (msg) =>
    Effect.sync(() => {
      /* ... */
    }),
})

// Use the service (without knowing the implementation)
const program = Effect.gen(function* () {
  const logger = yield* Logger
  yield* logger.log('Hello!')
})

// Provide the implementation at the edge
Effect.runPromise(program.pipe(Effect.provide(LoggerLive)))
```

---

## Track 2: Haskell Background

If you know Haskell, here's the mapping:

| Haskell                      | haskellish-effect                                                             |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `IO a`                       | `Effect.Effect<A>`                                                            |
| `IO (Either e a)`            | `Effect.Effect<A, E>`                                                         |
| `ReaderT r IO a`             | `Effect.Effect<A, E, R>`                                                      |
| `Maybe a`                    | `Option.Option<A>`                                                            |
| `Either e a`                 | `Either.Either<A, E>`                                                         |
| `do` notation                | `Effect.gen(function* () { ... })`                                            |
| `>>=` (bind)                 | `Effect.flatMap`                                                              |
| `<$>` (fmap)                 | `Effect.map`                                                                  |
| `pure` / `return`            | `Effect.succeed`                                                              |
| `throwError`                 | `Effect.fail`                                                                 |
| `catchError`                 | `Effect.catchAll`                                                             |
| `ask` (Reader)               | `yield* MyService` (via Context.Tag)                                          |
| `runReaderT`                 | `Effect.provide(layer)`                                                       |
| `liftIO`                     | Already unified — Effect is the base                                          |
| Typeclass                    | `Context.Tag` + `Layer`                                                       |
| Instance                     | `Layer.succeed` / `Layer.effect`                                              |
| `System.IO.Unsafe`           | `haskellish-effect/unsafe`                                                    |
| `IORef`                      | `Ref` from `haskellish-effect` (wraps Effect's `Ref`)                         |
| `State s a` / `StateT s m a` | `Ref` from `haskellish-effect` (wraps Effect's `Ref`)                        |
| Module export list           | ESLint `only-allowed-imports` rule                                            |

### Key differences from Haskell:

1. **No HKTs** — Effect uses a flat `Effect<A, E, R>` instead of monad transformers
2. **Structural typing** — Services are structural, not nominal (like Go interfaces)
3. **No laziness** — TypeScript is strict; `Effect.sync(() => ...)` is the equivalent of lazy thunks
4. **Generator syntax** — `Effect.gen` with `yield*` replaces `do` notation
5. **Runtime errors** — TypeScript can still throw; the discipline is enforced by ESLint, not the compiler
