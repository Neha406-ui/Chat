import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiCopy, FiCheck } from 'react-icons/fi';

function CodeBlock({ className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  const lang = className?.replace('language-', '') || '';

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="code-block-wrapper">
      {lang && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-main)] rounded-t-xl text-xs text-[var(--color-text-muted)]">
          <span>{lang}</span>
        </div>
      )}
      <button onClick={handleCopy} className="copy-btn" title="Copy code">
        {copied ? <><FiCheck className="inline mr-1" />Copied</> : <><FiCopy className="inline mr-1" />Copy</>}
      </button>
      <code className={`${className || ''} block`} {...props}>
        {children}
      </code>
    </div>
  );
}

export default function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-body text-[var(--color-text-primary)] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, node, ...rest }) {
            const isBlock = node?.position
              ? String(children).includes('\n') || node?.tagName === 'code' && node?.parentNode?.tagName === 'pre'
              : false;
            // Inline vs block detection
            if (isBlock || className) {
              return <CodeBlock className={className} {...rest}>{children}</CodeBlock>;
            }
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="my-3">{children}</pre>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
