import { Effect } from "effect";

export const safeSetTimeout = (delay: number): Effect.Effect<void> =>
  Effect.async<void>((resume) => {
    const id = setTimeout(() => {
      resume(Effect.void);
    }, delay);
    return Effect.sync(() => {
      clearTimeout(id);
    });
  });

export const safeSetInterval = (
  callback: () => void,
  interval: number
): Effect.Effect<void, never, never> =>
  Effect.async<void>((resume) => {
    const id = setInterval(callback, interval);
    return Effect.sync(() => {
      clearInterval(id);
      resume(Effect.void);
    });
  });
