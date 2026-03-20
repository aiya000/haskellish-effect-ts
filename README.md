# haskellish-effect-ts

**Haskell-like discipline for TypeScript, enforced by tooling.**

> If it has a side effect, make it explicit. If you didn't import it, you can't use it.

## What is this?

A suite of npm packages that enforce Haskell-style purity discipline in TypeScript via [Effect-TS](https://effect.website/):

- **Side effects must be explicit** — wrapped in `Effect`, not hidden in plain functions
- **Closed world model** — if you didn't import it, you can't use it
- **Global environment not accessible by default** — no sneaking in `fetch`, `console`, or `Date`
- **Unsafe boundaries are visible** — like Haskell's `System.IO.Unsafe`, escape hatches exist but are clearly marked

## Why?

AI coding assistants generate TypeScript at unprecedented speed. But TypeScript's flexibility means any function can secretly perform network calls, mutate state, or access the environment — and none of this is visible in the type signature.

This project makes the invisible visible: **if a function has side effects, the type system and linter will tell you**.

## Packages

| Package                                                                         | Description                                           |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`haskellish-effect`](./packages/haskellish-effect)                             | Controlled re-exports of Effect-TS with safe wrappers |
| [`eslint-plugin-haskellish-effect`](./packages/eslint-plugin-haskellish-effect) | ESLint rules enforcing closed-world discipline        |
| [`haskellish-effect-config`](./packages/haskellish-effect-config)               | One-import ESLint configs (recommended + strict)      |

## Quick Start

```bash
# Install
bun add haskellish-effect
bun add -d haskellish-effect-config eslint-plugin-haskellish-effect eslint typescript typescript-eslint
```

```js
// eslint.config.js
import { recommended } from 'haskellish-effect-config'

export default [
  ...recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]
```

Then write code:

```typescript
import { Effect, pipe, tryFetch, jsonParse, Schema } from 'haskellish-effect'

const User = Schema.Struct({ id: Schema.Number, name: Schema.String })

// Side effects are explicit in the return type
const getUser = (id: number) =>
  pipe(
    tryFetch(`/api/users/${id}`),
    Effect.flatMap((r) =>
      Effect.tryPromise({ try: () => r.text(), catch: (e) => e }),
    ),
    Effect.flatMap(jsonParse),
    Effect.flatMap(Schema.decodeUnknown(User)),
  )

// Pure function — no Effect, no side effects
const greet = (name: string): string => `Hello, ${name}!`
```

### Managed State (with `no-mutation` enabled)

When the `no-mutation` rule is active, `let` and reassignment are banned. Use `IORef` or `State` for mutable state:

```typescript
import {
  Effect,
  newIORef,
  readIORef,
  modifyIORef,
  runState,
  modifyState,
  getState,
} from 'haskellish-effect'

// IORef: a mutable reference managed within Effect
const counter = Effect.gen(function* () {
  const ref = yield* newIORef(0)
  yield* modifyIORef(ref, (n) => n + 1)
  yield* modifyIORef(ref, (n) => n + 1)
  return yield* readIORef(ref) // 2
})

// State: run a stateful computation and get the result and final state
const stateful = runState(0, (ref) =>
  Effect.gen(function* () {
    yield* modifyState(ref, (s) => s + 10)
    return yield* getState(ref)
  }),
) // Effect producing [10, 10]
```

## ESLint Rules

| Rule                     | What it enforces                                                    |
| ------------------------ | ------------------------------------------------------------------- |
| `only-allowed-imports`   | Blocks direct `effect` imports and unknown packages                 |
| `no-global-access`       | Blocks `fetch`, `console`, `Date`, `Math`, etc.                     |
| `no-implicit-globalthis` | Blocks `globalThis`, `window`, `document`, `self`                   |
| `capability-enforcement` | Central closed-world rule — all bindings must be traceable          |
| `no-promise`             | Blocks `async/await` and `new Promise()` — use Effect               |
| `no-explicit-any`        | Blocks `any` type annotations                                       |
| `no-mutation`            | Blocks `let`/`var`, reassignment, `++`/`--` — use `const` and `Ref` |
| `effect-boundary`        | Exported functions should return Effect (strict mode)               |

## Documentation

- [Motivation](./docs/motivation.md) — Why this project exists
- [Core Concepts](./docs/concepts.md) — Pure vs Effect, closed world, capability-based design
- [Learning Path](./docs/learning-path.md) — Guides for both Haskell experts and TypeScript developers
- [Usage Guide](./docs/usage-guide.md) — Installation, configuration, migration
- [Examples](./examples) — Working example projects to help you get started

## License

MIT
