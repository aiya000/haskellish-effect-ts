import { Effect, Data } from "effect";

export class FetchError extends Data.TaggedError("FetchError")<{
  readonly reason: unknown;
}> {}

export class HttpError extends Data.TaggedError("HttpError")<{
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
}> {}

export const tryFetch = (
  input: string | URL | Request,
  init?: RequestInit
): Effect.Effect<Response, FetchError | HttpError> =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(input, init),
      catch: (reason) => new FetchError({ reason }),
    });
    if (!response.ok) {
      return yield* Effect.fail(
        new HttpError({
          status: response.status,
          statusText: response.statusText,
          url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
        })
      );
    }
    return response;
  });
