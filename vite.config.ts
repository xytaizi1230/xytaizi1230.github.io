import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import crypto from "crypto";
import collectMarkdownMeta from "./plugins/collectMarkdownMeta";

// 生成加密安全的 nonce
const cspNonce = crypto.randomBytes(16).toString("base64");

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  css: {
    modules: {
      scopeBehaviour: "local",
      // 强制css module中的类名在使用时用驼峰
      localsConvention: "camelCaseOnly",
    },
  },
  html: {
    cspNonce,
  },
  plugins: [react(), collectMarkdownMeta()],
  // 告诉 Vite 将 MD 文件视为静态资产（确保导入正常）
  assetsInclude: ["src/assets/markdown/**/*.md"],
});
