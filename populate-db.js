import dbManager from "./db-manager.js";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

/**
 * Populate Database Script
 * 
 * This script adds various types of sample content to your database
 * so you can immediately start testing queries.
 */

console.log("📦 Populating Vector Database\n");
console.log("=".repeat(70));

async function populateDatabase() {
  try {
    // Initialize database
    console.log("\n🔌 Connecting to database...");
    await dbManager.initialize();

    // Get current stats
    const beforeStats = await dbManager.getStats();
    console.log(`   Current document count: ${beforeStats.documentCount}`);

    // 1. Add technology articles
    console.log("\n📝 Adding technology articles...");
    const techArticles = [
      {
        content: `Cloud computing delivers computing services over the internet, including servers, 
        storage, databases, networking, software, analytics, and intelligence. Major cloud providers 
        include Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). Cloud 
        computing offers several advantages: cost savings (pay-as-you-go model), scalability 
        (easily scale resources up or down), flexibility, disaster recovery, and automatic updates. 
        There are three main types of cloud services: Infrastructure as a Service (IaaS), Platform 
        as a Service (PaaS), and Software as a Service (SaaS).`,
        metadata: {
          title: "Cloud Computing Overview",
          category: "Technology",
          type: "article",
          source: "tech-articles",
        }
      },
      {
        content: `Blockchain is a distributed ledger technology that maintains a secure and 
        decentralized record of transactions. Each block contains a cryptographic hash of the 
        previous block, a timestamp, and transaction data. Once recorded, data in a block cannot 
        be altered retroactively without altering all subsequent blocks. Blockchain has applications 
        beyond cryptocurrency, including supply chain management, healthcare records, voting systems, 
        and smart contracts. Key features include transparency, immutability, decentralization, and 
        enhanced security through cryptography.`,
        metadata: {
          title: "Blockchain Technology",
          category: "Technology",
          type: "article",
          source: "tech-articles",
        }
      },
      {
        content: `Quantum computing uses quantum mechanical phenomena like superposition and 
        entanglement to perform computations. Unlike classical bits that are either 0 or 1, quantum 
        bits (qubits) can exist in multiple states simultaneously. This allows quantum computers to 
        solve certain problems exponentially faster than classical computers. Potential applications 
        include drug discovery, cryptography, financial modeling, climate modeling, and optimization 
        problems. Major companies like IBM, Google, and Microsoft are investing heavily in quantum 
        computing research.`,
        metadata: {
          title: "Quantum Computing Explained",
          category: "Technology",
          type: "article",
          source: "tech-articles",
        }
      }
    ];

    await dbManager.addTextDocuments(techArticles);
    console.log(`   ✅ Added ${techArticles.length} articles`);

    // 2. Add programming concepts
    console.log("\n💻 Adding programming concepts...");
    const programmingConcepts = [
      {
        content: `REST (Representational State Transfer) is an architectural style for designing 
        networked applications. RESTful APIs use HTTP methods (GET, POST, PUT, DELETE) to perform 
        CRUD operations. Key principles include: statelessness (each request contains all necessary 
        information), client-server architecture, cacheability, layered system, and uniform interface. 
        REST APIs typically return data in JSON or XML format. They are widely used for web services 
        because they are simple, scalable, and work well with HTTP.`,
        metadata: {
          title: "REST API Fundamentals",
          category: "Programming",
          type: "concept",
          source: "programming-docs",
        }
      },
      {
        content: `Docker is a platform for developing, shipping, and running applications in 
        containers. Containers package an application with all its dependencies, ensuring it runs 
        consistently across different environments. Benefits include: portability, efficiency 
        (lighter than VMs), isolation, version control, and rapid deployment. Docker uses images 
        (templates for containers) and containers (running instances). Docker Compose allows you 
        to define and run multi-container applications using YAML configuration files.`,
        metadata: {
          title: "Docker Containerization",
          category: "Programming",
          type: "concept",
          source: "programming-docs",
        }
      },
      {
        content: `Microservices architecture structures an application as a collection of loosely 
        coupled services. Each service is self-contained, implements a specific business capability, 
        and can be developed, deployed, and scaled independently. Advantages include: independent 
        deployment, technology diversity, fault isolation, and scalability. Challenges include: 
        increased complexity, distributed system issues, and the need for robust DevOps practices. 
        Communication between services typically uses REST APIs or message queues.`,
        metadata: {
          title: "Microservices Architecture",
          category: "Programming",
          type: "concept",
          source: "programming-docs",
        }
      }
    ];

    await dbManager.addTextDocuments(programmingConcepts);
    console.log(`   ✅ Added ${programmingConcepts.length} concepts`);

    // 3. Add AI/ML content
    console.log("\n🤖 Adding AI/ML content...");
    const aimlContent = [
      {
        content: `Transfer learning is a machine learning technique where a model trained on one 
        task is repurposed for a second related task. Instead of training from scratch, you start 
        with a pre-trained model and fine-tune it for your specific task. This approach is 
        particularly useful when you have limited data for your target task. Transfer learning has 
        been highly successful in computer vision (using models like ResNet, VGG) and natural 
        language processing (using models like BERT, GPT). Benefits include: faster training, 
        better performance with limited data, and reduced computational requirements.`,
        metadata: {
          title: "Transfer Learning",
          category: "AI/ML",
          type: "concept",
          source: "ai-docs",
        }
      },
      {
        content: `Prompt engineering is the practice of designing effective prompts to get better 
        outputs from large language models (LLMs). Key techniques include: few-shot learning 
        (providing examples), chain-of-thought prompting (asking for step-by-step reasoning), 
        role-playing (instructing the model to adopt a specific persona), and constraining outputs 
        (specifying format or length). Good prompts are clear, specific, and provide sufficient 
        context. Prompt engineering is crucial for applications like chatbots, content generation, 
        and code assistance.`,
        metadata: {
          title: "Prompt Engineering Techniques",
          category: "AI/ML",
          type: "concept",
          source: "ai-docs",
        }
      }
    ];

    await dbManager.addTextDocuments(aimlContent);
    console.log(`   ✅ Added ${aimlContent.length} AI/ML documents`);

    // 4. Optionally scrape a website (commented out by default)
    console.log("\n🌐 Website scraping (optional)...");
    console.log("   ⏭️  Skipped (uncomment in script to enable)");
    
    /*
    // Uncomment to scrape a website
    try {
      const loader = new CheerioWebBaseLoader("https://en.wikipedia.org/wiki/Artificial_intelligence");
      const docs = await loader.load();
      
      const webDocs = docs.map(doc => ({
        content: doc.pageContent,
        metadata: {
          source: "https://en.wikipedia.org/wiki/Artificial_intelligence",
          type: "web",
          scrapedAt: new Date().toISOString(),
        }
      }));
      
      await dbManager.addTextDocuments(webDocs);
      console.log(`   ✅ Scraped and added web content`);
    } catch (error) {
      console.log(`   ⚠️  Web scraping failed: ${error.message}`);
    }
    */

    // Get final stats
    const afterStats = await dbManager.getStats();
    const added = afterStats.documentCount - beforeStats.documentCount;

    console.log("\n" + "=".repeat(70));
    console.log("✅ Database populated successfully!");
    console.log(`\n📊 Statistics:`);
    console.log(`   Documents before: ${beforeStats.documentCount}`);
    console.log(`   Documents after: ${afterStats.documentCount}`);
    console.log(`   New documents added: ${added}`);

    console.log("\n💡 Try these sample queries:");
    console.log("   • What is cloud computing?");
    console.log("   • Explain Docker and containerization");
    console.log("   • How does blockchain work?");
    console.log("   • What is transfer learning in AI?");
    console.log("   • Describe microservices architecture");

    console.log("\n🎯 Next steps:");
    console.log("   1. Start the server: npm start");
    console.log("   2. Open admin panel: http://localhost:3000");
    console.log("   3. Try the sample queries in the Query tab");

  } catch (error) {
    console.error("\n❌ Error populating database:", error.message);
    console.error("\nMake sure:");
    console.error("   1. Services are running: docker-compose ps");
    console.error("   2. Models are pulled:");
    console.error("      docker exec -it ollama ollama pull llama3.2");
    console.error("      docker exec -it ollama ollama pull nomic-embed-text");
  }
}

// Run the population script
populateDatabase();
