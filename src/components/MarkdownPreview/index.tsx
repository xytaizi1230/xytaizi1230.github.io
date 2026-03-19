import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"; // 代码高亮
import remarkFrontmatter from "remark-frontmatter"; // 支持frontmatter
import "github-markdown-css/github-markdown.css"; // MD 基础样式
import "highlight.js/styles/github-dark.css"; // 代码高亮样式（可选，可换其他风格）

// 通用 MD 解析组件
export default function MarkdownPreview({ mdContent }: { mdContent: string }) {
  return (
    // markdown-body 是 github-markdown-css 的核心类名
    <div
      className="markdown-body"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px 16px",
        boxSizing: "border-box",
      }}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, remarkFrontmatter]} // 启用代码高亮
        // 可选：自定义渲染规则（比如给链接加新窗口打开）
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0366d6" }}
            >
              {children}
            </a>
          ),
        }}
      >
        {mdContent}
      </ReactMarkdown>
    </div>
  );
}
