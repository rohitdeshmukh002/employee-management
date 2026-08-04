// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
// - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
// componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
// error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8000";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Node server output for Docker / self-hosted deploys (Lovable still forces Cloudflare in its builds).
  nitro: {
    preset: "node-server",
  },
  vite: {
    environments: {
      ssr: {
        build: {
          rollupOptions: {
            input: "./src/server.ts",
          },
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      // Docker Desktop on Windows does not reliably forward native file events
      // into the container — polling makes HMR see host edits.
      watch: {
        usePolling: true,
        interval: 500,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.tanstack/**",
          "**/routeTree.gen.ts",
          "**/.output/**",
        ],
      },
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  },
});
