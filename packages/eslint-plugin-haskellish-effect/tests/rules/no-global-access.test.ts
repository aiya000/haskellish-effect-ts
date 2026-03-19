import "../setup.js";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { noGlobalAccess } from "../../src/rules/no-global-access.js";

const ruleTester = new RuleTester();

ruleTester.run("no-global-access", noGlobalAccess, {
  valid: [
    { code: `const x = 1 + 2` },
    { code: `const arr = [1, 2, 3]` },
    { code: `function foo() { return 42 }` },
    { code: `const myFetch = () => {}; myFetch()` },
    {
      code: `const x = parseInt("42")`,
    },
  ],
  invalid: [
    {
      code: `fetch("https://example.com")`,
      errors: [{ messageId: "blockedGlobal" }],
    },
    {
      code: `console.log("hello")`,
      errors: [{ messageId: "blockedGlobal" }],
    },
    {
      code: `const r = Math.random()`,
      errors: [{ messageId: "blockedGlobal" }],
    },
    {
      code: `const d = new Date()`,
      errors: [{ messageId: "blockedGlobal" }],
    },
    {
      code: `JSON.parse("{}")`,
      errors: [{ messageId: "blockedGlobal" }],
    },
    {
      code: `setTimeout(() => {}, 100)`,
      errors: [{ messageId: "blockedGlobal" }],
    },
    {
      code: `const p = new Promise(() => {})`,
      errors: [{ messageId: "blockedGlobal" }],
    },
  ],
});
