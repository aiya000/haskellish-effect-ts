import { Effect } from 'effect'

// Core logging

export const consoleLog = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.log(...args))

export const consoleWarn = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.warn(...args))

export const consoleError = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.error(...args))

export const consoleInfo = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.info(...args))

export const consoleDebug = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.debug(...args))

// Inspection

export const consoleTrace = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.trace(...args))

export const consoleDir = (
  item: unknown,
  options?: {
    readonly depth?: number
    readonly colors?: boolean
    readonly showHidden?: boolean
  },
): Effect.Effect<void> => Effect.sync(() => console.dir(item, options))

export const consoleTable = (
  tabularData: unknown,
  properties?: ReadonlyArray<string>,
): Effect.Effect<void> =>
  Effect.sync(() =>
    console.table(tabularData, properties ? [...properties] : undefined),
  )

// Timing

export const consoleTime = (label?: string): Effect.Effect<void> =>
  Effect.sync(() => console.time(label))

export const consoleTimeEnd = (label?: string): Effect.Effect<void> =>
  Effect.sync(() => console.timeEnd(label))

export const consoleTimeLog = (
  label?: string,
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.timeLog(label, ...args))

// Grouping

export const consoleGroup = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.group(...args))

export const consoleGroupEnd: Effect.Effect<void> = Effect.sync(() =>
  console.groupEnd(),
)

export const consoleGroupCollapsed = (
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.groupCollapsed(...args))

// Counting

export const consoleCount = (label?: string): Effect.Effect<void> =>
  Effect.sync(() => console.count(label))

export const consoleCountReset = (label?: string): Effect.Effect<void> =>
  Effect.sync(() => console.countReset(label))

// Other

export const consoleClear: Effect.Effect<void> = Effect.sync(() =>
  console.clear(),
)

export const consoleAssert = (
  condition?: boolean,
  ...args: ReadonlyArray<unknown>
): Effect.Effect<void> => Effect.sync(() => console.assert(condition, ...args))
