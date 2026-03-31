# haskellish-effect

> Part of **[haskellish-effect-ts](https://github.com/aiya000/haskellish-effect-ts)** — Haskell-like discipline for TypeScript, enforced by tooling.
> For motivation, full documentation, and ESLint setup, see the main repository.

Controlled re-exports of [Effect-TS](https://effect.website/) with safe wrappers for side-effectful operations.

## Install

```bash
bun add haskellish-effect effect
```

## Exports

All Effect-TS core modules are re-exported from a single entry point:

```typescript
import { Effect, pipe, Option, Either, Ref, Stream, Schema } from 'haskellish-effect'
```

### Categories

| Category | Exports |
| --- | --- |
| Core | `Effect`, `Exit`, `Cause`, `pipe`, `flow` |
| Data | `Option`, `Either`, `Data`, `Match`, `Brand`, `Predicate`, `Order`, `Equal`, `Hash`, `Equivalence` |
| Collections | `Array`, `Chunk`, `HashMap`, `HashSet`, `List`, `SortedMap`, `SortedSet` |
| Concurrency | `Fiber`, `Queue`, `Ref`, `Deferred`, `PubSub`, `Scope`, `Supervisor` |
| Streaming | `Stream`, `Sink`, `Channel` |
| Dependency Injection | `Context`, `Layer` |
| Time | `Schedule`, `Duration` |
| Observability | `Logger`, `LogLevel`, `Metric`, `Tracer` |
| Schema & Config | `Schema`, `Config`, `ConfigProvider` |

### Safe wrappers

Side-effectful operations wrapped in `Effect` so they appear in the type signature:

| Export | Wraps |
| --- | --- |
| `tryFetch` / `FetchError` / `HttpError` | `fetch()` |
| `jsonParse` / `jsonStringify` / `JsonParseError` / `JsonStringifyError` | `JSON.parse` / `JSON.stringify` |
| `safeSetTimeout` / `safeSetInterval` | `setTimeout` / `setInterval` |
| `safeRandom` | `Math.random()` |
| `safeNow` / `safeDate` | `Date.now()` / `new Date()` |
| `consoleLog` / `consoleWarn` / `consoleError` / ... | `console.*` |

## Unsafe escape hatch

```typescript
import { unsafeGlobalThis, unsafeFetch, unsafeConsole, UnsafeDate } from 'haskellish-effect/unsafe'
```

Importing from `haskellish-effect/unsafe` is the TypeScript equivalent of Haskell's `System.IO.Unsafe` — it signals that this module intentionally accesses the global environment. Use only at application boundaries.

## License

MIT
