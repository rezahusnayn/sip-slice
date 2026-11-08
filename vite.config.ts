import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Strict Content-Security-Policy for production builds only.
 * (The dev server needs an inline HMR preamble, so it is not applied in dev.)
 * No third-party origins are allowed: fonts and images are self-hosted and
 * the prototype makes no network calls.
 */
const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
  "object-src 'none'",
].join("; ");

const cspPlugin = (): Plugin => ({
  name: "inject-csp",
  apply: "build",
  transformIndexHtml: (html) =>
    html.replace("<head>", `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
});

export default defineConfig({
  plugins: [react(), cspPlugin()],
  // Never inline assets as data: URLs, so the strict font-src/img-src CSP holds.
  build: { assetsInlineLimit: 0 },
  server: { port: 5174, strictPort: true, host: "127.0.0.1" },
  preview: { port: 5175, strictPort: true, host: "127.0.0.1" },
});
