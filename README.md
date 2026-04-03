# 🤖 RAG Chatbot with Ollama & ChromaDB

A production-ready **Retrieval Augmented Generation (RAG)** chatbot system that runs **100% locally** using Ollama, ChromaDB, and LangChain. Upload your documents, ask questions, and get AI-powered answers grounded in your own data!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![Docker](https://img.shields.io/badge/docker-required-blue.svg)

## 🎯 What is This?

This is a complete RAG (Retrieval Augmented Generation) system that allows you to:
- 📄 **Upload PDFs, text files, or scrape websites**
- 🧠 **Ask questions in natural language**
- 💡 **Get AI-generated answers based on YOUR documents**
- 🔒 **Run everything locally** - no data leaves your machine
- 🎨 **Manage everything via a beautiful web interface**

### What is RAG?

RAG combines two powerful capabilities:
1. **Retrieval**: Finding relevant information from your documents
2. **Generation**: Using AI to generate accurate answers based on that information

```
Your Question → Find Relevant Docs → Generate Answer → Get Result!
```

**Why RAG?**
- ✅ Eliminates AI hallucinations by grounding answers in real data
- ✅ Keep your data private (runs locally)
- ✅ Always up-to-date with your latest documents
- ✅ Cite sources for every answer

---

## 🌟 Features

### 📊 Web Admin Panel
- Upload PDFs with drag & drop
- Add text documents manually
- Scrape content from websites
- Browse all stored documents
- Real-time statistics dashboard

### 🔍 Smart Search
- Semantic search (understands meaning, not just keywords)
- Similarity scoring
- Source citations
- Filter by metadata

### 💬 RAG Query System
- Ask questions in natural language
- Get AI-generated answers
- See which documents were used
- Adjustable retrieval settings

### 🛠️ Developer Tools
- REST API for integration
- Command-line interface
- Interactive data explorer
- Export/import capabilities

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Admin Panel                       │
│              (http://localhost:3000)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
  ┌────────────┐      ┌────────────┐
  │   Ollama   │      │  ChromaDB  │
  │ (LLM +     │      │  (Vector   │
  │ Embeddings)│      │  Database) │
  └────────────┘      └────────────┘
   Port: 11434         Port: 8000
```

### Technology Stack

- **🦙 Ollama**: Local LLM (runs Llama, Mistral, etc.)
- **🗄️ ChromaDB**: Vector database for persistent storage
- **🦜 LangChain**: Framework for RAG orchestration
- **⚡ Express.js**: REST API server
- **🎨 Tailwind CSS**: Beautiful UI
- **🐳 Docker**: Container orchestration

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Docker & Docker Compose** installed
- ✅ **Node.js 18+** installed
- ✅ **8GB RAM minimum** (16GB recommended)
- ✅ **10GB free disk space** (for models)

### Check Your Setup

```bash
# Check Docker
docker --version
docker-compose --version

# Check Node.js
node --version  # Should be >= 18

# Check available RAM
free -h  # Linux
# or check System Preferences on Mac
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/mkpatel-247/rag-chatbot.git
cd rag-chatbot
```

### Step 2: Start Docker Services

```bash
# Start Ollama and ChromaDB
docker-compose up -d

# Verify services are running
docker ps
# You should see 'ollama' and 'chromadb' containers
```

### Step 3: Pull AI Models

```bash
# Pull the main LLM (choose one)
docker exec -it ollama ollama pull llama3.2    # 2GB - Recommended
# OR
docker exec -it ollama ollama pull mistral     # 4GB - Better quality

# Pull the embedding model (REQUIRED!)
docker exec -it ollama ollama pull nomic-embed-text
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Add Sample Data (Optional)

```bash
npm run populate
```

This adds sample documents so you can test immediately.

### Step 6: Start the Server

```bash
npm start
```

### Step 7: Open Your Browser

Navigate to: **http://localhost:3000**

🎉 **You're ready!** Upload documents and start asking questions!

---

## 📖 Usage Guide

### 1️⃣ Adding Documents

#### Option A: Upload PDF
1. Go to "Add Documents" tab
2. Click "Choose File" under "Upload PDF"
3. Select your PDF
4. Click "Upload PDF"
5. Wait for processing (shows progress)

#### Option B: Add Text
1. Go to "Add Documents" tab
2. Enter a title (optional)
3. Paste or type your text
4. Click "Add Text"

#### Option C: Scrape Website
1. Go to "Add Documents" tab
2. Enter website URL
3. Click "Scrape & Add"
4. Content is automatically extracted

### 2️⃣ Asking Questions (RAG)

1. Go to "Query (RAG)" tab
2. Type your question
3. Select how many documents to retrieve (3-10)
4. Click "Ask Question"
5. See the answer + sources used

**Example Questions:**
- "What are the main topics in these documents?"
- "Summarize the key findings"
- "What does the document say about [topic]?"
- "Compare the different perspectives on [topic]"

### 3️⃣ Browsing Documents

1. Go to "Browse Documents" tab
2. See all your documents with:
   - Title/Source
   - Content preview
   - Type (PDF, text, web)
   - Metadata
3. Click "Refresh" to update

### 4️⃣ Similarity Search

1. Go to "Similarity Search" tab
2. Enter a search query
3. Select number of results (3-10)
4. Click "Search"
5. See most similar documents ranked by relevance

---

## 🛠️ Developer Guide

### Available NPM Scripts

```bash
npm start          # Start the web server
npm run populate   # Add sample data
npm run test-rag   # Test RAG system
npm run view       # View database contents
npm run explore    # Interactive CLI explorer
npm run test-search # Test search functionality
npm run diagnose   # Run full diagnostics
```

### REST API Endpoints

Base URL: `http://localhost:3000/api`

#### Health & Stats
```bash
GET  /api/health        # System health check
GET  /api/stats         # Document count
```

#### Document Management
```bash
POST /api/documents/text    # Add text document
POST /api/documents/pdf     # Upload PDF
POST /api/documents/web     # Scrape website
GET  /api/documents         # List documents
DELETE /api/documents       # Delete by IDs
DELETE /api/documents/all   # Clear all
```

#### Query & Search
```bash
POST /api/query     # RAG query
POST /api/search    # Similarity search
```

### API Examples

#### Add Text Document
```bash
curl -X POST http://localhost:3000/api/documents/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your document content here",
    "metadata": {"title": "My Document", "category": "Tech"}
  }'
```

#### Query with RAG
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is machine learning?",
    "k": 3
  }'
```

#### Upload PDF
```bash
curl -X POST http://localhost:3000/api/documents/pdf \
  -F "file=@/path/to/document.pdf"
```

### Using in Your Code

```javascript
import dbManager from './db-manager.js';

// Initialize
await dbManager.initialize();

// Add document
await dbManager.addDocument("Your content", {
  title: "My Doc",
  source: "my-app"
});

// Query
const result = await dbManager.query("Your question", 3);
console.log(result.answer);
console.log(result.sources);

// Search
const similar = await dbManager.searchSimilar("search query", 5);
```

---

## 📁 Project Structure

```
rag-chatbot/
├── server.js                  # Express API server
├── db-manager.js              # ChromaDB manager class
├── docker-compose.yml         # Docker services config
├── package.json               # Dependencies
│
├── public/
│   └── index.html            # Web admin panel UI
│
├── test-rag-system.js        # RAG system tests
├── populate-db.js            # Sample data loader
├── view-chromadb.js          # Database viewer
├── chromadb-explorer.js      # Interactive CLI
├── test-search.js            # Search tester
├── diagnose-search.js        # Diagnostics tool
│
└── uploads/                  # Temporary PDF uploads
```

---

## 🎓 How It Works

### The RAG Pipeline

1. **Document Upload**
   ```
   PDF/Text → Extract Content → Split into Chunks → Generate Embeddings → Store in ChromaDB
   ```

2. **Query Processing**
   ```
   User Question → Generate Embedding → Search Similar Vectors → Retrieve Documents → Send to LLM with Context → Generate Answer
   ```

### Key Concepts

#### 📊 Embeddings
- Mathematical representations of text (vectors)
- Similar texts have similar embeddings
- Model: `nomic-embed-text` (768 dimensions)
- Enables semantic search

#### 🗄️ Vector Database (ChromaDB)
- Stores embeddings efficiently
- Fast similarity search
- Persistent storage
- Metadata filtering

#### 🧩 Text Chunking
- Splits documents into smaller pieces
- Default: 1000 characters per chunk
- 200 character overlap for context
- Better retrieval accuracy

#### 🔍 Retrieval (k parameter)
- How many chunks to retrieve
- Default: k=3
- Higher k = more context but slower
- Adjust based on your needs

---

## ⚙️ Configuration

### Change LLM Model

Edit `db-manager.js`:
```javascript
this.llm = new Ollama({
  model: "mistral",  // Change this
  temperature: 0.2,
});
```

### Adjust Chunk Size

Edit `db-manager.js`:
```javascript
this.textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1500,      // Increase for more context
  chunkOverlap: 300,    // Increase overlap
});
```

### Change Collection Name

Edit `db-manager.js`:
```javascript
this.collectionName = "my_knowledge_base";
```

### Enable GPU Acceleration

Edit `docker-compose.yml`:
```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to ChromaDB"

```bash
# Check if running
docker ps | grep chromadb

# Restart
docker-compose restart chromadb

# Check logs
docker logs chromadb
```

### Issue: "Model not found"

```bash
# List installed models
docker exec -it ollama ollama list

# Pull missing model
docker exec -it ollama ollama pull llama3.2
docker exec -it ollama ollama pull nomic-embed-text
```

### Issue: "Search not working"

```bash
# Run diagnostics
npm run diagnose

# Test search specifically
npm run test-search
```

### Issue: "Slow responses"

- First query is always slower (model loading)
- Enable GPU acceleration (see Configuration)
- Use smaller model (llama3.2 instead of mistral)
- Reduce chunk size
- Lower k value

### Complete Reset

```bash
# Stop everything
docker-compose down -v

# Remove volumes
docker volume prune -f

# Start fresh
docker-compose up -d
docker exec -it ollama ollama pull llama3.2
docker exec -it ollama ollama pull nomic-embed-text

# Reinstall
npm install
npm run populate
```

---

## 📊 Performance Tips

| Setting | Impact | Recommendation |
|---------|--------|----------------|
| Chunk Size | Smaller = faster, less context | 500-1000 for balanced |
| k (retrieval) | Higher = more context, slower | 3-5 for most cases |
| LLM Model | Smaller = faster, less accurate | llama3.2 for speed |
| Temperature | Lower = consistent, higher = creative | 0.2 for factual Q&A |
| GPU | 10x faster | Enable if available |

---

## 🔒 Data Privacy

✅ **Everything runs locally**
- No data sent to external APIs
- No cloud dependencies
- Complete control over your data

✅ **Persistent storage**
- Data survives restarts
- Docker volumes for backup
- Export/import capabilities

---

## 🎯 Use Cases

### 💼 Business
- Company knowledge base
- Policy and procedure Q&A
- Employee training materials
- Internal documentation search

### 🎓 Education
- Research paper analysis
- Study material Q&A
- Course content search
- Academic writing assistant

### 🏥 Healthcare
- Medical literature review
- Patient information lookup
- Clinical guidelines search
- Research aggregation

### ⚖️ Legal
- Case law research
- Contract analysis
- Legal document search
- Regulatory compliance

### 💻 Development
- Code documentation search
- Technical manual Q&A
- API reference lookup
- Best practices guide

---

## 🔄 Backup & Restore

### Backup ChromaDB Data

```bash
docker run --rm \
  -v chromadb-data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/chromadb-backup.tar.gz /data
```

### Restore ChromaDB Data

```bash
docker run --rm \
  -v chromadb-data:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/chromadb-backup.tar.gz -C /
```

### Export to JSON

```bash
npm run explore
# Then type: export my-backup.json
```

---

## 🌟 Advanced Features

### Custom Embeddings

You can use different embedding models:

```javascript
const embeddings = new OllamaEmbeddings({
  model: "mxbai-embed-large",  // Different model
});
```

### Multi-Language Support

Ollama supports various languages. Just use multilingual models:

```bash
docker exec -it ollama ollama pull aya
```

### Metadata Filtering

Filter documents by metadata:

```javascript
const results = await collection.get({
  where: { category: "Technology", year: "2024" }
});
```

---

## 📚 Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [ChromaDB Docs](https://docs.trychroma.com/)
- [LangChain JS Docs](https://js.langchain.com/)
- [RAG Explained](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support

Having issues? Check:
1. [Troubleshooting Guide](#-troubleshooting)
2. [Search Troubleshooting](./SEARCH-TROUBLESHOOTING.md)
3. Run diagnostics: `npm run diagnose`

---

## 🎉 Credits

Built with:
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [LangChain](https://www.langchain.com/) - LLM framework
- [Express.js](https://expressjs.com/) - Web framework

---

## ⭐ Star This Repo

If this project helped you, please give it a star! It helps others discover it too.

---

**Made with ❤️ for the AI community**

Happy building! 🚀
