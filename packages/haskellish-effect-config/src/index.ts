import tseslint from 'typescript-eslint'
import haskellishPlugin, {
  recommended as haskellishRecommended,
  strict as haskellishStrict,
  effectsLayer as haskellishEffectsLayer,
} from 'eslint-plugin-haskellish-effect'

export const recommended: ReadonlyArray<unknown> = [
  ...tseslint.configs.recommendedTypeChecked,
  haskellishRecommended,
  {
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
    },
  },
]

export const strict: ReadonlyArray<unknown> = [
  ...tseslint.configs.strictTypeChecked,
  haskellishStrict,
  {
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
]

/**
 * Effects layer config — relaxes import restrictions in `effects/` directories
 * while enforcing that exported functions return Effect types.
 *
 * Use this alongside `recommended` or `strict` to create a dedicated directory
 * where users wrap external npm modules with Effect types.
 *
 * @example
 * ```js
 * import { recommended, effectsLayer } from 'haskellish-effect-config'
 *
 * export default [
 *   ...recommended,
 *   effectsLayer,
 *   // ...
 * ]
 * ```
 */
export const effectsLayer: unknown = haskellishEffectsLayer

export { haskellishPlugin }
