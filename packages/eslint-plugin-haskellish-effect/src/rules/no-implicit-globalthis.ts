import type { Scope } from "@typescript-eslint/utils/ts-eslint"
import { createRule } from "../utils/create-rule.js"

const BLOCKED_GLOBALS = new Set(["globalThis", "window", "document", "self"])

type Options = []
type MessageIds = "blockedGlobalThis"

function collectBlockedReferences(scope: Scope.Scope) {
  const results: Scope.Reference[] = []

  // Check unresolved references
  for (const ref of scope.through) {
    if (BLOCKED_GLOBALS.has(ref.identifier.name)) {
      results.push(ref)
    }
  }

  // Check resolved references to implicit globals (0 defs)
  function walk(s: Scope.Scope) {
    for (const ref of s.references) {
      if (
        ref.resolved &&
        ref.resolved.defs.length === 0 &&
        BLOCKED_GLOBALS.has(ref.identifier.name)
      ) {
        results.push(ref)
      }
    }
    for (const child of s.childScopes) {
      walk(child)
    }
  }
  walk(scope)

  return results
}

export const noImplicitGlobalThis = createRule<Options, MessageIds>({
  name: "no-implicit-globalthis",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow direct access to globalThis, window, document, and self",
    },
    messages: {
      blockedGlobalThis:
        'Direct access to "{{name}}" is not allowed. Use unsafeGlobalThis from haskellish-effect/unsafe if you need global access.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      "Program:exit"(node) {
        const scope = context.sourceCode.getScope(node)
        const refs = collectBlockedReferences(scope)

        for (const ref of refs) {
          context.report({
            node: ref.identifier,
            messageId: "blockedGlobalThis",
            data: { name: ref.identifier.name },
          })
        }
      },
    }
  },
})
