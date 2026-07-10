import React from 'react';
import { FiMessageSquare, FiZap, FiShield, FiCode } from 'react-icons/fi';

export default function EmptyState() {
  const suggestions = [
    { icon: <FiCode className="text-xl" />, text: 'Write a Python script to sort a list' },
    { icon: <FiZap className="text-xl" />, text: 'Explain quantum computing simply' },
    { icon: <FiMessageSquare className="text-xl" />, text: 'Help me draft a professional email' },
    { icon: <FiShield className="text-xl" />, text: 'What are best practices for API security?' },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 animate-fade-in">
      {/* Hero */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-300/40">
        <FiZap className="text-3xl text-white" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
        <span className="gradient-text">Ollama Chat</span>
      </h1>
      <p className="text-[var(--color-text-muted)] text-lg mb-10 text-center max-w-md">
        Your local AI assistant. Ask anything — private, fast, and free.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="glass rounded-xl px-5 py-4 text-left flex items-start gap-3 hover:bg-[var(--color-bg-hover)] transition-all duration-200 group cursor-text"
            data-suggestion={s.text}
          >
            <span className="text-[var(--color-accent)] mt-0.5 group-hover:scale-110 transition-transform">
              {s.icon}
            </span>
            <span className="text-[var(--color-text-secondary)] text-sm leading-snug">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
