import { Effect, Ref } from 'effect'

/**
 * Create a new IORef with an initial value.
 * Equivalent to Haskell's `newIORef`.
 */
export const newIORef = <A>(initial: A): Effect.Effect<Ref.Ref<A>> =>
  Ref.make(initial)

/**
 * Read the current value of an IORef.
 * Equivalent to Haskell's `readIORef`.
 */
export const readIORef = <A>(ref: Ref.Ref<A>): Effect.Effect<A> => Ref.get(ref)

/**
 * Write a new value to an IORef.
 * Equivalent to Haskell's `writeIORef`.
 */
export const writeIORef = <A>(ref: Ref.Ref<A>, value: A): Effect.Effect<void> =>
  Ref.set(ref, value)

/**
 * Modify the value of an IORef using a pure function.
 * Equivalent to Haskell's `modifyIORef`.
 */
export const modifyIORef = <A>(
  ref: Ref.Ref<A>,
  f: (a: A) => A,
): Effect.Effect<void> => Ref.update(ref, f)
