# Usage Guide

## Installation

```bash
bun add haskellish-effect
bun add -d haskellish-effect-config eslint-plugin-haskellish-effect eslint typescript typescript-eslint
```

## ESLint Setup

Create `eslint.config.js` (or `.ts`):

```js
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

For maximum strictness:

```js
import { strict } from 'haskellish-effect-config'

export default [
  ...strict,
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

## Writing Code

### Pure Functions

```typescript
import { pipe, Option, Array } from 'haskellish-effect'

export const findUser = (
  users: ReadonlyArray<User>,
  id: number,
): Option.Option<User> =>
  pipe(
    users,
    Array.findFirst((u) => u.id === id),
  )
```

### Effectful Functions

```typescript
import { Effect, tryFetch, jsonParse } from 'haskellish-effect'

export const loadConfig = Effect.gen(function* () {
  const response = yield* tryFetch('/config.json')
  const text = yield* Effect.tryPromise({
    try: () => response.text(),
    catch: (e) => e,
  })
  const data = yield* jsonParse(text)
  return data
})
```

### Services (Dependency Injection)

```typescript
import { Effect, Context, Layer } from 'haskellish-effect'

// 1. Define the service interface
export class Database extends Context.Tag('Database')<
  Database,
  {
    readonly query: (sql: string) => Effect.Effect<ReadonlyArray<unknown>>
  }
>() {}

// 2. Create an implementation
export const DatabaseLive = Layer.succeed(Database, {
  query: (sql) => Effect.sync(() => []),
})

// 3. Use the service
export const getUsers = Effect.gen(function* () {
  const db = yield* Database
  return yield* db.query('SELECT * FROM users')
})

// 4. Provide at the edge
Effect.runPromise(getUsers.pipe(Effect.provide(DatabaseLive)))
```

## Introducing Unsafe Code

When you need raw access to globals (logging, debugging, FFI):

```typescript
import { Effect } from 'haskellish-effect'
import { unsafeConsole } from 'haskellish-effect/unsafe'

export const debugLog = (msg: string): Effect.Effect<void> =>
  Effect.sync(() => unsafeConsole.log(msg))
```

The import from `haskellish-effect/unsafe` makes the boundary visible to code reviewers and the dependency graph.

> **Tip:** For common console operations, prefer the safe wrappers instead of `unsafeConsole`:
>
> ```typescript
> import {
>   Effect,
>   consoleLog,
>   consoleWarn,
>   consoleError,
> } from 'haskellish-effect'
>
> export const program = Effect.gen(function* () {
>   yield* consoleLog('Starting...')
>   yield* consoleWarn('Watch out!')
>   yield* consoleError('Something went wrong')
> })
> ```

## Configuring Allowed Packages

If you need third-party packages (e.g., `zod`, `drizzle-orm`):

```js
// eslint.config.js
export default [
  ...recommended,
  {
    rules: {
      'haskellish-effect/only-allowed-imports': [
        'error',
        {
          allowedPackages: ['zod', 'drizzle-orm', '@t3-oss/*'],
        },
      ],
      'haskellish-effect/capability-enforcement': [
        'warn',
        {
          allowedPackages: ['zod', 'drizzle-orm', '@t3-oss/*'],
        },
      ],
    },
  },
]
```

## Migration from Ordinary TypeScript

### Step 1: Install and configure

Set up the packages and ESLint config as described above.

### Step 2: Start with `warn` level

Use the `recommended` config (rules 4-6 are `warn`) to see violations without blocking development.

### Step 3: Replace `async/await` with Effect

```typescript
// Before
async function getUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// After
import { Effect, pipe, tryFetch, jsonParse, Schema } from 'haskellish-effect'

const getUser = (id: number) =>
  pipe(
    tryFetch(`/api/users/${id}`),
    Effect.flatMap((r) =>
      Effect.tryPromise({ try: () => r.text(), catch: (e) => e }),
    ),
    Effect.flatMap(jsonParse),
    Effect.flatMap(Schema.decodeUnknown(UserSchema)),
  )
```

### Step 4: Replace global access with safe wrappers

```typescript
// Before
const now = Date.now()
const data = JSON.parse(raw)
console.log('hello')

// After
import { safeNow, jsonParse, consoleLog } from 'haskellish-effect'
const now = safeNow // Effect<number>
const data = jsonParse(raw) // Effect<unknown, JsonParseError>
const log = consoleLog('hello') // Effect<void>
```

### Step 4.5: Replace mutable state with Effect's `Ref`

The `no-mutation` rule bans `let`/`var` and reassignment. Use Effect's `Ref` for managed mutable state:

```typescript
// Before
let count = 0
count++
count += 5

// After
import { Effect, Ref } from 'haskellish-effect'

const program = Effect.gen(function* () {
  const count = yield* Ref.make(0)
  yield* Ref.update(count, (n) => n + 1)
  yield* Ref.update(count, (n) => n + 5)
  return yield* Ref.get(count) // 6
})
```

### Step 5: Escalate to `error` level

Once your codebase is clean, switch to the `strict` config.

## Project Structure

Recommended folder structure:

```
src/
  effects/       # Effects layer: wrap external npm modules with Effect types
  lib/           # Pure functions and data types
  services/      # Effect services (Context.Tag + Layer)
  unsafe/        # Modules that import from haskellish-effect/unsafe
  main.ts        # Entry point where Effects are run
```

## Effects Layer

The **effects layer** is a dedicated directory (`effects/`) where you wrap external npm modules with Effect types. Import restrictions are relaxed in this directory, but all exported functions must return `Effect` types.

### Setup

Add `effectsLayer` to your ESLint config:

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

### Writing Effect Wrappers

Create a file in the `effects/` directory that imports from an external module and exports Effect-typed functions:

```typescript
// src/effects/axios.ts
import { Effect } from 'haskellish-effect'
import axios from 'axios'  // ✅ External imports allowed in effects/

export const get = (
  url: string,
): Effect.Effect<{ data: unknown }, unknown> =>
  Effect.tryPromise({
    try: () => axios.get(url),
    catch: (error) => error,
  })

export const post = (
  url: string,
  body: unknown,
): Effect.Effect<{ data: unknown }, unknown> =>
  Effect.tryPromise({
    try: () => axios.post(url, body),
    catch: (error) => error,
  })
```

### Using Wrapped Effects

In the rest of your codebase, import from the `effects/` directory instead of the external module:

```typescript
// src/services/user.ts
import { Effect, pipe } from 'haskellish-effect'
import { get } from '../effects/axios.js'  // ✅ Relative import

export const getUser = (id: number) =>
  pipe(
    get(`/api/users/${id}`),
    Effect.map((res) => res.data),
  )
```

This architecture ensures that:
- External dependencies are isolated in one place
- Side effects are explicitly tracked in the type system
- The rest of your codebase remains pure and disciplined
