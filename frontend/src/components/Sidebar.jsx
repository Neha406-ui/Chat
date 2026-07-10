import React, { useEffect, useState } from 'react';
import {
  FiPlus, FiTrash2, FiDownload, FiFileText,
  FiChevronDown, FiX, FiMessageSquare, FiSettings
} from 'react-icons/fi';

export default function Sidebar({
  isOpen,
  onClose,
  onClearChat,
  onExportTxt,
  onExportJson,
  model,
  onModelChange,
  models,
  onFetchModels,
  messageCount,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  useEffect(() => {
    onFetchModels();
  }, []);

  const handleClear = () => {
    if (showClearConfirm) {
      onClearChat();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 md:hidden animate-fade-in backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full w-72 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-main)] z-50 flex flex-col sidebar-enter transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border-main)] shrink-0">
          <span className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <FiSettings className="text-[var(--color-accent)]" /> Settings
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors text-[var(--color-text-muted)]"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Model selector */}
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">
              Model
            </label>
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full flex items-center justify-between bg-[var(--color-bg-input)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-colors"
              >
                <span className="truncate">{model}</span>
                <FiChevronDown className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showModelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-xl overflow-hidden z-10 shadow-xl animate-fade-in">
                  {models.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">No models found</div>
                  ) : (
                    models.map((m) => (
                      <button
                        key={m.name}
                        onClick={() => { onModelChange(m.name); setShowModelDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-bg-hover)] transition-colors ${
                          model === m.name ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))
                  )}
                  <button
                    onClick={() => { onFetchModels(); }}
                    className="w-full text-left px-4 py-2 text-xs text-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] border-t border-[var(--color-border-main)]"
                  >
                    Refresh models
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat info */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiMessageSquare className="text-[var(--color-accent)]" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Current Chat</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {messageCount} message{messageCount !== 1 ? 's' : ''} in conversation
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
              Actions
            </label>

            <button
              onClick={handleClear}
              className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                showClearConfirm
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border border-transparent'
              }`}
            >
              <FiTrash2 />
              {showClearConfirm ? 'Click again to confirm' : 'Clear conversation'}
            </button>

            <button
              onClick={onExportTxt}
              disabled={messageCount === 0}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-transparent"
            >
              <FiFileText /> Download as TXT
            </button>

            <button
              onClick={onExportJson}
              disabled={messageCount === 0}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border border-transparent"
            >
              <FiDownload /> Export as JSON
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border-main)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Powered by Ollama &middot; Local AI
          </p>
        </div>
      </aside>
    </>
  );
}
