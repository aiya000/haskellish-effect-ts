import tseslint from 'typescript-eslint'
import haskellishPlugin, {
  recommended as haskellishRecommended,
  strict as haskellishStrict,
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

export { haskellishPlugin }
