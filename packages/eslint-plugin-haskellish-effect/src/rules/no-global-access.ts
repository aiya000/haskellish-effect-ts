import type { Scope } from "@typescript-eslint/utils/ts-eslint";
import { createRule } from "../utils/create-rule.js";

const DEFAULT_BLOCKED_GLOBALS = [
  "fetch",
  "console",
  "Math",
  "JSON",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "Date",
  "Promise",
  "crypto",
  "URL",
  "Headers",
  "Request",
  "Response",
  "AbortController",
  "FormData",
  "Blob",
  "performance",
  "navigator",
  "localStorage",
  "sessionStorage",
  "alert",
  "confirm",
  "prompt",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "atob",
  "btoa",
  "queueMicrotask",
  "requestAnimationFrame",
  "cancelAnimationFrame",
];

type Options = [{ blocked?: string[]; additionalBlocked?: string[] }];
type MessageIds = "blockedGlobal";

function collectGlobalReferences(scope: Scope.Scope, blockedSet: Set<string>) {
  const results: Scope.Reference[] = [];

  // Check unresolved references (scope.through)
  for (const ref of scope.through) {
    if (blockedSet.has(ref.identifier.name)) {
      results.push(ref);
    }
  }

  // Check resolved references that resolve to implicit globals (0 defs)
  function walk(s: Scope.Scope) {
    for (const ref of s.references) {
      if (ref.resolved && ref.resolved.defs.length === 0 && blockedSet.has(ref.identifier.name)) {
        results.push(ref);
      }
    }
    for (const child of s.childScopes) {
      walk(child);
    }
  }
  walk(scope);

  return results;
}

export const noGlobalAccess = createRule<Options, MessageIds>({
  name: "no-global-access",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow direct access to effectful global APIs",
    },
    messages: {
      blockedGlobal:
        'Direct access to global "{{name}}" is not allowed. Use the safe wrapper from haskellish-effect or the unsafe binding from haskellish-effect/unsafe.',
    },
    schema: [
      {
        type: "object",
        properties: {
          blocked: {
            type: "array",
            items: { type: "string" },
          },
          additionalBlocked: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const [options] = context.options;
    const blockedSet = new Set(
      options?.blocked ?? [
        ...DEFAULT_BLOCKED_GLOBALS,
        ...(options?.additionalBlocked ?? []),
      ]
    );
    if (options?.blocked && options?.additionalBlocked) {
      for (const name of options.additionalBlocked) {
        blockedSet.add(name);
      }
    }

    return {
      "Program:exit"(node) {
        const scope = context.sourceCode.getScope(node);
        const refs = collectGlobalReferences(scope, blockedSet);

        for (const ref of refs) {
          context.report({
            node: ref.identifier,
            messageId: "blockedGlobal",
            data: { name: ref.identifier.name },
          });
        }
      },
    };
  },
});
