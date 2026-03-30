import tseslint from 'typescript-eslint'

export default tseslint.config(...tseslint.configs.recommended, {
  ignores: ['**/dist/**', '**/node_modules/**'],
  rules: {
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'never' },
    ],
  },
})
