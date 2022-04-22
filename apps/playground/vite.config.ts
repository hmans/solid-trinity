import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "miniplex",
      "solid-trinity",
      "@hmans/controlfreak",
      "@hmans/signal",
      "@hmans/ui"
    ]
  },
  plugins: [solidPlugin()],
  build: {
    target: "esnext",
    polyfillDynamicImport: false
  }
})
