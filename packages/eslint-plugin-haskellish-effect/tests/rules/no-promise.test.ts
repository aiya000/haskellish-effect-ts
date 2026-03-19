import "../setup.js";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { noPromise } from "../../src/rules/no-promise.js";

const ruleTester = new RuleTester();

ruleTester.run("no-promise", noPromise, {
  valid: [
    { code: `function foo() { return 42 }` },
    { code: `const foo = () => 42` },
    { code: `const foo = function() { return 42 }` },
    // Using the word "Promise" as a type is fine (this is a syntactic rule)
    { code: `type P = Promise<number>` },
  ],
  invalid: [
    {
      code: `async function foo() { return 42 }`,
      errors: [{ messageId: "noAsync" }],
    },
    {
      code: `const foo = async () => 42`,
      errors: [{ messageId: "noAsync" }],
    },
    {
      code: `const foo = async function() { return 42 }`,
      errors: [{ messageId: "noAsync" }],
    },
    {
      code: `new Promise((resolve) => resolve(42))`,
      errors: [{ messageId: "noNewPromise" }],
    },
    {
      code: `Promise.all([])`,
      errors: [{ messageId: "noPromiseStatic" }],
    },
    {
      code: `Promise.resolve(42)`,
      errors: [{ messageId: "noPromiseStatic" }],
    },
  ],
});
