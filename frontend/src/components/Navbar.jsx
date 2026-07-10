import React from 'react';
import { FiMenu, FiZap, FiWifi, FiWifiOff } from 'react-icons/fi';

export default function Navbar({ onToggleSidebar, isConnected, model }) {
  return (
    <header className="glass h-14 flex items-center justify-between px-4 shrink-0 z-30 relative">
      {/* Left: sidebar toggle + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors text-[var(--color-text-secondary)]"
          title="Toggle sidebar"
        >
          <FiMenu className="text-xl" />
        </button>
        <div className="flex items-center gap-2">
          <FiZap className="text-[var(--color-accent)] text-xl" />
          <span className="font-semibold text-lg gradient-text hidden sm:inline">Ollama Chat</span>
        </div>
      </div>

      {/* Center: model badge */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 text-xs text-[var(--color-text-secondary)] bg-white border border-[var(--color-border-main)] rounded-full px-4 py-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {model}
      </div>

      {/* Right: connection status */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${
          isConnected
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-500'
        }`}>
          {isConnected ? <FiWifi className="text-sm" /> : <FiWifiOff className="text-sm" />}
          <span className="hidden sm:inline">{isConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
}
