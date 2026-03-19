import { Effect } from "effect";

export const safeNow: Effect.Effect<number> = Effect.sync(() => Date.now());

export const safeDate: Effect.Effect<Date> = Effect.sync(() => new Date());
