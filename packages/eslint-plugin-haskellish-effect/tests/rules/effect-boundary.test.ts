import '../setup.js'
import { RuleTester } from '@typescript-eslint/rule-tester'
import { effectBoundary } from '../../src/rules/effect-boundary.js'

const ruleTester = new RuleTester()

ruleTester.run('effect-boundary', effectBoundary, {
  valid: [
    // Non-exported functions are not checked
    { code: `function foo(): number { return 42 }` },
    // Exported with Effect return type
    {
      code: `export function foo(): Effect<number> { return Effect.succeed(42) }`,
    },
    // Exported with Effect.Effect return type
    {
      code: `export function foo(): Effect.Effect<number> { return Effect.succeed(42) }`,
    },
    // Arrow function with Effect return type
    { code: `export const foo = (): Effect<number> => Effect.succeed(42)` },
    // Non-function exports
    { code: `export const x = 42` },
    { code: `export type Foo = { x: number }` },
    // export { foo } where foo returns Effect
    {
      code: `const foo = (): Effect<number> => Effect.succeed(42); export { foo }`,
    },
    // export { foo as bar } where foo returns Effect
    {
      code: `function foo(): Effect<number> { return Effect.succeed(42) }; export { foo as bar }`,
    },
    // export default function with Effect return type
    {
      code: `export default function foo(): Effect<number> { return Effect.succeed(42) }`,
    },
    // export default arrow with Effect return type
    {
      code: `export default (): Effect<number> => Effect.succeed(42)`,
    },
    // export default name referencing an Effect function
    {
      code: `const foo = (): Effect<number> => Effect.succeed(42); export default foo`,
    },
    // export { foo } where foo is not a function (non-function bindings are not checked)
    {
      code: `const x = 42; export { x }`,
    },
    // export default non-function identifier (not tracked as function)
    {
      code: `const x = 42; export default x`,
    },
  ],
  invalid: [
    {
      code: `export function foo() { return 42 }`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    {
      code: `export function foo(): number { return 42 }`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    {
      code: `export const foo = () => 42`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    {
      code: `export const foo = (): number => 42`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    // export { foo } where foo does not return Effect
    {
      code: `const foo = (): number => 42; export { foo }`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    // export { foo as bar } where foo does not return Effect
    {
      code: `function foo(): number { return 42 }; export { foo as bar }`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    // export default function without Effect return type
    {
      code: `export default function foo(): number { return 42 }`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    // export default anonymous function without Effect return type
    {
      code: `export default function(): number { return 42 }`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    // export default arrow without Effect return type
    {
      code: `export default (): number => 42`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
    // export default name referencing a non-Effect function
    {
      code: `const foo = (): number => 42; export default foo`,
      errors: [{ messageId: 'missingEffectReturn' }],
    },
  ],
})
