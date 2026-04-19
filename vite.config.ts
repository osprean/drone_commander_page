import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_TARGET || "http://localhost:5000";

  const defaultProxy: ProxyOptions = {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
    ws: true,
    cookieDomainRewrite: "localhost",
  };

  const proxyPrefixes = ["/api", "/login", "/logout", "/@me", "/socket.io"];
  const proxy: Record<string, ProxyOptions> = Object.fromEntries(
    proxyPrefixes.map((p) => [p, { ...defaultProxy }]),
  );

  return {
    base: "/",
    plugins: [react()],
    build: { target: "esnext" },
    server: { proxy },
  };
});
