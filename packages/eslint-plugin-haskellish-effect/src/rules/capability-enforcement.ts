import type { Scope } from '@typescript-eslint/utils/ts-eslint'
import { createRule } from '../utils/create-rule.js'
import { isAllowedImportSource } from '../utils/allowed-sources.js'

const ALWAYS_ALLOWED_GLOBALS = new Set([
  // Primitives & constructors
  'undefined',
  'NaN',
  'Infinity',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURIComponent',
  'decodeURIComponent',
  'encodeURI',
  'decodeURI',
  // Pure constructors
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'BigInt',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'WeakRef',
  'FinalizationRegistry',
  'RegExp',
  'Proxy',
  'Reflect',
  // Typed arrays
  'ArrayBuffer',
  'SharedArrayBuffer',
  'DataView',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
  // Errors
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'URIError',
  'EvalError',
  'AggregateError',
  // Iteration
  'Iterator',
  // Utilities
  'structuredClone',
  'TextEncoder',
  'TextDecoder',
  // Type-level globals (used in type annotations)
  'ReadonlyArray',
  'ReadonlyMap',
  'ReadonlySet',
  'Readonly',
  'Partial',
  'Required',
  'Pick',
  'Omit',
  'Record',
  'Exclude',
  'Extract',
  'NonNullable',
  'Parameters',
  'ReturnType',
  'InstanceType',
  'ConstructorParameters',
  'Awaited',
  'PromiseLike',
  'Iterable',
  'IterableIterator',
  'AsyncIterable',
  'AsyncIterableIterator',
  'Generator',
  'AsyncGenerator',
])

type Options = [{ allowedPackages?: string[]; allowedGlobals?: string[] }]
type MessageIds = 'disallowedGlobal' | 'disallowedImport'

export const capabilityEnforcement = createRule<Options, MessageIds>({
  name: 'capability-enforcement',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce closed-world model: all bindings must come from allowed sources or be pure globals',
    },
    messages: {
      disallowedGlobal:
        'Access to global "{{name}}" is not allowed in the closed-world model. Use a safe wrapper from haskellish-effect or an unsafe binding from haskellish-effect/unsafe.',
      disallowedImport:
        'Import from "{{source}}" is not allowed. Use haskellish-effect or add it to allowedPackages.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPackages: {
            type: 'array',
            items: { type: 'string' },
          },
          allowedGlobals: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const [options] = context.options
    const allowedPackages = options?.allowedPackages ?? []
    const additionalAllowedGlobals = new Set(options?.allowedGlobals ?? [])

    function isAllowedGlobal(name: string): boolean {
      return (
        ALWAYS_ALLOWED_GLOBALS.has(name) || additionalAllowedGlobals.has(name)
      )
    }

    function getImportSource(def: Scope.Definition): string | null {
      const node = def.node
      if (def.type === 'ImportBinding') {
        const parent = node.parent
        if (parent && parent.type === 'ImportDeclaration') {
          return parent.source.value
        }
      }
      return null
    }

    function checkScope(scope: Scope.Scope) {
      for (const ref of scope.references) {
        if (ref.isWriteOnly()) continue

        const resolved = ref.resolved

        if (resolved === null || resolved.defs.length === 0) {
          // Unresolved or built-in global
          if (!isAllowedGlobal(ref.identifier.name)) {
            context.report({
              node: ref.identifier,
              messageId: 'disallowedGlobal',
              data: { name: ref.identifier.name },
            })
          }
          continue
        }

        for (const def of resolved.defs) {
          if (def.type === 'ImportBinding') {
            const source = getImportSource(def)
            if (
              source !== null &&
              !isAllowedImportSource(source, allowedPackages)
            ) {
              context.report({
                node: ref.identifier,
                messageId: 'disallowedImport',
                data: { source },
              })
            }
          }
          // Local defs (Variable, FunctionName, ClassName, Parameter, CatchClause) are always OK
        }
      }

      for (const childScope of scope.childScopes) {
        checkScope(childScope)
      }
    }

    return {
      'Program:exit'(node) {
        const scope = context.sourceCode.getScope(node)
        checkScope(scope)
      },
    }
  },
})
