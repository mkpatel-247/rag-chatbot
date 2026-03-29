import { ChromaClient } from "chromadb";
import { Ollama } from "@langchain/community/llms/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/**
 * Centralized Database Manager for ChromaDB
 * 
 * This class handles all interactions with ChromaDB:
 * - Adding documents (PDFs, text files, web content)
 * - Searching/querying documents
 * - Managing collections
 * - Listing documents
 */
class VectorDBManager {
  constructor() {
    // ChromaDB client
    this.chromaClient = new ChromaClient({
      path: "http://localhost:8000", // ChromaDB server URL
    });

    // Ollama LLM
    this.llm = new Ollama({
      baseUrl: "http://localhost:11434",
      model: "llama3.2",
      temperature: 0.7,
    });

    // Ollama Embeddings
    this.embeddings = new OllamaEmbeddings({
      baseUrl: "http://localhost:11434",
      model: "nomic-embed-text",
    });

    // Collection name (ChromaDB groups documents in collections)
    this.collectionName = "knowledge_base";

    // Text splitter for chunking documents
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Store the vector store instance
    this.vectorStore = null;
  }

  /**
   * Initialize the database connection
   * Creates collection if it doesn't exist
   */
  async initialize() {
    try {
      console.log("🔌 Connecting to ChromaDB...");

      // Test connection
      await this.chromaClient.heartbeat();
      console.log("✅ ChromaDB connection successful");

      // Initialize LangChain Chroma vector store
      this.vectorStore = await Chroma.fromExistingCollection(
        this.embeddings,
        {
          collectionName: this.collectionName,
          url: "http://localhost:8000",
        }
      ).catch(async (err) => {
        if (err.message.includes("does not exist") || err.message.includes("Invalid where clause")) {
          console.log("📁 Collection issue detected, attempting to recreate/clear...");
          return await this.createCollection();
        }
        throw err;
      });

      console.log(`✅ Connected to collection: ${this.collectionName}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to ChromaDB:", error.message);

      // If collection doesn't exist, create it
      if (error.message.includes("does not exist")) {
        console.log("📁 Creating new collection...");
        await this.createCollection();
        return true;
      }
      return false;
    }
  }

  /**
   * Create a new collection
   */
  async createCollection() {
    try {
      // Create an empty collection by adding a dummy document
      this.vectorStore = await Chroma.fromTexts(
        ["Initialization document"],
        [{ source: "system", type: "init" }],
        this.embeddings,
        {
          collectionName: this.collectionName,
          url: "http://localhost:8000",
        }
      );

      console.log(`✅ Collection '${this.collectionName}' created`);
    } catch (error) {
      console.error("❌ Error creating collection:", error.message);
      throw error;
    }
  }

  /**
   * Add text documents to the database
   * @param {Array} documents - Array of {content: string, metadata: object}
   * @returns {Array} - IDs of added documents
   */
  async addTextDocuments(documents) {
    try {
      console.log(`\n📝 Adding ${documents.length} text document(s)...`);

      // Prepare documents in LangChain format
      const langchainDocs = documents.map(doc => ({
        pageContent: doc.content,
        metadata: {
          ...doc.metadata,
          addedAt: new Date().toISOString(),
          type: "text",
        },
      }));

      // Split documents into chunks
      const splitDocs = await this.textSplitter.splitDocuments(langchainDocs);
      console.log(`   Split into ${splitDocs.length} chunks`);

      // Add to vector store
      const ids = await this.vectorStore.addDocuments(splitDocs);

      console.log(`✅ Added ${ids.length} chunks to database`);
      return ids;
    } catch (error) {
      console.error("❌ Error adding documents:", error.message);
      throw error;
    }
  }

  /**
   * Add a single text document
   * @param {string} content - Text content
   * @param {object} metadata - Document metadata (title, source, etc.)
   */
  async addDocument(content, metadata = {}) {
    return await this.addTextDocuments([{ content, metadata }]);
  }

  /**
   * Search for similar documents
   * @param {string} query - Search query
   * @param {number} k - Number of results to return
   * @returns {Array} - Similar documents
   */
  async searchSimilar(query, k = 5) {
    try {
      console.log(`\n🔍 Searching for: "${query}"`);

      let results;
      try {
        results = await this.vectorStore.similaritySearch(query, k);
      } catch (error) {
        if (error.message.includes("Invalid where clause")) {
          console.log("   (Bypassing LangChain filter bug...)");
          const queryEmbedding = await this.embeddings.embedQuery(query);
          const response = await this.vectorStore.collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: k,
          });
          results = response.ids[0].map((id, i) => ({
            pageContent: response.documents[0][i],
            metadata: response.metadatas[0][i],
          }));
        } else {
          throw error;
        }
      }

      console.log(`   Found ${results.length} similar documents`);
      return results;
    } catch (error) {
      console.error("❌ Search error:", error.message);
      throw error;
    }
  }

  /**
   * Query the database with RAG
   * @param {string} question - User question
   * @param {number} k - Number of documents to retrieve
   * @returns {object} - {answer, sources}
   */
  async query(question, k = 3) {
    try {
      console.log(`\n❓ Query: "${question}"`);

      // Step 1: Retrieve relevant documents
      let relevantDocs;
      try {
        relevantDocs = await this.vectorStore.similaritySearch(question, k);
      } catch (error) {
        if (error.message.includes("Invalid where clause")) {
          console.log("   (Bypassing LangChain filter bug...)");
          const queryEmbedding = await this.embeddings.embedQuery(question);
          const response = await this.vectorStore.collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: k,
          });
          relevantDocs = response.ids[0].map((id, i) => ({
            pageContent: response.documents[0][i],
            metadata: response.metadatas[0][i],
          }));
        } else {
          throw error;
        }
      }
      console.log("--------------------------------------------------------------------------------------------");
      if (relevantDocs.length === 0) {
        return {
          answer: "I don't have any relevant information to answer that question.",
          sources: [],
        };
      }

      // Step 2: Format context from retrieved documents
      const context = relevantDocs
        .map((doc, i) => `[Document ${i + 1}]\n${doc.pageContent}`)
        .join("\n\n---\n\n");

      // Step 3: Create prompt
      const prompt = `You are a helpful AI assistant. Answer the question based on the following context.
If the answer cannot be found in the context, say "I don't have enough information to answer that."

Context:
${context}

Question: ${question}

Answer:`;

      // Step 4: Get answer from LLM
      console.log("   Generating answer...");
      const answer = await this.llm.invoke(prompt);

      // Step 5: Extract sources
      const sources = relevantDocs.map(doc => ({
        content: doc.pageContent.substring(0, 200) + "...",
        metadata: doc.metadata,
      }));

      console.log("✅ Answer generated");

      return { answer, sources };
    } catch (error) {
      console.error("❌ Query error:", error.message);
      throw error;
    }
  }

  /**
   * Get collection statistics
   * @returns {object} - Collection stats
   */
  async getStats() {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName,
      });

      const count = await collection.count();

      return {
        collectionName: this.collectionName,
        documentCount: count,
      };
    } catch (error) {
      console.error("❌ Error getting stats:", error.message);
      return {
        collectionName: this.collectionName,
        documentCount: 0,
      };
    }
  }

  /**
   * List all documents in collection (with pagination)
   * @param {number} limit - Max documents to return
   * @param {number} offset - Starting position
   * @returns {Array} - Documents
   */
  async listDocuments(limit = 10, offset = 0) {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName,
      });

      const results = await collection.get({
        limit: limit,
        offset: offset,
        include: ["metadatas", "documents"],
      });

      return {
        documents: results.documents.map((doc, i) => ({
          id: results.ids[i],
          content: doc,
          metadata: results.metadatas[i],
        })),
        total: await collection.count(),
      };
    } catch (error) {
      console.error("❌ Error listing documents:", error.message);
      return { documents: [], total: 0 };
    }
  }

  /**
   * Delete documents by ID
   * @param {Array} ids - Document IDs to delete
   */
  async deleteDocuments(ids) {
    try {
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName,
      });

      await collection.delete({ ids });
      console.log(`✅ Deleted ${ids.length} document(s)`);
      return true;
    } catch (error) {
      console.error("❌ Error deleting documents:", error.message);
      throw error;
    }
  }

  /**
   * Clear entire collection
   */
  async clearCollection() {
    try {
      await this.chromaClient.deleteCollection({ name: this.collectionName });
      console.log(`✅ Collection '${this.collectionName}' cleared`);

      // Recreate empty collection
      await this.createCollection();
      return true;
    } catch (error) {
      console.error("❌ Error clearing collection:", error.message);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.chromaClient.heartbeat();
      return { status: "healthy", database: "ChromaDB" };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  }
}

// Export singleton instance
const dbManager = new VectorDBManager();
export default dbManager;
