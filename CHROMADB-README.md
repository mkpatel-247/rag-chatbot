# Vector Database RAG System with Admin Panel

A complete RAG (Retrieval Augmented Generation) system using **ChromaDB** as a persistent vector database, **Ollama** for LLM, **LangChain** for orchestration, and an **Express.js** admin panel to manage your knowledge base.

## 🎯 What's Different?

Instead of using in-memory vector storage, this setup uses **ChromaDB** - a real vector database that:
- ✅ **Persists data** between restarts
- ✅ **Centralized storage** accessible from multiple applications
- ✅ **External management** via web UI and API
- ✅ **Production-ready** for small to medium scale
- ✅ **Docker-based** for easy deployment

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                        │
│  (Admin Panel + API Server on http://localhost:3000)       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├──────────────┐
                   │              │
                   ▼              ▼
         ┌──────────────┐  ┌──────────────┐
         │   Ollama     │  │   ChromaDB   │
         │ (Port 11434) │  │ (Port 8000)  │
         │              │  │              │
         │ • LLM Model  │  │ • Vectors    │
         │ • Embeddings │  │ • Metadata   │
         └──────────────┘  └──────────────┘
              Docker            Docker
```

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js (v18+)
- 8GB RAM minimum (16GB recommended)

## 🚀 Setup Instructions

### Step 1: Start Services

```bash
# Copy the ChromaDB docker-compose file
cp docker-compose-chroma.yml docker-compose.yml

# Start Ollama and ChromaDB
docker-compose up -d

# Verify services are running
docker ps
```

You should see two containers: `ollama` and `chromadb`

### Step 2: Pull Models

```bash
# Pull LLM model (choose one)
docker exec -it ollama ollama pull llama3.2      # 2GB - Fast
docker exec -it ollama ollama pull mistral       # 4GB - Better quality

# Pull embedding model (REQUIRED!)
docker exec -it ollama ollama pull nomic-embed-text
```

### Step 3: Install Dependencies

```bash
# Copy the package file
cp package-chromadb.json package.json

# Install
npm install
```

### Step 4: Test the System

```bash
# Run test script to verify everything works
npm run test-rag
```

This will:
- Connect to ChromaDB
- Add sample documents
- Test queries
- Show results

### Step 5: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## 🎨 Admin Panel Features

Open `http://localhost:3000` in your browser to access the admin panel.

### 1. **Add Documents** Tab
- 📄 **Upload PDFs**: Drag and drop or select PDF files
- 📝 **Add Text**: Manually enter text content
- 🌐 **Scrape Websites**: Extract content from URLs

### 2. **Query (RAG)** Tab
- Ask questions about your documents
- AI retrieves relevant context and generates answers
- See which sources were used

### 3. **Browse Documents** Tab
- View all documents in the database
- See metadata and content preview
- Check document statistics

### 4. **Similarity Search** Tab
- Find documents similar to your query
- Semantic search (not keyword matching)
- Ranked by relevance

## 🔌 API Endpoints

All endpoints are available at `http://localhost:3000/api`

### Health & Stats
```bash
GET /api/health          # Check system health
GET /api/stats           # Get document count
```

### Document Management
```bash
POST /api/documents/text # Add text document
POST /api/documents/pdf  # Upload PDF
POST /api/documents/web  # Scrape website
GET  /api/documents      # List documents
DELETE /api/documents    # Delete documents by IDs
DELETE /api/documents/all # Clear all documents
```

### Query & Search
```bash
POST /api/query          # RAG query
POST /api/search         # Similarity search
```

## 📝 API Usage Examples

### Add Text Document
```bash
curl -X POST http://localhost:3000/api/documents/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your text here",
    "metadata": {"title": "My Document"}
  }'
```

### Upload PDF
```bash
curl -X POST http://localhost:3000/api/documents/pdf \
  -F "file=@/path/to/document.pdf"
```

### Scrape Website
```bash
curl -X POST http://localhost:3000/api/documents/web \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Query (RAG)
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is machine learning?",
    "k": 3
  }'
```

### Similarity Search
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "artificial intelligence",
    "k": 5
  }'
```

## 💾 Data Persistence

ChromaDB data is persisted in a Docker volume:

```bash
# View volumes
docker volume ls

# Backup data
docker run --rm -v chromadb-data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/chromadb-backup.tar.gz /data

# Restore data
docker run --rm -v chromadb-data:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/chromadb-backup.tar.gz -C /
```

## 🔧 Configuration

### Change Models (db-manager.js)
```javascript
this.llm = new Ollama({
  model: "mistral",  // Change LLM model
});

this.embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",  // Embedding model
});
```

### Adjust Chunk Size
```javascript
this.textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,    // Increase for more context
  chunkOverlap: 200,  // Overlap between chunks
});
```

### Change Collection Name
```javascript
this.collectionName = "my_knowledge_base";
```

## 🎯 Use Cases

### 1. Company Knowledge Base
- Upload company policies, handbooks, documentation
- Employees can query using natural language
- Always up-to-date, centralized information

### 2. Research Assistant
- Add research papers, articles, notes
- Query across all documents
- Find similar research

### 3. Customer Support
- Add product manuals, FAQs, support tickets
- AI-powered search and answers
- Consistent responses

### 4. Personal Knowledge Management
- Store articles, books, notes
- Semantic search across all content
- Connect related ideas

## 🔍 How It Works

### 1. **Adding Documents**
```
Document → Text Splitter → Chunks → Embeddings → ChromaDB
```

### 2. **Querying (RAG)**
```
Question → Embedding → Similar Docs Search → Context + Question → LLM → Answer
```

### 3. **Similarity Search**
```
Query → Embedding → Vector Similarity → Ranked Results
```

## 🐛 Troubleshooting

### ChromaDB not accessible
```bash
# Check if container is running
docker ps

# Check logs
docker logs chromadb

# Restart
docker-compose restart chromadb
```

### Connection refused
```bash
# Make sure services are running
docker-compose ps

# Check ports
netstat -an | grep 8000   # ChromaDB
netstat -an | grep 11434  # Ollama
netstat -an | grep 3000   # API Server
```

### Slow embedding generation
- First time is always slower
- Consider using GPU for Ollama
- Reduce chunk size for faster processing

### "Model not found"
```bash
# List available models
docker exec -it ollama ollama list

# Pull missing models
docker exec -it ollama ollama pull llama3.2
docker exec -it ollama ollama pull nomic-embed-text
```

## 📊 Performance Tips

1. **Chunk Size**: Smaller = faster, less context; Larger = slower, more context
2. **Retrieval (k)**: Higher k = more context but slower
3. **Models**: Smaller models (llama3.2) are faster than larger ones (mistral)
4. **GPU**: Enable GPU in docker-compose.yml for 10x speed improvement

## 🔐 Production Considerations

For production use, consider:

1. **Authentication**: Add API key authentication
2. **Rate Limiting**: Prevent abuse
3. **HTTPS**: Use SSL certificates
4. **Monitoring**: Add logging and metrics
5. **Backup**: Regular database backups
6. **Scaling**: Use managed ChromaDB or Pinecone for larger scale

## 📚 Project Structure

```
project/
├── docker-compose.yml       # Docker services
├── package.json            # Dependencies
├── server.js               # Express API server
├── db-manager.js           # ChromaDB manager
├── test-rag-system.js      # Test script
├── public/
│   └── index.html         # Admin panel UI
└── uploads/               # Temporary PDF uploads
```

## 🎓 Learning Resources

- [ChromaDB Docs](https://docs.trychroma.com/)
- [LangChain Docs](https://js.langchain.com/)
- [Ollama Models](https://ollama.com/library)
- [RAG Guide](https://www.pinecone.io/learn/retrieval-augmented-generation/)

## 🤝 Integration Examples

### From Another Node.js App
```javascript
import dbManager from './db-manager.js';

await dbManager.initialize();
const result = await dbManager.query("Your question");
console.log(result.answer);
```

### Via REST API
```javascript
const response = await fetch('http://localhost:3000/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'Your question' })
});

const data = await response.json();
console.log(data.answer);
```

## 🌟 Next Steps

1. ✅ Add your documents via the admin panel
2. ✅ Test queries to verify accuracy
3. ✅ Adjust chunk size and retrieval parameters
4. ✅ Integrate with your application using the API
5. ✅ Consider scaling options for production

---

**Happy building! 🚀**

For questions or issues, check the troubleshooting section or review the logs:
```bash
docker logs chromadb
docker logs ollama
```
