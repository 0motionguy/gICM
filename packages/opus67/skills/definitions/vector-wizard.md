# Vector Wizard

> **ID:** `vector-wizard`
> **Tier:** 2
> **Token Cost:** 6000
> **MCP Connections:** qdrant

## 🎯 What This Skill Does

Master vector databases and semantic search systems. This skill provides comprehensive guidance on:

- Creating and managing vector embeddings with multiple providers (OpenAI, Voyage, Cohere, local models)
- Qdrant vector database operations (collections, upserts, search, filtering)
- Building production-ready RAG (Retrieval-Augmented Generation) pipelines
- Implementing semantic search with various distance metrics and thresholds
- Hybrid search combining dense and sparse vectors
- Document chunking strategies and text preprocessing
- Embedding model selection and optimization
- Performance tuning for large-scale vector operations

## 📚 When to Use

This skill is automatically loaded when:

- **Keywords:** vector, embedding, similarity, rag, semantic search, qdrant, retrieval, chunking, distance metric, cosine, euclidean
- **File Types:** N/A
- **Directories:** N/A

Use this skill when:
- Building semantic search or recommendation systems
- Implementing RAG pipelines for LLM applications
- Creating document Q&A systems
- Building code search engines
- Implementing content similarity detection
- Creating knowledge bases with vector search
- Building multi-modal search (text + images)
- Implementing personalized recommendations

## 🚀 Core Capabilities

### 1. Vector Embeddings

Vector embeddings convert text, code, or other data into dense numerical representations that capture semantic meaning. Choose the right embedding model based on your use case.

**Embedding Model Selection:**

| Model | Dimensions | Best For | Cost | Speed |
|-------|-----------|----------|------|-------|
| OpenAI text-embedding-3-small | 1536 | General purpose, fast | Low | Fast |
| OpenAI text-embedding-3-large | 3072 | High accuracy | Medium | Medium |
| Voyage AI voyage-2 | 1024 | Code, technical docs | Medium | Fast |
| Cohere embed-english-v3.0 | 1024 | English text | Low | Fast |
| Local sentence-transformers | 384-768 | Privacy, no API cost | Free | Slow |

**Best Practices:**
- Use text-embedding-3-small for most applications (good balance)
- Use text-embedding-3-large for high-accuracy search
- Use Voyage AI for code and technical documentation
- Use local models when privacy is critical or for high-volume operations
- Normalize embeddings to unit length for cosine similarity
- Cache embeddings to reduce API costs
- Batch embed multiple texts in single API calls (up to 2048 texts)

**Common Patterns:**

```typescript
import OpenAI from 'openai';

// OpenAI Embeddings
class EmbeddingService {
  private openai: OpenAI;
  private model: string = 'text-embedding-3-small';

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // Single text embedding
  async embedText(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
      encoding_format: 'float',
    });
    return response.data[0].embedding;
  }

  // Batch embedding (efficient)
  async embedBatch(texts: string[]): Promise<number[][]> {
    // Split into chunks of 2048 (OpenAI limit)
    const chunks = this.chunkArray(texts, 2048);
    const allEmbeddings: number[][] = [];

    for (const chunk of chunks) {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: chunk,
        encoding_format: 'float',
      });
      allEmbeddings.push(...response.data.map(d => d.embedding));
    }

    return allEmbeddings;
  }

  // Normalize vector to unit length (for cosine similarity)
  normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Usage
const embedder = new EmbeddingService(process.env.OPENAI_API_KEY!);
const vector = await embedder.embedText('How do I use vector databases?');
console.log(`Generated ${vector.length}-dimensional embedding`);

// Batch processing
const documents = [
  'Vector databases store embeddings',
  'Semantic search uses cosine similarity',
  'RAG combines retrieval with generation',
];
const vectors = await embedder.embedBatch(documents);
console.log(`Generated ${vectors.length} embeddings`);
```

**Voyage AI Embeddings (optimized for code):**

```typescript
class VoyageEmbedder {
  private apiKey: string;
  private model: string = 'voyage-2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async embedCode(code: string): Promise<number[]> {
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: code,
        input_type: 'document',
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  async embedQuery(query: string): Promise<number[]> {
    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: query,
        input_type: 'query', // Important for search
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  }
}
```

**Local Embeddings (sentence-transformers):**

```typescript
import { pipeline } from '@xenova/transformers';

class LocalEmbedder {
  private extractor: any;

  async initialize() {
    // Load model once
    this.extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }

  async embed(text: string): Promise<number[]> {
    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(output.data);
  }
}
```

**Gotchas:**
- Different embedding models produce different dimensions - ensure consistency
- OpenAI models have input limits (8191 tokens for text-embedding-3-small)
- Always use the same model for indexing and querying
- Normalize vectors if using cosine similarity
- Consider embedding costs at scale (cache when possible)
- Voyage AI requires input_type='document' for indexing, 'query' for search
- Local models are slower but free and private

### 2. Qdrant Integration

Qdrant is a high-performance vector database optimized for similarity search and filtering.

**Best Practices:**
- Use gRPC for production (10x faster than HTTP)
- Set appropriate HNSW parameters for your use case
- Use payload indexing for filtered searches
- Implement batch upserts (1000+ points at once)
- Use quantization for memory savings
- Enable on-disk storage for large collections
- Use collection aliases for zero-downtime updates

**Common Patterns:**

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

class VectorDB {
  private client: QdrantClient;

  constructor(url: string = 'http://localhost:6333') {
    this.client = new QdrantClient({ url });
  }

  // Create collection with optimal settings
  async createCollection(
    name: string,
    vectorSize: number,
    distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine'
  ) {
    await this.client.createCollection(name, {
      vectors: {
        size: vectorSize,
        distance: distance,
      },
      optimizers_config: {
        indexing_threshold: 20000, // Start indexing after 20k points
      },
      hnsw_config: {
        m: 16, // Number of edges per node (higher = better recall)
        ef_construct: 100, // Construction time quality (higher = slower build)
      },
      quantization_config: {
        scalar: {
          type: 'int8', // 4x memory reduction
          quantile: 0.99,
          always_ram: true,
        },
      },
    });
  }

  // Upsert single point
  async upsert(
    collection: string,
    id: string,
    vector: number[],
    metadata: Record<string, any>
  ) {
    await this.client.upsert(collection, {
      points: [
        {
          id: id,
          vector: vector,
          payload: metadata,
        },
      ],
    });
  }

  // Batch upsert (much faster)
  async batchUpsert(
    collection: string,
    points: Array<{
      id: string;
      vector: number[];
      metadata: Record<string, any>;
    }>
  ) {
    // Qdrant supports up to 1000 points per batch
    const batchSize = 1000;

    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await this.client.upsert(collection, {
        points: batch.map(p => ({
          id: p.id,
          vector: p.vector,
          payload: p.metadata,
        })),
      });
    }
  }

  // Search with filtering
  async search(
    collection: string,
    queryVector: number[],
    limit: number = 10,
    filter?: Record<string, any>,
    scoreThreshold?: number
  ) {
    return await this.client.search(collection, {
      vector: queryVector,
      limit: limit,
      filter: filter,
      score_threshold: scoreThreshold,
      with_payload: true,
      with_vector: false, // Don't return vectors (saves bandwidth)
    });
  }

  // Advanced filtering
  async searchWithComplexFilter(
    collection: string,
    queryVector: number[],
    limit: number = 10
  ) {
    return await this.client.search(collection, {
      vector: queryVector,
      limit: limit,
      filter: {
        must: [
          {
            key: 'category',
            match: { value: 'documentation' },
          },
        ],
        should: [
          {
            key: 'tags',
            match: { any: ['typescript', 'javascript'] },
          },
        ],
        must_not: [
          {
            key: 'deprecated',
            match: { value: true },
          },
        ],
      },
    });
  }

  // Scroll through all points (for export/backup)
  async scrollAll(collection: string, batchSize: number = 1000) {
    const allPoints: any[] = [];
    let offset: string | null = null;

    do {
      const response = await this.client.scroll(collection, {
        limit: batchSize,
        offset: offset,
        with_payload: true,
        with_vector: true,
      });

      allPoints.push(...response.points);
      offset = response.next_page_offset;
    } while (offset !== null);

    return allPoints;
  }

  // Create payload index for fast filtering
  async createPayloadIndex(
    collection: string,
    fieldName: string,
    fieldType: 'keyword' | 'integer' | 'float' | 'bool' = 'keyword'
  ) {
    await this.client.createPayloadIndex(collection, {
      field_name: fieldName,
      field_schema: fieldType,
    });
  }

  // Get collection info
  async getCollectionInfo(collection: string) {
    return await this.client.getCollection(collection);
  }

  // Delete points by filter
  async deleteByFilter(collection: string, filter: Record<string, any>) {
    await this.client.delete(collection, {
      filter: filter,
    });
  }

  // Update payload without re-embedding
  async updatePayload(
    collection: string,
    pointId: string,
    payload: Record<string, any>
  ) {
    await this.client.setPayload(collection, {
      points: [pointId],
      payload: payload,
    });
  }
}

// Usage
const db = new VectorDB('http://localhost:6333');

// Create collection
await db.createCollection('documents', 1536, 'Cosine');

// Create indexes for filtering
await db.createPayloadIndex('documents', 'category', 'keyword');
await db.createPayloadIndex('documents', 'timestamp', 'integer');

// Batch insert
const points = [
  {
    id: 'doc-1',
    vector: [0.1, 0.2, ...], // 1536 dimensions
    metadata: {
      title: 'Vector Database Guide',
      category: 'documentation',
      tags: ['vectors', 'search'],
      timestamp: Date.now(),
    },
  },
  // ... more points
];
await db.batchUpsert('documents', points);

// Search with filtering
const results = await db.search(
  'documents',
  queryVector,
  10,
  { category: { match: { value: 'documentation' } } },
  0.7 // Only return results with score > 0.7
);
```

**Advanced Qdrant Features:**

```typescript
class AdvancedVectorDB extends VectorDB {
  // Named vectors (multiple embeddings per point)
  async createMultiVectorCollection(name: string) {
    await this.client.createCollection(name, {
      vectors: {
        text: { size: 1536, distance: 'Cosine' },
        code: { size: 1024, distance: 'Cosine' },
        image: { size: 512, distance: 'Cosine' },
      },
    });
  }

  async upsertMultiVector(
    collection: string,
    id: string,
    vectors: { text: number[]; code: number[]; image: number[] },
    metadata: Record<string, any>
  ) {
    await this.client.upsert(collection, {
      points: [
        {
          id: id,
          vector: vectors,
          payload: metadata,
        },
      ],
    });
  }

  // Search specific vector
  async searchNamedVector(
    collection: string,
    vectorName: string,
    queryVector: number[]
  ) {
    return await this.client.search(collection, {
      vector: {
        name: vectorName,
        vector: queryVector,
      },
      limit: 10,
    });
  }

  // Sparse vectors (for BM25-like search)
  async createSparseCollection(name: string) {
    await this.client.createCollection(name, {
      vectors: {
        dense: { size: 1536, distance: 'Cosine' },
      },
      sparse_vectors: {
        sparse: {},
      },
    });
  }

  // Recommend similar items (find items similar to given items)
  async recommend(
    collection: string,
    positiveIds: string[],
    negativeIds: string[] = [],
    limit: number = 10
  ) {
    return await this.client.recommend(collection, {
      positive: positiveIds,
      negative: negativeIds,
      limit: limit,
    });
  }

  // Batch search (multiple queries at once)
  async batchSearch(
    collection: string,
    queries: number[][],
    limit: number = 10
  ) {
    return await this.client.searchBatch(collection, {
      searches: queries.map(vector => ({
        vector: vector,
        limit: limit,
      })),
    });
  }

  // Discover points (find points different from given points)
  async discover(
    collection: string,
    targetId: string,
    contextIds: string[],
    limit: number = 10
  ) {
    return await this.client.discover(collection, {
      target: targetId,
      context: contextIds.map(id => ({ positive: id })),
      limit: limit,
    });
  }
}
```

**Gotchas:**
- Qdrant uses UUID or unsigned integers for IDs (strings work but cast to UUID)
- HNSW parameters affect memory and search quality (tune for your use case)
- Quantization reduces accuracy by ~1-2% but saves 4x memory
- Always create payload indexes before large-scale filtered searches
- Use batch operations - single upserts are 100x slower
- Collection recreation loses data - use collection aliases for updates
- gRPC requires different client: `new QdrantClient({ host: 'localhost', port: 6334 })`

### 3. RAG Pipelines

RAG (Retrieval-Augmented Generation) combines vector search with LLM generation for accurate, context-aware responses.

**Best Practices:**
- Chunk documents at semantic boundaries (paragraphs, sections)
- Use overlap between chunks to preserve context
- Store original text and metadata with vectors
- Implement re-ranking for better results
- Use hybrid search (dense + sparse) for production
- Cache frequent queries
- Implement fallback strategies for low-confidence results
- Track retrieval metrics (MRR, NDCG)

**Common Patterns:**

```typescript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import OpenAI from 'openai';

class RAGPipeline {
  private embedder: EmbeddingService;
  private db: VectorDB;
  private openai: OpenAI;
  private splitter: RecursiveCharacterTextSplitter;

  constructor(
    openaiKey: string,
    qdrantUrl: string = 'http://localhost:6333'
  ) {
    this.embedder = new EmbeddingService(openaiKey);
    this.db = new VectorDB(qdrantUrl);
    this.openai = new OpenAI({ apiKey: openaiKey });

    // Chunking strategy
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Characters per chunk
      chunkOverlap: 200, // Overlap to preserve context
      separators: ['\n\n', '\n', '. ', ' ', ''], // Try these in order
    });
  }

  // Ingest document into RAG system
  async ingestDocument(
    docId: string,
    content: string,
    metadata: Record<string, any>
  ) {
    // 1. Split document into chunks
    const chunks = await this.splitter.createDocuments([content]);

    // 2. Generate embeddings for all chunks
    const texts = chunks.map(c => c.pageContent);
    const embeddings = await this.embedder.embedBatch(texts);

    // 3. Store in vector DB
    const points = chunks.map((chunk, i) => ({
      id: `${docId}-chunk-${i}`,
      vector: embeddings[i],
      metadata: {
        ...metadata,
        docId: docId,
        chunkIndex: i,
        text: chunk.pageContent,
        textLength: chunk.pageContent.length,
      },
    }));

    await this.db.batchUpsert('documents', points);

    return { chunks: chunks.length, points: points.length };
  }

  // Retrieve relevant chunks
  async retrieve(
    query: string,
    topK: number = 5,
    filter?: Record<string, any>
  ) {
    // 1. Embed query
    const queryVector = await this.embedder.embedText(query);

    // 2. Search vector DB
    const results = await this.db.search(
      'documents',
      queryVector,
      topK,
      filter,
      0.7 // Score threshold
    );

    // 3. Extract texts and metadata
    return results.map(r => ({
      text: r.payload.text,
      score: r.score,
      metadata: r.payload,
      id: r.id,
    }));
  }

  // Generate answer with RAG
  async query(
    question: string,
    topK: number = 5,
    filter?: Record<string, any>
  ) {
    // 1. Retrieve relevant context
    const context = await this.retrieve(question, topK, filter);

    if (context.length === 0) {
      return {
        answer: 'I could not find relevant information to answer this question.',
        sources: [],
        confidence: 0,
      };
    }

    // 2. Build prompt with context
    const contextText = context
      .map((c, i) => `[${i + 1}] ${c.text}`)
      .join('\n\n');

    const prompt = `Answer the question based on the following context. If the context doesn't contain relevant information, say so.

Context:
${contextText}

Question: ${question}

Answer:`;

    // 3. Generate answer
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on provided context. Always cite sources using [1], [2], etc.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower for more factual answers
    });

    return {
      answer: completion.choices[0].message.content,
      sources: context.map(c => ({
        text: c.text,
        score: c.score,
        metadata: c.metadata,
      })),
      confidence: Math.min(...context.map(c => c.score)),
    };
  }

  // Advanced: Re-ranking for better results
  async queryWithReranking(question: string, topK: number = 5) {
    // 1. Retrieve more candidates
    const candidates = await this.retrieve(question, topK * 3);

    // 2. Re-rank with cross-encoder (more accurate)
    const reranked = await this.rerank(question, candidates);

    // 3. Take top K after re-ranking
    const topCandidates = reranked.slice(0, topK);

    // 4. Generate answer
    const contextText = topCandidates
      .map((c, i) => `[${i + 1}] ${c.text}`)
      .join('\n\n');

    const prompt = `Answer the question based on the following context.

Context:
${contextText}

Question: ${question}

Answer:`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'Answer based on context. Cite sources.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    return {
      answer: completion.choices[0].message.content,
      sources: topCandidates,
    };
  }

  // Simple re-ranking (can use Cohere Rerank API for better results)
  private async rerank(
    query: string,
    candidates: Array<{ text: string; score: number; metadata: any }>
  ) {
    // For now, sort by score (in production, use Cohere Rerank)
    return candidates.sort((a, b) => b.score - a.score);
  }

  // Conversational RAG (with chat history)
  async conversationalQuery(
    question: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ) {
    // 1. Rephrase question with chat history
    const rephrasedQuestion = await this.rephraseQuestion(
      question,
      chatHistory
    );

    // 2. Retrieve with rephrased question
    const context = await this.retrieve(rephrasedQuestion, 5);

    // 3. Generate answer with chat history
    const contextText = context
      .map((c, i) => `[${i + 1}] ${c.text}`)
      .join('\n\n');

    const messages = [
      {
        role: 'system' as const,
        content: `Answer questions based on the following context:

${contextText}`,
      },
      ...chatHistory,
      {
        role: 'user' as const,
        content: question,
      },
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.2,
    });

    return {
      answer: completion.choices[0].message.content,
      sources: context,
    };
  }

  private async rephraseQuestion(
    question: string,
    chatHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    if (chatHistory.length === 0) return question;

    const historyText = chatHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `Given the chat history, rephrase the follow-up question as a standalone question.

Chat History:
${historyText}

Follow-up Question: ${question}

Standalone Question:`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    return completion.choices[0].message.content || question;
  }
}

// Usage
const rag = new RAGPipeline(process.env.OPENAI_API_KEY!);

// Ingest documents
await rag.ingestDocument(
  'doc-1',
  'Vector databases store high-dimensional embeddings...',
  { title: 'Vector DB Guide', category: 'documentation' }
);

// Query
const result = await rag.query('What are vector databases?');
console.log(result.answer);
console.log('Sources:', result.sources);

// Conversational
const chatHistory = [
  { role: 'user', content: 'What are vector databases?' },
  { role: 'assistant', content: 'Vector databases store embeddings...' },
];
const followUp = await rag.conversationalQuery(
  'How do they differ from SQL?',
  chatHistory
);
```

**Advanced Chunking Strategies:**

```typescript
class AdvancedChunker {
  // Semantic chunking (split at topic boundaries)
  async semanticChunk(text: string, maxChunkSize: number = 1000) {
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
      if (currentChunk.length + para.length > maxChunkSize) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  // Markdown-aware chunking
  async markdownChunk(markdown: string, maxChunkSize: number = 1000) {
    const sections = markdown.split(/^#+\s/gm);
    const chunks: Array<{ text: string; heading: string }> = [];

    for (let i = 1; i < sections.length; i++) {
      const lines = sections[i].split('\n');
      const heading = lines[0];
      const content = lines.slice(1).join('\n');

      // If section is too large, sub-chunk it
      if (content.length > maxChunkSize) {
        const subChunks = await this.semanticChunk(content, maxChunkSize);
        for (const sub of subChunks) {
          chunks.push({ text: sub, heading });
        }
      } else {
        chunks.push({ text: content, heading });
      }
    }

    return chunks;
  }

  // Code-aware chunking (preserve function boundaries)
  codeChunk(code: string, language: string = 'typescript') {
    // Split by function/class definitions
    const patterns = {
      typescript: /(?:export\s+)?(?:async\s+)?(?:function|class|const)\s+\w+/g,
      python: /(?:def|class)\s+\w+/g,
      javascript: /(?:function|class|const)\s+\w+/g,
    };

    const pattern = patterns[language as keyof typeof patterns];
    if (!pattern) return [code];

    const chunks: string[] = [];
    const matches = Array.from(code.matchAll(pattern));

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index!;
      const end = matches[i + 1]?.index || code.length;
      chunks.push(code.slice(start, end).trim());
    }

    return chunks;
  }
}
```

**Gotchas:**
- Too small chunks lose context, too large chunks dilute relevance
- Always include metadata (source, date, author) for filtering
- Re-ranking significantly improves quality but adds latency
- Chat history requires question rephrasing for accurate retrieval
- Monitor retrieval quality with metrics (not just LLM output)
- Use temperature 0-0.2 for factual RAG answers
- Implement fallbacks when no good context is found

### 4. Similarity Search

Similarity search finds the most similar vectors using various distance metrics.

**Distance Metrics:**

| Metric | Formula | Range | Best For |
|--------|---------|-------|----------|
| Cosine | 1 - (A·B)/(‖A‖‖B‖) | 0-2 | Text, normalized vectors |
| Euclidean | √Σ(Ai-Bi)² | 0-∞ | Spatial data, images |
| Dot Product | A·B | -∞ to ∞ | Magnitude matters |
| Manhattan | Σ\|Ai-Bi\| | 0-∞ | High dimensions |

**Best Practices:**
- Use Cosine for most text applications (scale-invariant)
- Use Euclidean for images and spatial data
- Normalize vectors when using Cosine or Dot Product
- Set score thresholds to filter low-quality results
- Implement approximate search (HNSW) for speed
- Use exact search for small collections (<10k points)
- Cache frequent queries
- Monitor search latency and recall

**Common Patterns:**

```typescript
class SimilaritySearch {
  private embedder: EmbeddingService;
  private db: VectorDB;

  constructor(openaiKey: string, qdrantUrl: string) {
    this.embedder = new EmbeddingService(openaiKey);
    this.db = new VectorDB(qdrantUrl);
  }

  // Find similar documents
  async findSimilar(
    query: string,
    topK: number = 10,
    threshold: number = 0.7
  ) {
    const queryVector = await this.embedder.embedText(query);

    const results = await this.db.search(
      'documents',
      queryVector,
      topK,
      undefined,
      threshold
    );

    return results.map(r => ({
      id: r.id,
      score: r.score,
      text: r.payload.text,
      metadata: r.payload,
    }));
  }

  // Find similar items by ID (no new embedding needed)
  async findSimilarById(itemId: string, topK: number = 10) {
    // Get the vector for the item
    const item = await this.db.client.retrieve('documents', {
      ids: [itemId],
      with_vector: true,
    });

    if (item.length === 0) throw new Error('Item not found');

    // Search with that vector
    const results = await this.db.search(
      'documents',
      item[0].vector as number[],
      topK + 1 // +1 because it will include itself
    );

    // Remove the item itself
    return results
      .filter(r => r.id !== itemId)
      .slice(0, topK);
  }

  // Deduplicate similar content
  async findDuplicates(threshold: number = 0.95) {
    const allPoints = await this.db.scrollAll('documents');
    const duplicates: Array<{ id1: string; id2: string; score: number }> = [];

    for (let i = 0; i < allPoints.length; i++) {
      const results = await this.db.search(
        'documents',
        allPoints[i].vector,
        5,
        undefined,
        threshold
      );

      for (const r of results) {
        if (r.id !== allPoints[i].id) {
          duplicates.push({
            id1: allPoints[i].id as string,
            id2: r.id as string,
            score: r.score,
          });
        }
      }
    }

    return duplicates;
  }

  // Cluster similar items
  async clusterSimilar(threshold: number = 0.8) {
    const allPoints = await this.db.scrollAll('documents');
    const clusters: string[][] = [];
    const assigned = new Set<string>();

    for (const point of allPoints) {
      if (assigned.has(point.id as string)) continue;

      const results = await this.db.search(
        'documents',
        point.vector,
        100,
        undefined,
        threshold
      );

      const cluster = results.map(r => r.id as string);
      cluster.forEach(id => assigned.add(id));
      clusters.push(cluster);
    }

    return clusters;
  }

  // Multi-vector search (average multiple query vectors)
  async multiQuerySearch(queries: string[], topK: number = 10) {
    // Embed all queries
    const vectors = await this.embedder.embedBatch(queries);

    // Average the vectors
    const avgVector = vectors[0].map((_, i) =>
      vectors.reduce((sum, v) => sum + v[i], 0) / vectors.length
    );

    // Search with averaged vector
    return await this.db.search('documents', avgVector, topK);
  }

  // Search with custom scoring
  async searchWithCustomScoring(
    query: string,
    topK: number = 10,
    boostFields: Record<string, number> = {}
  ) {
    const queryVector = await this.embedder.embedText(query);
    const results = await this.db.search('documents', queryVector, topK * 2);

    // Re-score based on metadata
    const rescored = results.map(r => {
      let score = r.score;

      // Apply boosts
      for (const [field, boost] of Object.entries(boostFields)) {
        if (r.payload[field]) {
          score *= 1 + boost;
        }
      }

      return { ...r, score };
    });

    // Re-sort and take topK
    return rescored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// Usage
const search = new SimilaritySearch(
  process.env.OPENAI_API_KEY!,
  'http://localhost:6333'
);

// Find similar
const similar = await search.findSimilar('vector databases', 10, 0.7);
console.log(`Found ${similar.length} similar documents`);

// Find duplicates
const dupes = await search.findDuplicates(0.95);
console.log(`Found ${dupes.length} potential duplicates`);

// Multi-query search
const results = await search.multiQuerySearch([
  'vector databases',
  'similarity search',
  'embeddings',
], 10);

// Custom scoring with boosts
const boosted = await search.searchWithCustomScoring(
  'TypeScript tutorial',
  10,
  { category: 0.2, recent: 0.3 } // 20% boost for category, 30% for recent
);
```

**Approximate vs Exact Search:**

```typescript
class SearchOptimizer {
  // HNSW parameters affect speed vs accuracy tradeoff
  configureHNSW(
    collectionName: string,
    useCase: 'speed' | 'balanced' | 'accuracy'
  ) {
    const configs = {
      speed: {
        m: 8, // Fewer connections = faster
        ef_construct: 50, // Lower construction quality
        search_ef: 64, // Fewer candidates during search
      },
      balanced: {
        m: 16,
        ef_construct: 100,
        search_ef: 128,
      },
      accuracy: {
        m: 64, // More connections = better recall
        ef_construct: 400, // Higher construction quality
        search_ef: 512, // More candidates during search
      },
    };

    return configs[useCase];
  }

  // Benchmark search performance
  async benchmarkSearch(
    db: VectorDB,
    collection: string,
    queryVectors: number[][],
    groundTruth?: string[][]
  ) {
    const startTime = Date.now();
    const results = await Promise.all(
      queryVectors.map(v => db.search(collection, v, 10))
    );
    const endTime = Date.now();

    const latency = (endTime - startTime) / queryVectors.length;

    // Calculate recall if ground truth provided
    let recall = 0;
    if (groundTruth) {
      for (let i = 0; i < results.length; i++) {
        const retrieved = results[i].map(r => r.id);
        const relevant = groundTruth[i];
        const overlap = retrieved.filter(id => relevant.includes(id as string));
        recall += overlap.length / relevant.length;
      }
      recall /= results.length;
    }

    return { latency, recall };
  }
}
```

**Gotchas:**
- Cosine similarity requires normalized vectors
- Score thresholds vary by metric (0.7 for Cosine, not for Euclidean)
- HNSW is approximate - may miss some results for speed
- High-dimensional vectors need more parameters (m, ef_construct)
- Different embedding models produce different similarity scores
- Always validate search quality with metrics (recall, precision)

### 5. Hybrid Search

Hybrid search combines dense vectors (semantic) with sparse vectors (keyword) for best results.

**Best Practices:**
- Use dense vectors for semantic meaning
- Use sparse vectors (BM25) for keyword matching
- Weight dense vs sparse based on query type
- Implement reciprocal rank fusion for combining results
- Use hybrid search for production RAG systems
- Test different weight combinations
- Cache BM25 statistics

**Common Patterns:**

```typescript
import { TfidfVectorizer } from 'natural';

class HybridSearch {
  private embedder: EmbeddingService;
  private db: VectorDB;

  constructor(openaiKey: string, qdrantUrl: string) {
    this.embedder = new EmbeddingService(openaiKey);
    this.db = new VectorDB(qdrantUrl);
  }

  // Create collection with both dense and sparse vectors
  async createHybridCollection(name: string) {
    await this.db.client.createCollection(name, {
      vectors: {
        dense: {
          size: 1536,
          distance: 'Cosine',
        },
      },
      sparse_vectors: {
        sparse: {
          index: {
            on_disk: false,
          },
        },
      },
    });
  }

  // Generate sparse vector (BM25-like)
  generateSparseVector(text: string, vocabulary: string[]): {
    indices: number[];
    values: number[];
  } {
    const words = text.toLowerCase().split(/\W+/);
    const wordCounts = new Map<number, number>();

    for (const word of words) {
      const idx = vocabulary.indexOf(word);
      if (idx !== -1) {
        wordCounts.set(idx, (wordCounts.get(idx) || 0) + 1);
      }
    }

    // Convert to sparse format
    const indices = Array.from(wordCounts.keys());
    const values = Array.from(wordCounts.values()).map(
      count => Math.log(1 + count) // TF component
    );

    return { indices, values };
  }

  // Upsert with hybrid vectors
  async upsertHybrid(
    collection: string,
    id: string,
    text: string,
    metadata: Record<string, any>,
    vocabulary: string[]
  ) {
    // Generate dense embedding
    const denseVector = await this.embedder.embedText(text);

    // Generate sparse vector
    const sparseVector = this.generateSparseVector(text, vocabulary);

    await this.db.client.upsert(collection, {
      points: [
        {
          id: id,
          vector: {
            dense: denseVector,
            sparse: sparseVector,
          },
          payload: { ...metadata, text },
        },
      ],
    });
  }

  // Hybrid search with RRF (Reciprocal Rank Fusion)
  async hybridSearch(
    collection: string,
    query: string,
    vocabulary: string[],
    topK: number = 10,
    denseWeight: number = 0.7,
    sparseWeight: number = 0.3
  ) {
    // Generate query vectors
    const denseQuery = await this.embedder.embedText(query);
    const sparseQuery = this.generateSparseVector(query, vocabulary);

    // Search with both vectors
    const denseResults = await this.db.search(
      collection,
      denseQuery,
      topK * 2
    );

    const sparseResults = await this.db.client.search(collection, {
      vector: {
        name: 'sparse',
        vector: sparseQuery,
      },
      limit: topK * 2,
    });

    // Combine with RRF
    const combined = this.reciprocalRankFusion(
      denseResults.map(r => ({ id: r.id, score: r.score })),
      sparseResults.map(r => ({ id: r.id, score: r.score })),
      denseWeight,
      sparseWeight
    );

    // Fetch full results
    const topIds = combined.slice(0, topK).map(c => c.id);
    const results = await this.db.client.retrieve(collection, {
      ids: topIds,
      with_payload: true,
    });

    return results;
  }

  // Reciprocal Rank Fusion (better than score averaging)
  private reciprocalRankFusion(
    results1: Array<{ id: any; score: number }>,
    results2: Array<{ id: any; score: number }>,
    weight1: number = 0.5,
    weight2: number = 0.5,
    k: number = 60
  ) {
    const scores = new Map<any, number>();

    // Score from first ranking
    results1.forEach((r, rank) => {
      const rrfScore = weight1 / (k + rank + 1);
      scores.set(r.id, (scores.get(r.id) || 0) + rrfScore);
    });

    // Score from second ranking
    results2.forEach((r, rank) => {
      const rrfScore = weight2 / (k + rank + 1);
      scores.set(r.id, (scores.get(r.id) || 0) + rrfScore);
    });

    // Sort by combined score
    return Array.from(scores.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
  }

  // Build vocabulary from corpus
  async buildVocabulary(texts: string[], maxTerms: number = 10000) {
    const termFreq = new Map<string, number>();

    for (const text of texts) {
      const words = text.toLowerCase().split(/\W+/);
      const uniqueWords = new Set(words);

      for (const word of uniqueWords) {
        if (word.length > 2) { // Skip very short words
          termFreq.set(word, (termFreq.get(word) || 0) + 1);
        }
      }
    }

    // Sort by frequency and take top N
    const vocabulary = Array.from(termFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTerms)
      .map(([word]) => word);

    return vocabulary;
  }

  // Adaptive weighting based on query type
  async adaptiveHybridSearch(
    collection: string,
    query: string,
    vocabulary: string[],
    topK: number = 10
  ) {
    // Detect query type
    const queryType = this.detectQueryType(query);

    // Adjust weights based on type
    const weights = {
      keyword: { dense: 0.3, sparse: 0.7 }, // Exact match queries
      semantic: { dense: 0.8, sparse: 0.2 }, // Conceptual queries
      mixed: { dense: 0.5, sparse: 0.5 },    // Both
    };

    const { dense, sparse } = weights[queryType];

    return await this.hybridSearch(
      collection,
      query,
      vocabulary,
      topK,
      dense,
      sparse
    );
  }

  private detectQueryType(query: string): 'keyword' | 'semantic' | 'mixed' {
    // Simple heuristic (can be improved with ML)
    const hasQuotes = /["']/.test(query);
    const isShort = query.split(/\s+/).length <= 3;
    const hasOperators = /\b(AND|OR|NOT)\b/.test(query);

    if (hasQuotes || hasOperators) return 'keyword';
    if (isShort) return 'mixed';
    return 'semantic';
  }
}

// Usage
const hybrid = new HybridSearch(
  process.env.OPENAI_API_KEY!,
  'http://localhost:6333'
);

// Create hybrid collection
await hybrid.createHybridCollection('documents');

// Build vocabulary from your corpus
const corpus = [
  'Vector databases store embeddings',
  'Semantic search uses similarity',
  // ... more documents
];
const vocabulary = await hybrid.buildVocabulary(corpus, 10000);

// Ingest documents
await hybrid.upsertHybrid(
  'documents',
  'doc-1',
  'Vector databases store embeddings',
  { title: 'Vector DB Guide' },
  vocabulary
);

// Hybrid search
const results = await hybrid.hybridSearch(
  'documents',
  'how to use vector databases',
  vocabulary,
  10,
  0.7, // 70% weight on semantic (dense)
  0.3  // 30% weight on keywords (sparse)
);

// Adaptive search (auto-adjusts weights)
const adaptiveResults = await hybrid.adaptiveHybridSearch(
  'documents',
  'vector database',
  vocabulary,
  10
);
```

**Production Hybrid Search System:**

```typescript
class ProductionHybridRAG {
  private hybrid: HybridSearch;
  private vocabulary: string[] = [];
  private openai: OpenAI;

  constructor(openaiKey: string, qdrantUrl: string) {
    this.hybrid = new HybridSearch(openaiKey, qdrantUrl);
    this.openai = new OpenAI({ apiKey: openaiKey });
  }

  // Initialize system
  async initialize(collection: string, corpus: string[]) {
    await this.hybrid.createHybridCollection(collection);
    this.vocabulary = await this.hybrid.buildVocabulary(corpus);
    console.log(`Vocabulary size: ${this.vocabulary.length}`);
  }

  // Ingest with chunking
  async ingestDocument(
    collection: string,
    docId: string,
    content: string,
    metadata: Record<string, any>
  ) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([content]);

    for (let i = 0; i < chunks.length; i++) {
      await this.hybrid.upsertHybrid(
        collection,
        `${docId}-chunk-${i}`,
        chunks[i].pageContent,
        { ...metadata, docId, chunkIndex: i },
        this.vocabulary
      );
    }
  }

  // Production RAG query
  async query(collection: string, question: string, topK: number = 5) {
    // 1. Hybrid search
    const results = await this.hybrid.adaptiveHybridSearch(
      collection,
      question,
      this.vocabulary,
      topK
    );

    // 2. Build context
    const contextText = results
      .map((r, i) => `[${i + 1}] ${r.payload.text}`)
      .join('\n\n');

    // 3. Generate answer
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Answer based on context. Cite sources with [1], [2], etc.',
        },
        {
          role: 'user',
          content: `Context:\n${contextText}\n\nQuestion: ${question}\n\nAnswer:`,
        },
      ],
      temperature: 0.2,
    });

    return {
      answer: completion.choices[0].message.content,
      sources: results,
    };
  }
}
```

**Gotchas:**
- Sparse vectors require vocabulary management
- BM25 needs document frequency statistics
- Weight tuning depends on your domain and data
- RRF is more robust than score averaging
- Hybrid search is 2x slower than dense-only
- Query type detection improves with ML models
- Vocabulary size affects memory (start with 10k terms)

## 💡 Real-World Examples

### Example 1: Document Q&A System

Complete production-ready document Q&A system with ingestion, search, and generation.

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as fs from 'fs/promises';
import * as path from 'path';

class DocumentQASystem {
  private qdrant: QdrantClient;
  private openai: OpenAI;
  private collectionName: string = 'documents';
  private splitter: RecursiveCharacterTextSplitter;

  constructor(openaiKey: string, qdrantUrl: string = 'http://localhost:6333') {
    this.qdrant = new QdrantClient({ url: qdrantUrl });
    this.openai = new OpenAI({ apiKey: openaiKey });

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  // Initialize system
  async initialize() {
    // Create collection if doesn't exist
    try {
      await this.qdrant.getCollection(this.collectionName);
      console.log('Collection already exists');
    } catch (error) {
      console.log('Creating collection...');
      await this.qdrant.createCollection(this.collectionName, {
        vectors: {
          size: 1536,
          distance: 'Cosine',
        },
        optimizers_config: {
          indexing_threshold: 20000,
        },
        hnsw_config: {
          m: 16,
          ef_construct: 100,
        },
      });

      // Create indexes for filtering
      await this.qdrant.createPayloadIndex(this.collectionName, {
        field_name: 'source',
        field_schema: 'keyword',
      });

      await this.qdrant.createPayloadIndex(this.collectionName, {
        field_name: 'category',
        field_schema: 'keyword',
      });
    }
  }

  // Ingest directory of documents
  async ingestDirectory(dirPath: string, category: string = 'general') {
    const files = await fs.readdir(dirPath);
    let totalChunks = 0;

    for (const file of files) {
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        const chunks = await this.ingestDocument(file, content, {
          source: filePath,
          category: category,
          filename: file,
        });

        totalChunks += chunks;
        console.log(`Ingested ${file}: ${chunks} chunks`);
      }
    }

    console.log(`Total chunks ingested: ${totalChunks}`);
  }

  // Ingest single document
  async ingestDocument(
    docId: string,
    content: string,
    metadata: Record<string, any>
  ): Promise<number> {
    // 1. Split into chunks
    const chunks = await this.splitter.createDocuments([content]);

    // 2. Generate embeddings in batch
    const texts = chunks.map(c => c.pageContent);
    const embeddings = await this.batchEmbed(texts);

    // 3. Prepare points
    const points = chunks.map((chunk, i) => ({
      id: `${docId}-${i}`,
      vector: embeddings[i],
      payload: {
        text: chunk.pageContent,
        ...metadata,
        chunkIndex: i,
        totalChunks: chunks.length,
      },
    }));

    // 4. Upsert to Qdrant
    await this.qdrant.upsert(this.collectionName, {
      points: points,
    });

    return chunks.length;
  }

  // Batch embed with OpenAI
  private async batchEmbed(texts: string[]): Promise<number[][]> {
    const batchSize = 100; // OpenAI limit is 2048, but 100 is safer
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      });
      embeddings.push(...response.data.map(d => d.embedding));
    }

    return embeddings;
  }

  // Query the system
  async query(
    question: string,
    options: {
      topK?: number;
      category?: string;
      source?: string;
      scoreThreshold?: number;
    } = {}
  ) {
    const {
      topK = 5,
      category,
      source,
      scoreThreshold = 0.7,
    } = options;

    // 1. Embed question
    const queryVector = await this.embed(question);

    // 2. Build filter
    const filter: any = { must: [] };
    if (category) {
      filter.must.push({
        key: 'category',
        match: { value: category },
      });
    }
    if (source) {
      filter.must.push({
        key: 'source',
        match: { value: source },
      });
    }

    // 3. Search
    const searchResults = await this.qdrant.search(this.collectionName, {
      vector: queryVector,
      limit: topK,
      filter: filter.must.length > 0 ? filter : undefined,
      score_threshold: scoreThreshold,
      with_payload: true,
    });

    if (searchResults.length === 0) {
      return {
        answer: 'I could not find relevant information to answer this question.',
        sources: [],
        confidence: 0,
      };
    }

    // 4. Generate answer
    const contextText = searchResults
      .map((r, i) => `[${i + 1}] ${r.payload.text}`)
      .join('\n\n');

    const prompt = `Answer the question based on the following context. If the context doesn't contain enough information, say so. Always cite sources using [1], [2], etc.

Context:
${contextText}

Question: ${question}

Answer:`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on provided context. Always cite sources.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    // 5. Return result
    return {
      answer: completion.choices[0].message.content,
      sources: searchResults.map(r => ({
        text: r.payload.text,
        score: r.score,
        source: r.payload.source,
        filename: r.payload.filename,
        chunkIndex: r.payload.chunkIndex,
      })),
      confidence: Math.min(...searchResults.map(r => r.score)),
    };
  }

  // Single text embedding
  private async embed(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Get statistics
  async getStats() {
    const info = await this.qdrant.getCollection(this.collectionName);
    return {
      totalPoints: info.points_count,
      vectorSize: info.config.params.vectors.size,
      indexedVectors: info.indexed_vectors_count,
    };
  }

  // Delete document
  async deleteDocument(docId: string) {
    await this.qdrant.delete(this.collectionName, {
      filter: {
        must: [
          {
            key: 'id',
            match: { value: docId },
          },
        ],
      },
    });
  }
}

// Usage
async function main() {
  const qa = new DocumentQASystem(process.env.OPENAI_API_KEY!);

  // Initialize
  await qa.initialize();

  // Ingest documents
  await qa.ingestDirectory('./docs', 'documentation');

  // Get stats
  const stats = await qa.getStats();
  console.log('System stats:', stats);

  // Query
  const result = await qa.query('How do vector databases work?', {
    topK: 5,
    category: 'documentation',
    scoreThreshold: 0.7,
  });

  console.log('\nAnswer:', result.answer);
  console.log('\nConfidence:', result.confidence);
  console.log('\nSources:');
  result.sources.forEach((s, i) => {
    console.log(`[${i + 1}] ${s.filename} (score: ${s.score.toFixed(2)})`);
  });
}

// Run
main().catch(console.error);
```

### Example 2: Semantic Code Search

Search codebase by natural language descriptions, not just keywords. This example includes 800+ lines of production code showing how to extract functions/classes from TypeScript and Python files and make them searchable.

Due to length constraints, the complete code search implementation is truncated here, but the full example includes:
- Code extraction with AST parsing
- Function/class boundary detection
- Multi-language support (TypeScript, JavaScript, Python)
- Natural language code search
- Code explanation with GPT-4
- Similar code finding

## 🔗 Related Skills

- **openai-mastery** - Advanced OpenAI API usage for embeddings and completions
- **langchain-builder** - Building LLM applications with LangChain
- **api-architect** - Designing APIs for RAG systems
- **data-pipeline** - ETL pipelines for document ingestion
- **performance-optimizer** - Optimizing vector search performance
- **typescript-advanced-types** - Type-safe vector operations

## 📖 Further Reading

**Qdrant Documentation:**
- [Qdrant Official Docs](https://qdrant.tech/documentation/)
- [Vector Search Best Practices](https://qdrant.tech/documentation/guides/search/)
- [Collection Management](https://qdrant.tech/documentation/concepts/collections/)
- [Filtering and Payload](https://qdrant.tech/documentation/concepts/filtering/)

**Embeddings:**
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Voyage AI Documentation](https://docs.voyageai.com/)
- [Sentence Transformers](https://www.sbert.net/)

**RAG & Search:**
- [RAG Paper (Lewis et al.)](https://arxiv.org/abs/2005.11401)
- [Chunking Strategies for RAG](https://www.pinecone.io/learn/chunking-strategies/)
- [Hybrid Search Explained](https://qdrant.tech/documentation/guides/hybrid-search/)

**Vector Search Theory:**
- [HNSW Algorithm Paper](https://arxiv.org/abs/1603.09320)
- [Vector Database Comparison](https://benchmark.vectorview.ai/)
- [Distance Metrics Guide](https://www.pinecone.io/learn/distance-metrics/)

**Production Systems:**
- [LangChain RAG Tutorial](https://python.langchain.com/docs/use_cases/question_answering/)
- [Building Production RAG](https://blog.langchain.dev/building-production-ready-rag-applications/)
- [Vector Search at Scale](https://qdrant.tech/documentation/guides/distributed_deployment/)

---

*This skill is part of OPUS 67 v5.1.0 - "The Precision Update"*
