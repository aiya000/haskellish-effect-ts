# haskellish-effect-config

> Part of **[haskellish-effect-ts](https://github.com/aiya000/haskellish-effect-ts)** — Haskell-like discipline for TypeScript, enforced by tooling.
> For motivation and full documentation, see the main repository.

One-import ESLint configs combining [typescript-eslint](https://typescript-eslint.io/) and [`eslint-plugin-haskellish-effect`](https://www.npmjs.com/package/eslint-plugin-haskellish-effect).

## Install

```bash
bun add -d haskellish-effect-config eslint-plugin-haskellish-effect eslint typescript typescript-eslint
```

## Usage

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

## Configs

| Config | Based on | All plugin rules |
| --- | --- | --- |
| `recommended` | `tseslint.recommendedTypeChecked` | warn / error (see plugin) |
| `strict` | `tseslint.strictTypeChecked` | all error, including `effect-boundary` |

Both configs also enable `@typescript-eslint/no-unsafe-*` rules as errors.

`strict` additionally enables:
- `@typescript-eslint/strict-boolean-expressions`
- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/no-misused-promises`

## License

MIT
