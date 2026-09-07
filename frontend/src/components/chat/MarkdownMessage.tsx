import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaCopy, FaCheck } from "react-icons/fa";
import { useState } from "react";

interface Props { text: string; }

export default function MarkdownMessage({ text }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");
          if (match) return <CodeBlock language={match[1]} code={code} />;
          return <code className="bg-slate-700 px-1 rounded" {...props}>{children}</code>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden my-4 border border-slate-700">
      <div className="bg-slate-900 flex justify-between items-center px-4 py-2 text-sm">
        <span>{language}</span>
        <CopyToClipboard text={code} onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
          <button type="button" className="flex items-center gap-2 hover:text-cyan-400" aria-label="Copy code">
            {copied ? <FaCheck /> : <FaCopy />}{copied ? "Copied" : "Copy"}
          </button>
        </CopyToClipboard>
      </div>
      <SyntaxHighlighter language={language} style={oneDark} PreTag="div">{code}</SyntaxHighlighter>
    </div>
  );
}
