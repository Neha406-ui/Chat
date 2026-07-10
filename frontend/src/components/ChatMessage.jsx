import React, { useState, useCallback } from 'react';
import { FiCopy, FiCheck, FiRefreshCw, FiUser } from 'react-icons/fi';
import MarkdownRenderer from './MarkdownRenderer';

export default function ChatMessage({ message, onRetry, onRegenerate, isLast }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <div
      className={`flex gap-3 px-4 py-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
            : 'bg-gradient-to-br from-cyan-400 to-blue-500'
        }`}
      >
        {isUser ? <FiUser className="text-base" /> : 'AI'}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-md shadow-md shadow-indigo-200'
              : 'glass rounded-tl-md shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Actions row */}
        <div className={`flex items-center gap-2 mt-1.5 text-xs text-[var(--color-text-muted)]`}>
          {time && <span>{time}</span>}
          {!isUser && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-[var(--color-text-secondary)] transition-colors px-1.5 py-0.5 rounded hover:bg-[var(--color-bg-hover)]"
                title="Copy response"
              >
                {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 hover:text-[var(--color-text-secondary)] transition-colors px-1.5 py-0.5 rounded hover:bg-[var(--color-bg-hover)]"
                  title="Regenerate response"
                >
                  <FiRefreshCw /> Regenerate
                </button>
              )}
            </>
          )}
          {isUser && isLast && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 hover:text-[var(--color-text-secondary)] transition-colors px-1.5 py-0.5 rounded hover:bg-[var(--color-bg-hover)]"
              title="Retry message"
            >
              <FiRefreshCw /> Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
