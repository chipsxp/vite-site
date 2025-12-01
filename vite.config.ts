import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adeApiKey =
    env.VISION_AGENT_API_KEY ?? env.VITE_VISION_AGENT_API_KEY ?? "";
  const authHeaders = adeApiKey ? { Authorization: `Bearer ${adeApiKey}` } : {};

  return {
    plugins: [react()],  
    server: {
      proxy: {
        "/api/ade/parse": {
          target: "https://api.va.landing.ai",
          changeOrigin: true,
          secure: true,
          rewrite: (path) =>
            path.replace(/^\/api\/ade\/parse/, "/v1/ade/parse"),
          headers: authHeaders,
        },
        "/api/ade/extract": {
          target: "https://api.va.landing.ai",
          changeOrigin: true,
          secure: true,
          rewrite: (path) =>
            path.replace(/^\/api\/ade\/extract/, "/v1/ade/extract"),
          headers: authHeaders,
        },
      },
    },
  };
});
