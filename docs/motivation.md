# Motivation

## The Problem

TypeScript is a powerful language, but its flexibility is also its greatest danger. Any function can:

- Make network requests
- Read/write to the filesystem
- Access mutable global state
- Throw exceptions
- Log to the console
- Read the current time

...and **none of this is visible in the type signature**.

This means that when reading code — or when AI assistants generate code — there's no way to know what a function *actually does* just by looking at its signature. A function that returns `string` might also send an HTTP request, mutate a database, and log sensitive data.

## Why This Matters for AI-Assisted Development

AI coding assistants generate code at unprecedented speed. But speed without discipline creates more bugs, not fewer. When an AI generates a function, you need to be able to:

1. **Know what it does** — just from the type signature
2. **Know what it needs** — its dependencies are explicit
3. **Know what can go wrong** — errors are typed, not thrown

Without these guarantees, AI-generated code becomes a liability: it works in the happy path but hides complexity in invisible side effects.

## The Haskell Insight

Haskell solved this problem decades ago: **side effects must be explicit**. A function that returns `String` is pure. A function that returns `IO String` performs side effects. You can tell the difference *at a glance*.

This project brings that insight to TypeScript:

- **`number`** → pure computation
- **`Effect<number>`** → may perform side effects
- **`Effect<number, HttpError>`** → may fail with a typed error
- **`Effect<number, HttpError, UserService>`** → needs a UserService dependency

## Why Not Just Use Effect-TS Directly?

Effect-TS is excellent, but it doesn't *enforce* discipline. You can still:

- Import `effect` directly and mix it with raw `fetch` calls
- Use `console.log` anywhere
- Create `async` functions that bypass the Effect system
- Use `any` to escape type safety

This project adds the enforcement layer: an ESLint plugin that makes the discipline *mandatory*, not optional.

## The Closed World Model

In this system, **if you didn't import it, you can't use it**. This means:

- No implicit access to `fetch`, `console`, `Date`, `Math.random`, etc.
- All capabilities must be explicitly imported from `haskellish-effect`
- Unsafe access requires importing from `haskellish-effect/unsafe` — making the boundary visible

This is capability-based security applied to TypeScript development.
