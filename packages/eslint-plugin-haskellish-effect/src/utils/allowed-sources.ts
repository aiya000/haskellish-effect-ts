const DEFAULT_ALLOWED_PATTERNS = [
  /^haskellish-effect(\/.*)?$/,
  /^@haskellish\/.*/,
  /^\.\.?\//,
  /^@\//,
]

export function isAllowedImportSource(
  source: string,
  additionalAllowed: readonly string[] = [],
): boolean {
  if (DEFAULT_ALLOWED_PATTERNS.some((pattern) => pattern.test(source))) {
    return true
  }
  return additionalAllowed.some((pkg) => {
    if (pkg.endsWith("/*")) {
      const prefix = pkg.slice(0, -1)
      return source === pkg.slice(0, -2) || source.startsWith(prefix)
    }
    return source === pkg || source.startsWith(pkg + "/")
  })
}
