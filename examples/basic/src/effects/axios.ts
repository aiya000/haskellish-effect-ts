/**
 * Effects layer example: wrapping an external npm module (axios) with Effect types.
 *
 * In the `effects/` directory, imports from external npm modules are allowed,
 * but all exported functions must return Effect types.
 *
 * This file demonstrates wrapping a hypothetical HTTP client library
 * (like axios) with Effect types to make side effects explicit.
 */
import { Effect } from 'haskellish-effect'

// In a real project, you would import axios here:
//   import axios from 'axios'
// For this example, we define a minimal stand-in.
const axios = {
  get: (url: string) =>
    fetch(url).then((r) => r.json() as Promise<{ data: unknown }>),
  post: (url: string, data: unknown) =>
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => r.json() as Promise<{ data: unknown }>),
}

/**
 * GET request wrapped in Effect.
 * The side effect (HTTP call) is tracked in the type system.
 */
export const get = (url: string): Effect.Effect<{ data: unknown }, unknown> =>
  Effect.tryPromise({
    try: () => axios.get(url),
    catch: (error) => error,
  })

/**
 * POST request wrapped in Effect.
 * The side effect (HTTP call) is tracked in the type system.
 */
export const post = (
  url: string,
  body: unknown,
): Effect.Effect<{ data: unknown }, unknown> =>
  Effect.tryPromise({
    try: () => axios.post(url, body),
    catch: (error) => error,
  })
