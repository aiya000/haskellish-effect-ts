import { createRule } from '../utils/create-rule.js'

type Options = []
type MessageIds = 'noThrow'

export const noThrow = createRule<Options, MessageIds>({
  name: 'no-throw',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow throw statements. Use Effect.fail or Effect.die instead.',
    },
    messages: {
      noThrow:
        'throw statements are not allowed. Use Effect.fail for expected errors or Effect.die for defects instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ThrowStatement(node) {
        context.report({ node, messageId: 'noThrow' })
      },
    }
  },
})
