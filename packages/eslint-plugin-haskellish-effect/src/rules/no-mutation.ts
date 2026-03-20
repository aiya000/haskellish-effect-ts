import { createRule } from '../utils/create-rule.js'

type Options = []
type MessageIds = 'noLet' | 'noAssignment' | 'noUpdateExpression'

export const noMutation = createRule<Options, MessageIds>({
  name: 'no-mutation',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow mutable bindings and reassignment. Use Ref for managed state instead.',
    },
    messages: {
      noLet:
        '`let` declarations are not allowed. Use `const` for bindings and Ref for mutable state.',
      noAssignment:
        'Assignment expressions are not allowed. Use Ref for managed state instead.',
      noUpdateExpression:
        'Update expressions (`++`/`--`) are not allowed. Use Ref for managed state instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind === 'let' || node.kind === 'var') {
          context.report({ node, messageId: 'noLet' })
        }
      },
      AssignmentExpression(node) {
        context.report({ node, messageId: 'noAssignment' })
      },
      UpdateExpression(node) {
        context.report({ node, messageId: 'noUpdateExpression' })
      },
    }
  },
})
