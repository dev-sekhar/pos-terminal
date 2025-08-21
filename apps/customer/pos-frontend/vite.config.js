import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../../../'), '');
  return {
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    allowedHosts: [".lvh.me", "lvh.me"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        // --- ADD THIS LOGGING BLOCK ---
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              "[VITE PROXY] Sending request to backend:",
              req.method,
              req.url
            );
            console.log("             Target:", options.target);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log(
              "[VITE PROXY] Received response from backend:",
              proxyRes.statusCode,
              req.url
            );
          });
          proxy.on("error", (err, req, res) => {
            console.error("[VITE PROXY] Error:", err);
          });
        },
      },
    },
  },
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME)
  }
};
});
