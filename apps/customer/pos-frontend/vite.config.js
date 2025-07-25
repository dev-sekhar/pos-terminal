// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // This is correct. Vite should only bind to the local network interface.
    host: "127.0.0.1",
    port: 5173,

    // This is the FIX. We are whitelisting any subdomain of lvh.me.
    // The leading dot is a wildcard for all subdomains.
    allowedHosts: [".lvh.me"],
  },
});
