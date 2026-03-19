import { Effect, Data } from "effect";

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  readonly input: string;
  readonly reason: unknown;
}> {}

export class JsonStringifyError extends Data.TaggedError("JsonStringifyError")<{
  readonly reason: unknown;
}> {}

export const jsonParse = (input: string): Effect.Effect<unknown, JsonParseError> =>
  Effect.try({
    try: () => JSON.parse(input) as unknown,
    catch: (reason) => new JsonParseError({ input, reason }),
  });

export const jsonStringify = (value: unknown): Effect.Effect<string, JsonStringifyError> =>
  Effect.try({
    try: () => JSON.stringify(value),
    catch: (reason) => new JsonStringifyError({ reason }),
  });
