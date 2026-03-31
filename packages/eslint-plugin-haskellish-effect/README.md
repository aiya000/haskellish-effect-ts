# eslint-plugin-haskellish-effect

> Part of **[haskellish-effect-ts](https://github.com/aiya000/haskellish-effect-ts)** — Haskell-like discipline for TypeScript, enforced by tooling.
> For motivation, full documentation, and quick setup, see the main repository.

ESLint plugin that enforces Haskell-style purity discipline in TypeScript via [Effect-TS](https://effect.website/).

## Install

```bash
bun add -d eslint-plugin-haskellish-effect eslint
```

> For a one-import setup with pre-configured rule sets, use [`haskellish-effect-config`](https://www.npmjs.com/package/haskellish-effect-config) instead.

## Rules

| Rule | What it enforces | recommended | strict |
| --- | --- | --- | --- |
| `only-allowed-imports` | Blocks direct `effect` imports and unknown packages | error | error |
| `no-global-access` | Blocks `fetch`, `console`, `Date`, `Math`, etc. | error | error |
| `no-implicit-globalthis` | Blocks `globalThis`, `window`, `document`, `self` | error | error |
| `capability-enforcement` | Closed-world rule — all bindings must be traceable to imports | warn | error |
| `no-promise` | Blocks `async/await` and `new Promise()` — use Effect | warn | error |
| `no-explicit-any` | Blocks `any` type annotations | warn | error |
| `no-throw` | Blocks `throw` — use `Effect.fail` or `Effect.die` | warn | error |
| `no-mutation` | Blocks `let`/`var`, reassignment, `++`/`--` — use `const` and Effect's `Ref` | warn | error |
| `effect-boundary` | Exported functions should return `Effect` | — | error |

## Usage

```js
// eslint.config.js
import haskellishPlugin, { recommended } from 'eslint-plugin-haskellish-effect'

export default [
  recommended,
  // or use `strict` for all rules as errors
]
```

For manual rule configuration:

```js
// eslint.config.js
import haskellishPlugin from 'eslint-plugin-haskellish-effect'

export default [
  {
    plugins: { 'haskellish-effect': haskellishPlugin },
    rules: {
      'haskellish-effect/no-global-access': 'error',
      'haskellish-effect/no-promise': 'warn',
      // ...
    },
  },
]
```

## License

MIT
