import '../setup.js'
import { RuleTester } from '@typescript-eslint/rule-tester'
import { noImplicitGlobalThis } from '../../src/rules/no-implicit-globalthis.js'

const ruleTester = new RuleTester()

ruleTester.run('no-implicit-globalthis', noImplicitGlobalThis, {
  valid: [
    { code: `const x = 42` },
    { code: `function foo() { return "bar" }` },
    { code: `const globalThis = {}; globalThis.x` },
  ],
  invalid: [
    {
      code: `const x = globalThis`,
      errors: [{ messageId: 'blockedGlobalThis' }],
    },
    {
      code: `window.location`,
      errors: [{ messageId: 'blockedGlobalThis' }],
    },
    {
      code: `document.getElementById("app")`,
      errors: [{ messageId: 'blockedGlobalThis' }],
    },
    {
      code: `self.postMessage("hello")`,
      errors: [{ messageId: 'blockedGlobalThis' }],
    },
  ],
})
