const express = require("express");
const router = express.Router();
const { chat, chatStream, getModels } = require("../controllers/chatController");

// POST /chat - Non-streaming chat (fallback)
router.post("/", chat);

// POST /chat/stream - Streaming chat via SSE
router.post("/stream", chatStream);

// GET /chat/models - Get available Ollama models
router.get("/models", getModels);

module.exports = router;
