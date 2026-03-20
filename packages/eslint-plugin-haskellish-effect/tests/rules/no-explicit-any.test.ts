import '../setup.js'
import { RuleTester } from '@typescript-eslint/rule-tester'
import { noExplicitAny } from '../../src/rules/no-explicit-any.js'

const ruleTester = new RuleTester()

ruleTester.run('no-explicit-any', noExplicitAny, {
  valid: [
    { code: `const x: unknown = 42` },
    { code: `const x: number = 42` },
    { code: `function foo(x: unknown): void {}` },
    { code: `type Foo<T> = { value: T }` },
  ],
  invalid: [
    {
      code: `const x: any = 42`,
      errors: [{ messageId: 'noAny' }],
    },
    {
      code: `function foo(x: any): void {}`,
      errors: [{ messageId: 'noAny' }],
    },
    {
      code: `function foo(): any { return 42 }`,
      errors: [{ messageId: 'noAny' }],
    },
    {
      code: `type Foo = { value: any }`,
      errors: [{ messageId: 'noAny' }],
    },
  ],
})
