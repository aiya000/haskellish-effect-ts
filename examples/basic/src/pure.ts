/**
 * Pure functions — no side effects, no imports from unsafe modules.
 * Everything here is referentially transparent.
 */
import { pipe, Option, Either, Match, Array } from "haskellish-effect";

// Pure transformation with pipe
export const double = (n: number): number => n * 2;

export const doubleAll = (ns: ReadonlyArray<number>): ReadonlyArray<number> =>
  pipe(ns, Array.map(double));

// Option: safe handling of nullable values
export const safeDivide = (a: number, b: number): Option.Option<number> =>
  b === 0 ? Option.none() : Option.some(a / b);

export const safeHead = <A>(xs: ReadonlyArray<A>): Option.Option<A> =>
  Array.head(xs);

// Either: computations that can fail with typed errors
export type ValidationError =
  | { readonly _tag: "TooShort"; readonly minLength: number }
  | { readonly _tag: "TooLong"; readonly maxLength: number }
  | { readonly _tag: "InvalidChars" };

export const validateUsername = (
  input: string
): Either.Either<string, ValidationError> => {
  if (input.length < 3) {
    return Either.left({ _tag: "TooShort", minLength: 3 });
  }
  if (input.length > 20) {
    return Either.left({ _tag: "TooLong", maxLength: 20 });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(input)) {
    return Either.left({ _tag: "InvalidChars" });
  }
  return Either.right(input);
};

// Pattern matching with Match
export const describeValidation = (
  result: Either.Either<string, ValidationError>
): string =>
  pipe(
    result,
    Either.match({
      onLeft: (error) =>
        Match.value(error).pipe(
          Match.when({ _tag: "TooShort" }, (e) => `Too short (min ${e.minLength})`),
          Match.when({ _tag: "TooLong" }, (e) => `Too long (max ${e.maxLength})`),
          Match.when({ _tag: "InvalidChars" }, () => "Invalid characters"),
          Match.exhaustive
        ),
      onRight: (name) => `Valid: ${name}`,
    })
  );
