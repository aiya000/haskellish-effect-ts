import '../setup.js'
import { RuleTester } from '@typescript-eslint/rule-tester'
import { noThrow } from '../../src/rules/no-throw.js'

const ruleTester = new RuleTester()

ruleTester.run('no-throw', noThrow, {
  valid: [
    { code: `function foo() { return 42 }` },
    { code: `const foo = () => 42` },
    { code: `const foo = function() { return 42 }` },
    { code: `try { } catch (e) { }` },
    { code: `const error = new Error("oops")` },
  ],
  invalid: [
    {
      code: `throw new Error("oops")`,
      errors: [{ messageId: 'noThrow' }],
    },
    {
      code: `function foo() { throw new Error("oops") }`,
      errors: [{ messageId: 'noThrow' }],
    },
    {
      code: `const foo = () => { throw new Error("oops") }`,
      errors: [{ messageId: 'noThrow' }],
    },
    {
      code: `throw "string error"`,
      errors: [{ messageId: 'noThrow' }],
    },
    {
      code: `if (true) { throw new Error("conditional") }`,
      errors: [{ messageId: 'noThrow' }],
    },
  ],
})
