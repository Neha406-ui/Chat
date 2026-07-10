import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Send chat messages and get AI response (non-streaming fallback)
 */
export const sendChatMessage = async (messages, model = 'llama3.2') => {
  const response = await api.post('/chat', { messages, model });
  return response.data;
};

/**
 * Streaming chat — reads SSE tokens from backend and calls onToken() for each one.
 * Returns a promise that resolves when the stream is done.
 *
 * @param {Array} messages
 * @param {string} model
 * @param {(token: string) => void} onToken — called for each streamed token
 * @param {AbortSignal} signal — for cancellation
 * @returns {Promise<void>}
 */
export const sendChatStream = async (messages, model = 'llama3.2', onToken, signal) => {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events: each line "data: {...}\n\n"
    const events = buffer.split('\n\n');
    buffer = events.pop(); // keep incomplete chunk

    for (const event of events) {
      const dataLine = event.replace(/^data: /, '').trim();
      if (!dataLine) continue;
      try {
        const parsed = JSON.parse(dataLine);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.token) onToken(parsed.token);
        if (parsed.done) return;
      } catch (e) {
        // Re-throw real errors, skip parse failures
        if (e.message && !e.message.includes('JSON')) throw e;
      }
    }
  }
};

/**
 * Fetch available Ollama models
 */
export const fetchModels = async () => {
  const response = await api.get('/chat/models');
  return response.data;
};

/**
 * Check backend health
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
