import '../setup.js'
import { RuleTester } from '@typescript-eslint/rule-tester'
import { noMutation } from '../../src/rules/no-mutation.js'

const ruleTester = new RuleTester()

ruleTester.run('no-mutation', noMutation, {
  valid: [
    { code: `const x = 42` },
    { code: `const obj = { a: 1, b: 2 }` },
    { code: `const arr = [1, 2, 3]` },
    { code: `function foo() { return 42 }` },
    { code: `const foo = () => 42` },
    { code: `for (const x of [1, 2, 3]) {}` },
    { code: `const { a, b } = { a: 1, b: 2 }` },
    { code: `const [a, b] = [1, 2]` },
  ],
  invalid: [
    {
      code: `let x = 42`,
      errors: [{ messageId: 'noLet' }],
    },
    {
      code: `var x = 42`,
      errors: [{ messageId: 'noLet' }],
    },
    {
      code: `let x; x = 42`,
      errors: [{ messageId: 'noLet' }, { messageId: 'noAssignment' }],
    },
    {
      code: `const x = 1; const obj = { a: x }; obj.a = 2`,
      errors: [{ messageId: 'noAssignment' }],
    },
    {
      code: `const arr = [1]; arr[0] = 2`,
      errors: [{ messageId: 'noAssignment' }],
    },
    {
      code: `const x = 0; x += 1`,
      errors: [{ messageId: 'noAssignment' }],
    },
    {
      code: `const x = 0; x -= 1`,
      errors: [{ messageId: 'noAssignment' }],
    },
    {
      code: `let i = 0; i++`,
      errors: [{ messageId: 'noLet' }, { messageId: 'noUpdateExpression' }],
    },
    {
      code: `let i = 0; i--`,
      errors: [{ messageId: 'noLet' }, { messageId: 'noUpdateExpression' }],
    },
    {
      code: `let i = 0; ++i`,
      errors: [{ messageId: 'noLet' }, { messageId: 'noUpdateExpression' }],
    },
    {
      code: `for (let i = 0; i < 10; i++) {}`,
      errors: [{ messageId: 'noLet' }, { messageId: 'noUpdateExpression' }],
    },
  ],
})
