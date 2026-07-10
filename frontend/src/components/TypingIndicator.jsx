import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
        AI
      </div>
      <div className="glass rounded-2xl rounded-tl-md px-5 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
        <span className="text-[var(--color-text-muted)] text-sm ml-1">AI is thinking...</span>
      </div>
    </div>
  );
}
