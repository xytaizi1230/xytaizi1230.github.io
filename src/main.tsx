import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import matter from "front-matter";
import Layout from "./components/Layout";
import Home from "./pages/home";
import Markdown from "./pages/markdown";
import MarkdownPreview from "./pages/markdown/preview";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import TestPage from "./pages/test";

// 用 Vite 的 import.meta.glob 预收集所有 MD 文件（静态分析，构建时确定）
const mdFiles = import.meta.glob("./assets/markdown/*.md", {
  query: "?raw",
  eager: false,
  import: "default",
});

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary,
    children: [
      {
        index: true,
        Component: Home,
        loader: () => {
          document.title = "妙妙屋";
          return null;
        },
      },
      {
        path: "markdown",
        children: [
          {
            index: true,
            Component: Markdown,
            loader: async () => {
              const res = await fetch("/markdown-meta.json");
              const postsMeta = await res.json();
              return { postsMeta: postsMeta.reverse() };
            },
          },
          {
            path: ":postId",
            Component: MarkdownPreview,
            loader: async ({ params }) => {
              const { postId } = params;
              // 1. 拼接 MD 文件路径
              const mdPath = `./assets/markdown/${postId}.md`;
              // 2. 检查文件是否存在
              if (!mdFiles[mdPath]) {
                throw new Error(`找不到文章：${postId}.md`);
              }
              // 3. 动态导入 MD 文件内容（字符串）
              const mdContent = (await mdFiles[mdPath]()) as string;

              // 4. 解析md的元数据
              const parsed = matter<{ [key in string]: string }>(mdContent);
              document.title = parsed.attributes.title;

              // 6. 返回 MD 完整内容和元信息
              return { mdContent, desc: parsed.attributes.desc };
            },
          },
        ],
      },
      {
        path: "/test",
        Component: TestPage,
      }
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
