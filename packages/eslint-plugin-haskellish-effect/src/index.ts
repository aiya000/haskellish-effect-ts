import { onlyAllowedImports } from './rules/only-allowed-imports.js'
import { noGlobalAccess } from './rules/no-global-access.js'
import { noImplicitGlobalThis } from './rules/no-implicit-globalthis.js'
import { capabilityEnforcement } from './rules/capability-enforcement.js'
import { noPromise } from './rules/no-promise.js'
import { noExplicitAny } from './rules/no-explicit-any.js'
import { effectBoundary } from './rules/effect-boundary.js'
import { noThrow } from './rules/no-throw.js'
import { noMutation } from './rules/no-mutation.js'

const rules = {
  'only-allowed-imports': onlyAllowedImports,
  'no-global-access': noGlobalAccess,
  'no-implicit-globalthis': noImplicitGlobalThis,
  'capability-enforcement': capabilityEnforcement,
  'no-promise': noPromise,
  'no-explicit-any': noExplicitAny,
  'effect-boundary': effectBoundary,
  'no-throw': noThrow,
  'no-mutation': noMutation,
}

const plugin: {
  meta: { name: string; version: string }
  rules: typeof rules
  configs: Record<string, unknown>
} = {
  meta: {
    name: 'eslint-plugin-haskellish-effect',
    version: '0.1.0',
  },
  rules,
  configs: {},
}

// Flat configs need a reference to the plugin itself
const recommended = {
  plugins: {
    'haskellish-effect': plugin,
  },
  rules: {
    'haskellish-effect/only-allowed-imports': 'error',
    'haskellish-effect/no-global-access': 'error',
    'haskellish-effect/no-implicit-globalthis': 'error',
    'haskellish-effect/capability-enforcement': 'warn',
    'haskellish-effect/no-promise': 'warn',
    'haskellish-effect/no-explicit-any': 'warn',
    'haskellish-effect/no-throw': 'warn',
    'haskellish-effect/no-mutation': 'warn',
  } as const,
}

const strict = {
  plugins: {
    'haskellish-effect': plugin,
  },
  rules: {
    'haskellish-effect/only-allowed-imports': 'error',
    'haskellish-effect/no-global-access': 'error',
    'haskellish-effect/no-implicit-globalthis': 'error',
    'haskellish-effect/capability-enforcement': 'error',
    'haskellish-effect/no-promise': 'error',
    'haskellish-effect/no-explicit-any': 'error',
    'haskellish-effect/effect-boundary': 'error',
    'haskellish-effect/no-throw': 'error',
    'haskellish-effect/no-mutation': 'error',
  } as const,
}

// Creates an effects layer config for the given file patterns.
// Within matched directories:
// - Imports from any npm module are allowed
// - Direct global access is allowed
// - But exported functions must return Effect types
function createEffectsLayer(files: readonly string[]) {
  return {
    files: [...files],
    plugins: {
      'haskellish-effect': plugin,
    },
    rules: {
      'haskellish-effect/only-allowed-imports': 'off',
      'haskellish-effect/no-global-access': 'off',
      'haskellish-effect/no-implicit-globalthis': 'off',
      'haskellish-effect/capability-enforcement': 'off',
      'haskellish-effect/effect-boundary': 'error',
    } as const,
  }
}

// Default effects layer targeting **/effects/**/*.ts
const effectsLayer = createEffectsLayer(['**/effects/**/*.ts'])

Object.assign(plugin.configs, { recommended, strict, effectsLayer })

export default plugin
export { rules, recommended, strict, effectsLayer, createEffectsLayer }
