import { useState } from "react";

/**
 * CodeBlock - renders code with syntax highlighting-like styling.
 * Uses simple CSS-based styling (no heavy dependencies).
 * Props:
 *   - code: the code string
 *   - lang: language identifier (for display)
 */
const CodeBlock = ({ code, lang = "text" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative rounded-md overflow-hidden my-1 max-w-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-base-300 px-3 py-1 text-xs">
        <span className="opacity-60 font-mono">{lang}</span>
        <button
          onClick={handleCopy}
          className="btn btn-ghost btn-xs"
          aria-label="Copy code"
          type="button"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      {/* Code content */}
      <pre className="bg-neutral text-neutral-content p-3 overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
