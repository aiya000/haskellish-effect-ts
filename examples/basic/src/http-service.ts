/**
 * Effect-based HTTP service with dependency injection.
 * Demonstrates Context.Tag + Layer pattern (analogous to Haskell's Reader + IO).
 */
import {
  Effect,
  Context,
  Layer,
  Schema,
  pipe,
  tryFetch,
  jsonParse,
} from "haskellish-effect"

// --- Domain types ---

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
})

type User = typeof User.Type

// --- Service definition (like a Haskell typeclass) ---

export class UserService extends Context.Tag("UserService")<
  UserService,
  {
    readonly getUser: (id: number) => Effect.Effect<User, unknown>
    readonly listUsers: () => Effect.Effect<ReadonlyArray<User>, unknown>
  }
>() {}

// --- Service implementation (like a Haskell instance) ---

export const UserServiceLive = Layer.succeed(UserService, {
  getUser: (id) =>
    pipe(
      tryFetch(`https://jsonplaceholder.typicode.com/users/${id}`),
      Effect.flatMap((response) =>
        Effect.tryPromise({
          try: () => response.text(),
          catch: (e) => e,
        }),
      ),
      Effect.flatMap((text) => jsonParse(text)),
      Effect.flatMap(Schema.decodeUnknown(User)),
    ),
  listUsers: () =>
    pipe(
      tryFetch("https://jsonplaceholder.typicode.com/users"),
      Effect.flatMap((response) =>
        Effect.tryPromise({
          try: () => response.text(),
          catch: (e) => e,
        }),
      ),
      Effect.flatMap((text) => jsonParse(text)),
      Effect.flatMap(Schema.decodeUnknown(Schema.Array(User))),
    ),
})

// --- Usage (pure program description, no side effects until run) ---

export const program = Effect.gen(function* () {
  const userService = yield* UserService
  const user = yield* userService.getUser(1)
  return user
})
