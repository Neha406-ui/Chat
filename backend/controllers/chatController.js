const axios = require("axios");
const http = require("http");
const https = require("https");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "llama3.2";

/** Helper: validate messages from request body */
function validateMessages(messages) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return "Invalid request. 'messages' array is required and must not be empty.";
  }
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return "Each message must have 'role' and 'content' fields.";
    }
  }
  return null;
}

/**
 * Handle chat request - forwards messages to Ollama API (non-streaming)
 */
const chat = async (req, res) => {
  try {
    const { messages, model } = req.body;
    const validationError = validateMessages(messages);
    if (validationError) return res.status(400).json({ error: validationError });

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      { model: model || DEFAULT_MODEL, messages, stream: false },
      { timeout: 120000, headers: { "Content-Type": "application/json" } }
    );

    const aiMessage = response.data?.message;
    if (!aiMessage) {
      return res.status(502).json({ error: "Invalid response from Ollama. No message field found." });
    }

    return res.json({
      role: aiMessage.role || "assistant",
      content: aiMessage.content,
      model: response.data?.model || model || DEFAULT_MODEL,
    });
  } catch (error) {
    console.error("Chat controller error:", error.message);
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "Cannot connect to Ollama. Make sure Ollama is running on localhost:11434." });
    }
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({ error: "Request to Ollama timed out." });
    }
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data?.error || "Ollama returned an error." });
    }
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
};

/**
 * Streaming chat endpoint — forwards tokens via Server-Sent Events (SSE)
 * Each SSE event: data: {"token":"word"}\n\n
 * Final event:      data: {"done":true}\n\n
 */
const chatStream = (req, res) => {
  try {
    const { messages, model } = req.body;
    const validationError = validateMessages(messages);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Set up SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    // Guard flag: once the response is done, suppress any late errors
    let streamEnded = false;
    const finish = () => {
      if (streamEnded) return;
      streamEnded = true;
      res.end();
    };

    const payload = JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      stream: true,
    });

    const url = new URL(`${OLLAMA_BASE_URL}/api/chat`);
    const transport = url.protocol === "https:" ? https : http;

    const ollamaReq = transport.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (ollamaRes) => {
        if (ollamaRes.statusCode !== 200) {
          let errBody = "";
          ollamaRes.on("data", (chunk) => (errBody += chunk));
          ollamaRes.on("end", () => {
            res.write(`data: ${JSON.stringify({ error: errBody || "Ollama error" })}\n\n`);
            finish();
          });
          return;
        }

        let buffer = "";
        ollamaRes.on("data", (chunk) => {
          buffer += chunk.toString();
          // Ollama sends newline-delimited JSON objects
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const parsed = JSON.parse(trimmed);
              const token = parsed.message?.content;
              if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
              }
              if (parsed.done) {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              }
            } catch {
              // skip malformed lines
            }
          }
        });

        ollamaRes.on("end", () => {
          // flush any remaining buffer
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim());
              const token = parsed.message?.content;
              if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
            } catch {}
          }
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          finish();
        });

        ollamaRes.on("error", (err) => {
          if (streamEnded) return;
          console.error("Ollama stream error:", err.message);
          res.write(`data: ${JSON.stringify({ error: "Stream error: " + err.message })}\n\n`);
          finish();
        });
      }
    );

    ollamaReq.on("error", (err) => {
      if (streamEnded) return; // normal post-completion cleanup — ignore
      console.error("Ollama request error:", err.message);
      if (!res.headersSent) {
        res.status(503).json({ error: "Cannot connect to Ollama." });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Connection failed" })}\n\n`);
      }
      finish();
    });

    // Handle client disconnect — use res.on('close') instead of req.on('close')
    // because in Node.js ≥18, req.on('close') fires as soon as the request
    // body is consumed (by express.json), NOT when the client disconnects.
    res.on("close", () => {
      if (!streamEnded && !ollamaReq.destroyed) {
        ollamaReq.destroy();
      }
    });

    ollamaReq.write(payload);
    ollamaReq.end();
  } catch (error) {
    console.error("chatStream error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error." });
    } else {
      res.end();
    }
  }
};

/**
 * Get available models from Ollama
 */
const getModels = async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 10000,
    });

    const models = (response.data?.models || []).map((m) => ({
      name: m.name,
      size: m.size,
      modified: m.modified_at,
    }));

    return res.json({ models });
  } catch (error) {
    console.error("Get models error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Cannot connect to Ollama. Make sure Ollama is running.",
      });
    }

    return res.status(500).json({
      error: "Failed to fetch models from Ollama.",
    });
  }
};

module.exports = { chat, chatStream, getModels };
