import { Effect } from 'effect'

export const safeRandom: Effect.Effect<number> = Effect.sync(() =>
  Math.random(),
)
