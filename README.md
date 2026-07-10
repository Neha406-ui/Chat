# Ollama Chat Application

## Features

- Chat with a local Ollama model
- Message history
- Loading indicator
- Clear chat
- Markdown rendering
- Responsive UI

## Requirements

- Node.js 20+
- npm
- Ollama

## Install Ollama

Download and install Ollama from:

https://ollama.com

Pull the model:

```bash
ollama pull llama3.2
```

Start Ollama:

```bash
ollama serve
```

## Backend Setup

```bash
cd backend
npm install
npm start
```

Runs on:

```
http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:5173
```

## Using the Application

1. Make sure Ollama is running.
2. Open the frontend.
3. Type a message.
4. Receive a response from the local model.
5. Use "Clear Chat" to start a new conversation.
