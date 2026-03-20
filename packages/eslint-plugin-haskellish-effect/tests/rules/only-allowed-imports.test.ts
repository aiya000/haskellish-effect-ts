import "../setup.js"
import { RuleTester } from "@typescript-eslint/rule-tester"
import { onlyAllowedImports } from "../../src/rules/only-allowed-imports.js"

const ruleTester = new RuleTester()

ruleTester.run("only-allowed-imports", onlyAllowedImports, {
  valid: [
    { code: `import { Effect } from "haskellish-effect"` },
    { code: `import { unsafeConsole } from "haskellish-effect/unsafe"` },
    { code: `import { foo } from "./local"` },
    { code: `import { foo } from "../parent"` },
    { code: `import { foo } from "@/alias"` },
    { code: `import { foo } from "@haskellish/some-pkg"` },
    {
      code: `import { something } from "lodash"`,
      options: [{ allowedPackages: ["lodash"] }],
    },
    {
      code: `import { z } from "zod"`,
      options: [{ allowedPackages: ["zod"] }],
    },
  ],
  invalid: [
    {
      code: `import { Effect } from "effect"`,
      errors: [{ messageId: "disallowedImport" }],
    },
    {
      code: `import { Schema } from "@effect/schema"`,
      errors: [{ messageId: "disallowedImport" }],
    },
    {
      code: `import express from "express"`,
      errors: [{ messageId: "disallowedImport" }],
    },
    {
      code: `export { foo } from "some-package"`,
      errors: [{ messageId: "disallowedImport" }],
    },
    {
      code: `export * from "some-package"`,
      errors: [{ messageId: "disallowedImport" }],
    },
    {
      code: `const m = import("some-package")`,
      errors: [{ messageId: "disallowedImport" }],
    },
  ],
})
