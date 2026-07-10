import React, { useState, useCallback, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import ChatInput from './components/ChatInput';
import Toast from './components/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sendChatStream, fetchModels, checkHealth } from './services/api';

export default function App() {
  // Persistent state
  const [messages, setMessages] = useLocalStorage('ollama_chat_messages', []);
  const [model, setModel] = useLocalStorage('ollama_chat_model', 'llama3.2');

  // Ephemeral state
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [toast, setToast] = useState(null);

  const isLoadingRef = useRef(false);

  // Show toast helper
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Check connection health
  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth();
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch available models
  const handleFetchModels = useCallback(async () => {
    try {
      const data = await fetchModels();
      setModels(data.models || []);
    } catch {
      // Silently fail — models list is optional
    }
  }, []);

  // Send message with streaming
  const handleSend = useCallback(async (content) => {
    if (isLoadingRef.current) return;

    const userMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);
    setIsLoading(true);
    isLoadingRef.current = true;

    // Use a ref-like variable for accumulation (avoids stale state in callback)
    let accumulated = '';
    const baseMessages = [...messages, userMessage];

    try {
      const apiMessages = baseMessages.map(({ role, content }) => ({ role, content }));

      await sendChatStream(
        apiMessages,
        model,
        (token) => {
          accumulated += token;
          // Update messages with the streaming content
          setMessages([...baseMessages, { role: 'assistant', content: accumulated, timestamp: Date.now() }]);
        }
      );

      if (!isConnected) setIsConnected(true);
    } catch (error) {
      const errMsg = error.message || 'Failed to get response from AI';
      showToast(errMsg, 'error');

      // Replace placeholder with error
      setMessages([...baseMessages, {
        role: 'assistant',
        content: `⚠️ **Error:** ${errMsg}`,
        timestamp: Date.now(),
        isError: true,
      }]);

      if (errMsg.includes('connect') || errMsg.includes('NetworkError')) {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [messages, model, isConnected, setMessages, showToast]);

  // Retry last user message
  const handleRetry = useCallback((userMsg) => {
    // Remove the last user message and resend
    const idx = messages.findIndex((m) => m === userMsg);
    if (idx >= 0) {
      const trimmed = messages.slice(0, idx);
      setMessages(trimmed);
      // Small delay to let state update
      setTimeout(() => handleSend(userMsg.content), 50);
    }
  }, [messages, handleSend, setMessages]);

  // Regenerate last AI response
  const handleRegenerate = useCallback(() => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Remove last AI message
    const withoutLastAI = messages.slice(0, -1);
    setMessages(withoutLastAI);
    setTimeout(() => handleSend(lastUserMsg.content), 50);
  }, [messages, handleSend, setMessages]);

  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([]);
    showToast('Conversation cleared', 'success');
  }, [setMessages, showToast]);

  // Export as TXT
  const handleExportTxt = useCallback(() => {
    const text = messages
      .map((m) => {
        const label = m.role === 'user' ? 'You' : 'AI Assistant';
        const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : '';
        return `[${time}] ${label}:\n${m.content}\n`;
      })
      .join('\n---\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ollama-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat downloaded as TXT', 'success');
  }, [messages, showToast]);

  // Export as JSON
  const handleExportJson = useCallback(() => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ollama-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat exported as JSON', 'success');
  }, [messages, showToast]);

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isConnected={isConnected}
        model={model}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onClearChat={handleClearChat}
          onExportTxt={handleExportTxt}
          onExportJson={handleExportJson}
          model={model}
          onModelChange={setModel}
          models={models}
          onFetchModels={handleFetchModels}
          messageCount={messages.length}
        />

        {/* Main chat area */}
        <main className="flex-1 flex flex-col min-w-0">
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            onRetry={handleRetry}
            onRegenerate={handleRegenerate}
          />
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
          />
        </main>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
