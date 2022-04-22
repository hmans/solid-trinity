import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "miniplex",
      "miniplex-react",
      "solid-trinity",
      "@hmans/controlfreak",
      "@hmans/signal",
      "@hmans/ui"
    ],
    include: ["react/jsx-runtime"]
  },
  plugins: [solidPlugin()],
  build: {
    target: "esnext",
    polyfillDynamicImport: false
  }
})
