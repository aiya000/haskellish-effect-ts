import { ESLintUtils } from '@typescript-eslint/utils'

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/haskellish-effect/eslint-plugin-haskellish-effect/blob/main/docs/rules/${name}.md`,
)
