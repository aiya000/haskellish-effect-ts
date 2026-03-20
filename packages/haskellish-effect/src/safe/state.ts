import { Effect, Ref } from 'effect'

/**
 * Run a stateful computation with an initial state, returning both the result and the final state.
 * Equivalent to Haskell's `runState`.
 */
export const runState = <S, A, E, R>(
  initial: S,
  computation: (ref: Ref.Ref<S>) => Effect.Effect<A, E, R>,
): Effect.Effect<readonly [A, S], E, R> =>
  Effect.gen(function* () {
    const ref = yield* Ref.make(initial)
    const result = yield* computation(ref)
    const finalState = yield* Ref.get(ref)
    return [result, finalState] as const
  })

/**
 * Get the current state.
 * Equivalent to Haskell's `get` in the State monad.
 */
export const getState = <S>(ref: Ref.Ref<S>): Effect.Effect<S> => Ref.get(ref)

/**
 * Replace the current state with a new value.
 * Equivalent to Haskell's `put` in the State monad.
 */
export const putState = <S>(ref: Ref.Ref<S>, value: S): Effect.Effect<void> =>
  Ref.set(ref, value)

/**
 * Modify the current state using a pure function.
 * Equivalent to Haskell's `modify` in the State monad.
 */
export const modifyState = <S>(
  ref: Ref.Ref<S>,
  f: (s: S) => S,
): Effect.Effect<void> => Ref.update(ref, f)
