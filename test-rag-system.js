import dbManager from "./db-manager.js";

/**
 * Test script for the RAG system
 * 
 * This script:
 * 1. Connects to the database
 * 2. Adds sample documents
 * 3. Tests queries
 * 4. Shows statistics
 */

async function testRAGSystem() {
  console.log("🧪 Testing RAG System\n");
  console.log("=".repeat(70));

  try {
    // Step 1: Initialize
    console.log("\n1️⃣  Initializing database...");
    await dbManager.initialize();

    // Step 2: Add sample documents
    console.log("\n2️⃣  Adding sample documents...");
    
    const sampleDocs = [
      {
        content: `Artificial Intelligence (AI) is the simulation of human intelligence by machines.
        It includes machine learning, where systems learn from data, and deep learning, which uses
        neural networks with multiple layers. AI is used in many applications like image recognition,
        natural language processing, and autonomous vehicles.`,
        metadata: {
          title: "Introduction to AI",
          source: "test-data",
          category: "AI",
        }
      },
      {
        content: `Machine Learning is a subset of AI that focuses on algorithms that improve through experience.
        There are three main types: supervised learning (learning from labeled data), unsupervised learning
        (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error).
        Common algorithms include decision trees, neural networks, and support vector machines.`,
        metadata: {
          title: "Machine Learning Basics",
          source: "test-data",
          category: "Machine Learning",
        }
      },
      {
        content: `Natural Language Processing (NLP) enables computers to understand, interpret, and generate
        human language. Key tasks include sentiment analysis, named entity recognition, machine translation,
        and text summarization. Modern NLP relies heavily on transformer models like BERT and GPT, which use
        attention mechanisms to process text.`,
        metadata: {
          title: "NLP Overview",
          source: "test-data",
          category: "NLP",
        }
      },
      {
        content: `Vector databases store data as high-dimensional vectors, enabling similarity search based on
        semantic meaning rather than exact matches. They are essential for RAG (Retrieval Augmented Generation)
        systems, recommendation engines, and semantic search applications. Popular vector databases include
        ChromaDB, Pinecone, Weaviate, and Milvus.`,
        metadata: {
          title: "Vector Databases",
          source: "test-data",
          category: "Databases",
        }
      },
      {
        content: `RAG (Retrieval Augmented Generation) combines information retrieval with text generation.
        First, relevant documents are retrieved from a knowledge base using semantic search. Then, these
        documents provide context for an LLM to generate accurate, grounded responses. RAG reduces
        hallucinations and allows LLMs to access up-to-date or private information.`,
        metadata: {
          title: "RAG Explained",
          source: "test-data",
          category: "RAG",
        }
      }
    ];

    await dbManager.addTextDocuments(sampleDocs);

    // Step 3: Show statistics
    console.log("\n3️⃣  Database Statistics:");
    const stats = await dbManager.getStats();
    console.log(`   Collection: ${stats.collectionName}`);
    console.log(`   Total documents: ${stats.documentCount}`);

    // Step 4: Test queries
    console.log("\n4️⃣  Testing Queries:");
    console.log("=".repeat(70));

    const testQuestions = [
      "What is machine learning?",
      "How does RAG work?",
      "What are vector databases used for?",
      "Tell me about NLP",
    ];

    for (const question of testQuestions) {
      console.log(`\n${"─".repeat(70)}`);
      const result = await dbManager.query(question, 2);
      
      console.log(`\n📄 Sources used:`);
      result.sources.forEach((source, i) => {
        console.log(`   ${i + 1}. ${source.metadata.title} (${source.metadata.category})`);
      });
      
      console.log(`\n💬 Answer:\n${result.answer}`);
    }

    // Step 5: Test similarity search
    console.log("\n\n5️⃣  Testing Similarity Search:");
    console.log("=".repeat(70));
    
    const searchQuery = "neural networks and deep learning";
    console.log(`\n🔍 Query: "${searchQuery}"\n`);
    
    const searchResults = await dbManager.searchSimilar(searchQuery, 3);
    
    console.log("Most similar documents:");
    searchResults.forEach((doc, i) => {
      console.log(`\n${i + 1}. ${doc.metadata.title}`);
      console.log(`   Category: ${doc.metadata.category}`);
      console.log(`   Snippet: ${doc.pageContent.substring(0, 150)}...`);
    });

    console.log("\n\n" + "=".repeat(70));
    console.log("✅ All tests completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   • Start the server: npm start");
    console.log("   • Open admin panel: http://localhost:3000");
    console.log("   • Add your own documents via the UI");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\nMake sure:");
    console.error("   1. Docker containers are running: docker-compose up -d");
    console.error("   2. Models are pulled:");
    console.error("      - docker exec -it ollama ollama pull llama3.2");
    console.error("      - docker exec -it ollama ollama pull nomic-embed-text");
  }
}

// Run tests
testRAGSystem();
