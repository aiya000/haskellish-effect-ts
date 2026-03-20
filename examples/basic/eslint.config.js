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
  {
    // Relax some rules for example files that intentionally demonstrate concepts
    files: ['src/unsafe-boundary.ts'],
    rules: {
      'haskellish-effect/no-global-access': 'off',
      'haskellish-effect/capability-enforcement': 'off',
    },
  },
  {
    files: ['src/migration-example.ts'],
    rules: {
      'haskellish-effect/only-allowed-imports': 'off',
      'haskellish-effect/no-global-access': 'off',
      'haskellish-effect/no-implicit-globalthis': 'off',
      'haskellish-effect/capability-enforcement': 'off',
      'haskellish-effect/no-promise': 'off',
      'haskellish-effect/no-explicit-any': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
]
