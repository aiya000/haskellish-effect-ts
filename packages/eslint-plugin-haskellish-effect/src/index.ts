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
    'haskellish-effect/only-allowed-imports': 'error' as const,
    'haskellish-effect/no-global-access': 'error' as const,
    'haskellish-effect/no-implicit-globalthis': 'error' as const,
    'haskellish-effect/capability-enforcement': 'warn' as const,
    'haskellish-effect/no-promise': 'warn' as const,
    'haskellish-effect/no-explicit-any': 'warn' as const,
    'haskellish-effect/no-throw': 'warn' as const,
    'haskellish-effect/no-mutation': 'warn' as const,
  },
}

const strict = {
  plugins: {
    'haskellish-effect': plugin,
  },
  rules: {
    'haskellish-effect/only-allowed-imports': 'error' as const,
    'haskellish-effect/no-global-access': 'error' as const,
    'haskellish-effect/no-implicit-globalthis': 'error' as const,
    'haskellish-effect/capability-enforcement': 'error' as const,
    'haskellish-effect/no-promise': 'error' as const,
    'haskellish-effect/no-explicit-any': 'error' as const,
    'haskellish-effect/effect-boundary': 'error' as const,
    'haskellish-effect/no-throw': 'error' as const,
    'haskellish-effect/no-mutation': 'error' as const,
  },
}

// Effects layer config — used in `effects/` directories where users wrap
// external npm modules with Effect types.
//
// Within these directories:
// - Imports from any npm module are allowed
// - Direct global access is allowed
// - But exported functions must return Effect types
//
// Default file patterns: **/effects/**/*.ts
const effectsLayer = {
  files: ['**/effects/**/*.ts'],
  plugins: {
    'haskellish-effect': plugin,
  },
  rules: {
    'haskellish-effect/only-allowed-imports': 'off' as const,
    'haskellish-effect/no-global-access': 'off' as const,
    'haskellish-effect/no-implicit-globalthis': 'off' as const,
    'haskellish-effect/capability-enforcement': 'off' as const,
    'haskellish-effect/effect-boundary': 'error' as const,
  },
}

Object.assign(plugin.configs, { recommended, strict, effectsLayer })

export default plugin
export { rules, recommended, strict, effectsLayer }
