import express from "express";
import cors from "cors";
import multer from "multer";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import dbManager from "./db-manager.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express Server with Admin Panel API
 * 
 * Provides REST API for managing the vector database:
 * - Upload PDFs
 * - Add text documents
 * - Scrape websites
 * - Query documents (RAG)
 * - List/delete documents
 */

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve admin panel HTML

// Configure file upload
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Ensure required directories exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
if (!fs.existsSync("public")) {
  fs.mkdirSync("public");
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get("/api/health", async (req, res) => {
  try {
    const health = await dbManager.healthCheck();
    const stats = await dbManager.getStats();
    
    res.json({
      status: "ok",
      database: health,
      stats: stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get database statistics
 */
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await dbManager.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * List all documents (with pagination)
 */
app.get("/api/documents", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await dbManager.listDocuments(limit, offset);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add a text document
 * Body: { content: string, metadata: object }
 */
app.post("/api/documents/text", async (req, res) => {
  try {
    const { content, metadata = {} } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const ids = await dbManager.addDocument(content, {
      ...metadata,
      source: metadata.source || "user-input",
    });

    res.json({
      success: true,
      message: "Document added successfully",
      ids: ids,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Upload and process PDF file
 */
app.post("/api/documents/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`\n📄 Processing PDF: ${req.file.originalname}`);

    // Load PDF
    const loader = new PDFLoader(req.file.path);
    const docs = await loader.load();

    console.log(`   Extracted ${docs.length} pages`);

    // Prepare documents for database
    const documents = docs.map(doc => ({
      content: doc.pageContent,
      metadata: {
        filename: req.file.originalname,
        source: "pdf-upload",
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
      },
    }));

    // Add to database
    const ids = await dbManager.addTextDocuments(documents);

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `PDF processed: ${docs.length} pages added`,
      filename: req.file.originalname,
      pages: docs.length,
      chunks: ids.length,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * Scrape and add content from a website
 * Body: { url: string }
 */
app.post("/api/documents/web", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(`\n🌐 Scraping: ${url}`);

    // Load webpage
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();

    console.log(`   Loaded ${docs.length} page(s)`);

    // Prepare documents
    const documents = docs.map(doc => ({
      content: doc.pageContent,
      metadata: {
        source: url,
        scrapedAt: new Date().toISOString(),
        type: "web",
      },
    }));

    // Add to database
    const ids = await dbManager.addTextDocuments(documents);

    res.json({
      success: true,
      message: "Website content added successfully",
      url: url,
      chunks: ids.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Query the database (RAG)
 * Body: { question: string, k: number (optional) }
 */
app.post("/api/query", async (req, res) => {
  try {
    const { question, k = 3 } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const result = await dbManager.query(question, k);

    res.json({
      success: true,
      question: question,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search for similar documents
 * Body: { query: string, k: number (optional) }
 */
app.post("/api/search", async (req, res) => {
  try {
    const { query, k = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const results = await dbManager.searchSimilar(query, k);

    res.json({
      success: true,
      query: query,
      results: results.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete documents by IDs
 * Body: { ids: string[] }
 */
app.delete("/api/documents", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "IDs array is required" });
    }

    await dbManager.deleteDocuments(ids);

    res.json({
      success: true,
      message: `Deleted ${ids.length} document(s)`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear entire collection
 */
app.delete("/api/documents/all", async (req, res) => {
  try {
    await dbManager.clearCollection();

    res.json({
      success: true,
      message: "All documents cleared",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    console.log("🚀 Starting RAG Server with Admin Panel\n");
    console.log("=".repeat(60));

    // Initialize database
    const initialized = await dbManager.initialize();

    if (!initialized) {
      console.error("\n❌ Failed to initialize database. Exiting...");
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`\n📊 Admin Panel: http://localhost:${PORT}`);
      console.log(`\n📡 API Endpoints:`);
      console.log(`   GET  /api/health`);
      console.log(`   GET  /api/stats`);
      console.log(`   GET  /api/documents`);
      console.log(`   POST /api/documents/text`);
      console.log(`   POST /api/documents/pdf`);
      console.log(`   POST /api/documents/web`);
      console.log(`   POST /api/query`);
      console.log(`   POST /api/search`);
      console.log(`   DELETE /api/documents`);
      console.log(`   DELETE /api/documents/all`);
      console.log("\n" + "=".repeat(60));
    });
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down server...");
  process.exit(0);
});

// Start the server
startServer();
