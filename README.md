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

When the `no-mutation` rule is active, `let` and reassignment are banned. Use Effect's `Ref` for managed mutable state:

```typescript
import { Effect, Ref } from 'haskellish-effect'

const counter = Effect.gen(function* () {
  const ref = yield* Ref.make(0)
  yield* Ref.update(ref, (n) => n + 1)
  yield* Ref.update(ref, (n) => n + 1)
  return yield* Ref.get(ref) // 2
})
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
| `no-mutation`            | Blocks `let`/`var`, reassignment, `++`/`--` — use `const` and Effect's `Ref` |
| `effect-boundary`        | Exported functions should return Effect (strict mode)               |

## Effects Layer

The **effects layer** is a special directory where you can wrap external npm modules with Effect types. Within this layer:

- **Imports from any npm module are allowed** (normally restricted by `only-allowed-imports` and `capability-enforcement`)
- **Direct global access is allowed** (normally restricted by `no-global-access` and `no-implicit-globalthis`)
- **Exported functions must return `Effect` types** (enforced by `effect-boundary`)

This encourages a clean architecture: keep your wrapping code in a dedicated `effects/` directory, and use those Effect-typed wrappers everywhere else.

### Setup

```js
// eslint.config.js
import { recommended, effectsLayer } from 'haskellish-effect-config'

export default [
  ...recommended,
  effectsLayer,
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

By default, the effects layer applies to all `**/effects/**/*.ts` files.

### Custom Directory Name

If you prefer a directory name other than `effects/`, use `createEffectsLayer` to target your own file patterns:

```js
// eslint.config.js
import { recommended, createEffectsLayer } from 'haskellish-effect-config'

export default [
  ...recommended,
  createEffectsLayer(['**/wrappers/**/*.ts']),
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

### Example

```typescript
// src/effects/axios.ts — wrapping axios with Effect types
import { Effect } from 'haskellish-effect'
import axios from 'axios'  // ✅ External imports allowed in effects/

export const get = (
  url: string,
): Effect.Effect<{ data: unknown }, unknown> =>
  Effect.tryPromise({
    try: () => axios.get(url),
    catch: (error) => error,
  })
```

```typescript
// src/services/user.ts — using the wrapped Effect
import { Effect, pipe } from 'haskellish-effect'
import { get } from '../effects/axios.js'  // ✅ Relative import

export const getUser = (id: number) =>
  pipe(
    get(`/api/users/${id}`),
    Effect.map((res) => res.data),
  )
```

## Documentation

- [Motivation](./docs/motivation.md) — Why this project exists
- [Core Concepts](./docs/concepts.md) — Pure vs Effect, closed world, capability-based design
- [Learning Path](./docs/learning-path.md) — Guides for both Haskell experts and TypeScript developers
- [Usage Guide](./docs/usage-guide.md) — Installation, configuration, migration
- [Examples](./examples) — Working example projects to help you get started

## License

MIT
