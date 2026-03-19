/**
 * Unsafe bindings — explicit escape hatches.
 *
 * Importing from "haskellish-effect/unsafe" is the equivalent of
 * Haskell's System.IO.Unsafe — it signals that this module
 * intentionally accesses the global environment.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export const unsafeGlobalThis: typeof globalThis = globalThis

export const unsafeConsole: typeof console = console

export const unsafeFetch: typeof fetch = fetch

export const unsafeMath: typeof Math = Math

export const unsafeJSON: typeof JSON = JSON

export const unsafeDate: typeof Date = Date

export const unsafeSetTimeout: typeof setTimeout = setTimeout

export const unsafeSetInterval: typeof setInterval = setInterval

export const unsafeCrypto: typeof crypto = crypto

export const unsafePromise: typeof Promise = Promise
