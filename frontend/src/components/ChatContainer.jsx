import React, { useRef, useEffect, useState } from 'react';
import { FiArrowDown } from 'react-icons/fi';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';

export default function ChatContainer({
  messages,
  isLoading,
  onRetry,
  onRegenerate,
}) {
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = (behavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Auto scroll when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Detect if user scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto py-4"
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-1">
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isLast={i === messages.length - 1}
              onRetry={i === messages.length - 1 && msg.role === 'user' ? () => onRetry(msg) : null}
              onRegenerate={i === messages.length - 1 && msg.role === 'assistant' && msg.content ? onRegenerate : null}
            />
          ))}
          {isLoading && (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.content) && <TypingIndicator />}
        </div>
        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-all duration-200 animate-fade-in shadow-lg"
          title="Scroll to bottom"
        >
          <FiArrowDown />
        </button>
      )}
    </div>
  );
}
