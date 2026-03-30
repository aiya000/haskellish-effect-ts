import type { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/create-rule.js'

type Options = []
type MessageIds = 'missingEffectReturn'

function hasEffectReturnType(
  returnType: TSESTree.TSTypeAnnotation | undefined,
): boolean {
  if (!returnType) return false

  const typeAnnotation = returnType.typeAnnotation

  // Effect<...>
  if (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.type === 'Identifier' &&
    typeAnnotation.typeName.name === 'Effect'
  ) {
    return true
  }

  // Effect.Effect<...>
  if (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.type === 'TSQualifiedName' &&
    typeAnnotation.typeName.left.type === 'Identifier' &&
    typeAnnotation.typeName.left.name === 'Effect' &&
    typeAnnotation.typeName.right.name === 'Effect'
  ) {
    return true
  }

  return false
}

function getFunctionNode(
  node: TSESTree.Node,
):
  | TSESTree.FunctionDeclaration
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression
  | null {
  if (
    node.type === 'FunctionDeclaration' ||
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionExpression'
  ) {
    return node
  }
  return null
}

export const effectBoundary = createRule<Options, MessageIds>({
  name: 'effect-boundary',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Exported functions should have an Effect return type annotation',
    },
    messages: {
      missingEffectReturn:
        'Exported function "{{name}}" should have an explicit Effect return type annotation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // Track function declarations/expressions at module scope so we can
    // check them when they appear in `export { name }` or `export default name`.
    const scopeBindings = new Map<
      string,
      {
        functionNode:
          | TSESTree.FunctionDeclaration
          | TSESTree.ArrowFunctionExpression
          | TSESTree.FunctionExpression
      }
    >()

    function checkFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression,
      name: string,
    ) {
      if (!hasEffectReturnType(node.returnType)) {
        context.report({
          node,
          messageId: 'missingEffectReturn',
          data: { name },
        })
      }
    }

    return {
      // Track top-level function declarations: function foo() { ... }
      'Program > FunctionDeclaration'(node: TSESTree.FunctionDeclaration) {
        if (node.id) {
          scopeBindings.set(node.id.name, { functionNode: node })
        }
      },

      // Track top-level variable declarations: const foo = () => ...
      'Program > VariableDeclaration > VariableDeclarator'(
        node: TSESTree.VariableDeclarator,
      ) {
        if (node.id.type === 'Identifier' && node.init) {
          const fn = getFunctionNode(node.init)
          if (fn) {
            scopeBindings.set(node.id.name, { functionNode: fn })
          }
        }
      },

      // export function foo() { ... }
      'ExportNamedDeclaration > FunctionDeclaration'(
        node: TSESTree.FunctionDeclaration,
      ) {
        if (node.id) {
          checkFunction(node, node.id.name)
        }
      },

      // export const foo = () => ...
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(
        node: TSESTree.VariableDeclarator,
      ) {
        if (
          node.id.type === 'Identifier' &&
          node.init &&
          (node.init.type === 'ArrowFunctionExpression' ||
            node.init.type === 'FunctionExpression')
        ) {
          checkFunction(node.init, node.id.name)
        }
      },

      // export { foo } / export { foo as bar }
      'ExportNamedDeclaration > ExportSpecifier'(
        node: TSESTree.ExportSpecifier,
      ) {
        const localName =
          node.local.type === 'Identifier' ? node.local.name : undefined
        if (!localName) return

        const binding = scopeBindings.get(localName)
        if (binding) {
          const exportedName =
            node.exported.type === 'Identifier'
              ? node.exported.name
              : localName
          checkFunction(binding.functionNode, exportedName)
        }
      },

      // export default function foo() { ... } / export default function() { ... }
      ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration) {
        const decl = node.declaration

        // export default function foo() { ... }
        // export default function() { ... }
        const fn = getFunctionNode(decl)
        if (fn) {
          const name =
            fn.type === 'FunctionDeclaration' && fn.id
              ? fn.id.name
              : 'default'
          checkFunction(fn, name)
          return
        }

        // export default foo  (where foo is a previously-declared function)
        if (decl.type === 'Identifier') {
          const binding = scopeBindings.get(decl.name)
          if (binding) {
            checkFunction(binding.functionNode, decl.name)
          }
        }
      },
    }
  },
})
