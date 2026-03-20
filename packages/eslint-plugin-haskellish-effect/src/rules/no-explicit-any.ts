import { createRule } from "../utils/create-rule.js"

type Options = []
type MessageIds = "noAny"

export const noExplicitAny = createRule<Options, MessageIds>({
  name: "no-explicit-any",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow the `any` type annotation",
    },
    messages: {
      noAny:
        "The `any` type is not allowed. Use `unknown`, a specific type, or a generic parameter instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAnyKeyword(node) {
        context.report({ node, messageId: "noAny" })
      },
    }
  },
})
