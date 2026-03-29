# ChromaDB RAG - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Start Services (2 min)
```bash
# Use the ChromaDB compose file
cp docker-compose-chroma.yml docker-compose.yml

# Start containers
docker-compose up -d

# Wait for services to be ready (~30 seconds)
```

### Step 2: Pull Models (2 min)
```bash
# Pull models (runs in background)
docker exec -it ollama ollama pull llama3.2 &
docker exec -it ollama ollama pull nomic-embed-text &

# Wait for both to complete
wait
```

### Step 3: Install & Run (1 min)
```bash
# Setup
cp package-chromadb.json package.json
npm install

# Test the system
npm run test-rag

# Start the server
npm start
```

### Step 4: Open Admin Panel
Open your browser: **http://localhost:3000**

## 🎯 What Can You Do Now?

### Quick Actions:

1. **Add a Text Note**
   - Go to "Add Documents" tab
   - Type text in the "Add Text" box
   - Click "Add Text"

2. **Upload a PDF**
   - Go to "Add Documents" tab
   - Click "Choose File" under "Upload PDF"
   - Select a PDF and click "Upload PDF"

3. **Ask a Question**
   - Go to "Query (RAG)" tab
   - Type your question
   - Click "Ask Question"

4. **Browse What's Stored**
   - Go to "Browse Documents" tab
   - See all your documents

## 📝 Example Questions to Try

After adding documents, try these queries:

```
"What is the main topic of these documents?"
"Summarize the key points"
"What does the document say about [topic]?"
"Compare the different perspectives on [topic]"
```

## 🔧 Quick API Test

### Add a document:
```bash
curl -X POST http://localhost:3000/api/documents/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Artificial intelligence is transforming technology."}'
```

### Query it:
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is AI doing?"}'
```

## 🎨 Admin Panel Overview

```
┌─────────────────────────────────────────────┐
│  🗄️ Vector Database Admin                   │
├─────────────────────────────────────────────┤
│                                             │
│  ➕ Add Documents  │  🔍 Query  │  📚 Browse │
│                                             │
│  Upload PDFs, add text, scrape websites     │
│  Ask questions and get AI-powered answers   │
│  View and manage your knowledge base        │
│                                             │
└─────────────────────────────────────────────┘
```

## 💡 Pro Tips

1. **Start small**: Add 2-3 documents first to test
2. **Be specific**: Better questions get better answers
3. **Check sources**: The "Query" tab shows which docs were used
4. **Monitor stats**: Top-right shows document count

## 🐛 Something Wrong?

### Services not running?
```bash
docker-compose ps  # Check status
docker-compose logs  # Check logs
```

### Can't access admin panel?
- Make sure server is running: `npm start`
- Check http://localhost:3000
- Look for errors in terminal

### Models not working?
```bash
# List installed models
docker exec -it ollama ollama list

# Should show llama3.2 and nomic-embed-text
```

## 📊 What's Happening Behind the Scenes?

```
Your Document
    ↓
Split into chunks
    ↓
Convert to embeddings (vectors)
    ↓
Store in ChromaDB
    ↓
When you query:
    ↓
Your question → embedding → find similar vectors
    ↓
Retrieve relevant chunks → send to LLM → get answer
```

## 🎯 Next Steps

- ✅ Add more documents
- ✅ Try different question types
- ✅ Experiment with similarity search
- ✅ Check the full README for advanced features
- ✅ Integrate the API into your own app

## 📱 Access Points

- **Admin Panel**: http://localhost:3000
- **API Base URL**: http://localhost:3000/api
- **ChromaDB**: http://localhost:8000
- **Ollama**: http://localhost:11434

---

**That's it! You're ready to build AI-powered applications with your own knowledge base! 🎉**
