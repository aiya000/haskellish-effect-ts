import "../setup.js"
import { RuleTester } from "@typescript-eslint/rule-tester"
import { capabilityEnforcement } from "../../src/rules/capability-enforcement.js"

const ruleTester = new RuleTester()

ruleTester.run("capability-enforcement", capabilityEnforcement, {
  valid: [
    // Local variable
    { code: `const x = 42; const y = x + 1` },
    // Function declaration
    { code: `function foo() { return 42 } foo()` },
    // Pure global constructors
    { code: `const arr = new Array(5)` },
    { code: `const m = new Map()` },
    { code: `const s = new Set()` },
    { code: `const x = parseInt("42")` },
    { code: `const x = parseFloat("3.14")` },
    { code: `const x = Number.isNaN(42)` },
    { code: `const x = isNaN(42)` },
    { code: `const e = new Error("oops")` },
    { code: `const e = new TypeError("bad type")` },
    { code: `const x = encodeURIComponent("hello world")` },
    { code: `const x = structuredClone({ a: 1 })` },
    // Allowed import
    { code: `import { Effect } from "haskellish-effect"; Effect.void` },
    // Relative import
    { code: `import { foo } from "./local"; foo()` },
    // Additional allowed
    {
      code: `import { z } from "zod"; z.string()`,
      options: [{ allowedPackages: ["zod"] }],
    },
    // Additional allowed globals
    {
      code: `console.log("hi")`,
      options: [{ allowedGlobals: ["console"] }],
    },
  ],
  invalid: [
    {
      code: `fetch("https://example.com")`,
      errors: [{ messageId: "disallowedGlobal" }],
    },
    {
      code: `console.log("hello")`,
      errors: [{ messageId: "disallowedGlobal" }],
    },
    {
      code: `const d = new Date()`,
      errors: [{ messageId: "disallowedGlobal" }],
    },
    {
      code: `import { foo } from "effect"; foo()`,
      errors: [{ messageId: "disallowedImport" }],
    },
    {
      code: `import express from "express"; express()`,
      errors: [{ messageId: "disallowedImport" }],
    },
  ],
})
