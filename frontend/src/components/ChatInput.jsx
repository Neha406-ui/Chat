import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip } from 'react-icons/fi';

export default function ChatInput({ onSend, disabled, onSuggestionClick }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const MAX_CHARS = 4000;

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Listen for suggestion clicks from EmptyState
  useEffect(() => {
    const handler = (e) => {
      const btn = e.target.closest('[data-suggestion]');
      if (btn) {
        const suggestion = btn.getAttribute('data-suggestion');
        if (suggestion) {
          setText(suggestion);
          textareaRef.current?.focus();
        }
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="border-t border-[var(--color-border-main)] bg-[var(--color-bg-secondary)]/50 backdrop-blur-md px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={1}
            className="w-full resize-none rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border-main)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-glow)] outline-none px-5 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] text-[15px] transition-all duration-200 disabled:opacity-50"
          />
          {charCount > 0 && (
            <span className={`absolute right-3 bottom-2 text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-[var(--color-text-muted)]'}`}>
              {charCount}/{MAX_CHARS}
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim() || isOverLimit}
          className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-indigo-400/40 active:scale-95 shrink-0"
          title="Send message"
        >
          <FiSend className="text-lg" />
        </button>
      </div>
    </div>
  );
}
