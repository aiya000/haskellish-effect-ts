import { createRule } from '../utils/create-rule.js'

type Options = []
type MessageIds = 'noAsync' | 'noNewPromise' | 'noPromiseStatic'

export const noPromise = createRule<Options, MessageIds>({
  name: 'no-promise',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow async functions, new Promise(), and Promise static methods. Use Effect instead.',
    },
    messages: {
      noAsync:
        'async functions are not allowed. Use Effect.gen or Effect.tryPromise instead.',
      noNewPromise: 'new Promise() is not allowed. Use Effect.async instead.',
      noPromiseStatic:
        'Promise.{{method}}() is not allowed. Use the Effect equivalent instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      FunctionDeclaration(node) {
        if (node.async) {
          context.report({ node, messageId: 'noAsync' })
        }
      },
      FunctionExpression(node) {
        if (node.async) {
          context.report({ node, messageId: 'noAsync' })
        }
      },
      ArrowFunctionExpression(node) {
        if (node.async) {
          context.report({ node, messageId: 'noAsync' })
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'Promise'
        ) {
          context.report({ node, messageId: 'noNewPromise' })
        }
      },
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'Promise' &&
          node.property.type === 'Identifier' &&
          node.parent?.type === 'CallExpression' &&
          node.parent.callee === node
        ) {
          context.report({
            node,
            messageId: 'noPromiseStatic',
            data: { method: node.property.name },
          })
        }
      },
    }
  },
})
