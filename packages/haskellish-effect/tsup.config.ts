import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    unsafe: "src/unsafe.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  clean: true,
  external: ["effect"],
})
