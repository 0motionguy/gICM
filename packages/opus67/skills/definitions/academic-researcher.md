# Academic Researcher
> **ID:** `academic-researcher` | **Tier:** 2 | **Token Cost:** 7000 | **MCP:** tavily, exa

## What This Skill Does

Master academic research workflows including paper discovery, citation analysis, methodology extraction, and research synthesis. Build systematic literature reviews, track citation networks, and extract key findings from academic sources using AI-powered research tools.

## When to Use

- Searching for academic papers on specific topics
- Analyzing citation networks and research trends
- Extracting methodologies and key findings from papers
- Synthesizing research from multiple sources
- Building literature reviews
- Tracking developments in research fields

## Core Capabilities

### 1. Paper Search and Discovery

#### Multi-Source Search Strategy

```typescript
// lib/research/search.ts
interface SearchConfig {
  query: string;
  sources: Array<'arxiv' | 'semantic_scholar' | 'google_scholar' | 'pubmed'>;
  filters?: {
    dateRange?: { from: string; to: string };
    citationMin?: number;
    openAccess?: boolean;
    peerReviewed?: boolean;
  };
  limit?: number;
}

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  citations: number;
  venue: string;
  url: string;
  pdfUrl?: string;
  doi?: string;
  keywords?: string[];
}

// ArXiv API search
async function searchArxiv(query: string, limit: number = 20): Promise<Paper[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=${limit}&sortBy=relevance`;

  const response = await fetch(url);
  const xml = await response.text();

  // Parse XML response (simplified)
  const papers: Paper[] = [];
  // XML parsing logic here...

  return papers;
}

// Semantic Scholar API
async function searchSemanticScholar(query: string, limit: number = 20): Promise<Paper[]> {
  const url = 'https://api.semanticscholar.org/graph/v1/paper/search';
  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
    fields: 'paperId,title,abstract,authors,year,citationCount,venue,openAccessPdf,externalIds',
  });

  const response = await fetch(`${url}?${params}`, {
    headers: { 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY || '' },
  });

  const data = await response.json();

  return data.data.map((paper: any) => ({
    id: paper.paperId,
    title: paper.title,
    authors: paper.authors?.map((a: any) => a.name) || [],
    abstract: paper.abstract || '',
    year: paper.year,
    citations: paper.citationCount,
    venue: paper.venue || '',
    url: `https://www.semanticscholar.org/paper/${paper.paperId}`,
    pdfUrl: paper.openAccessPdf?.url,
    doi: paper.externalIds?.DOI,
  }));
}

// Unified search across sources
async function searchPapers(config: SearchConfig): Promise<Paper[]> {
  const searchPromises = config.sources.map(async (source) => {
    switch (source) {
      case 'arxiv':
        return searchArxiv(config.query, config.limit);
      case 'semantic_scholar':
        return searchSemanticScholar(config.query, config.limit);
      // Add other sources...
      default:
        return [];
    }
  });

  const results = await Promise.all(searchPromises);
  const allPapers = results.flat();

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const unique = allPapers.filter((paper) => {
    const key = paper.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Apply filters
  let filtered = unique;

  if (config.filters?.dateRange) {
    const from = parseInt(config.filters.dateRange.from);
    const to = parseInt(config.filters.dateRange.to);
    filtered = filtered.filter((p) => p.year >= from && p.year <= to);
  }

  if (config.filters?.citationMin) {
    filtered = filtered.filter((p) => p.citations >= config.filters!.citationMin!);
  }

  if (config.filters?.openAccess) {
    filtered = filtered.filter((p) => !!p.pdfUrl);
  }

  // Sort by relevance (citations + recency)
  filtered.sort((a, b) => {
    const scoreA = a.citations * 0.7 + (a.year - 2000) * 0.3;
    const scoreB = b.citations * 0.7 + (b.year - 2000) * 0.3;
    return scoreB - scoreA;
  });

  return filtered.slice(0, config.limit || 50);
}
```

#### Paper Summarization

```typescript
// lib/research/summarize.ts
interface PaperSummary {
  title: string;
  tldr: string;
  keyFindings: string[];
  methodology: string;
  limitations: string[];
  futureWork: string[];
  relevanceScore: number;
}

async function summarizePaper(
  paper: Paper,
  researchQuestion: string
): Promise<PaperSummary> {
  // Use AI to summarize paper
  const prompt = `
    Analyze this academic paper in the context of the research question: "${researchQuestion}"

    Title: ${paper.title}
    Abstract: ${paper.abstract}

    Provide a structured summary:
    1. TL;DR (1-2 sentences)
    2. Key Findings (3-5 bullet points)
    3. Methodology (brief description)
    4. Limitations (if mentioned)
    5. Future Work suggestions
    6. Relevance score (1-10) to the research question

    Format as JSON.
  `;

  // Call AI model (Claude, GPT, etc.)
  const response = await callAI(prompt);

  return JSON.parse(response);
}

// Batch summarize papers
async function summarizePapers(
  papers: Paper[],
  researchQuestion: string,
  concurrency: number = 3
): Promise<PaperSummary[]> {
  const summaries: PaperSummary[] = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < papers.length; i += concurrency) {
    const batch = papers.slice(i, i + concurrency);
    const batchSummaries = await Promise.all(
      batch.map((paper) => summarizePaper(paper, researchQuestion))
    );
    summaries.push(...batchSummaries);
  }

  return summaries;
}
```

### 2. Citation Network Analysis

#### Build Citation Graph

```typescript
// lib/research/citations.ts
interface CitationNode {
  id: string;
  title: string;
  year: number;
  citations: number;
  references: string[];
  citedBy: string[];
}

interface CitationGraph {
  nodes: Map<string, CitationNode>;
  edges: Array<{ from: string; to: string }>;
}

async function buildCitationGraph(
  seedPapers: Paper[],
  depth: number = 2
): Promise<CitationGraph> {
  const graph: CitationGraph = {
    nodes: new Map(),
    edges: [],
  };

  const visited = new Set<string>();
  const queue: Array<{ id: string; currentDepth: number }> = seedPapers.map((p) => ({
    id: p.id,
    currentDepth: 0,
  }));

  while (queue.length > 0) {
    const { id, currentDepth } = queue.shift()!;

    if (visited.has(id) || currentDepth > depth) continue;
    visited.add(id);

    // Fetch paper details with citations
    const details = await fetchPaperWithCitations(id);

    const node: CitationNode = {
      id,
      title: details.title,
      year: details.year,
      citations: details.citationCount,
      references: details.references || [],
      citedBy: details.citedBy || [],
    };

    graph.nodes.set(id, node);

    // Add edges for references
    for (const refId of details.references) {
      graph.edges.push({ from: id, to: refId });

      if (currentDepth < depth && !visited.has(refId)) {
        queue.push({ id: refId, currentDepth: currentDepth + 1 });
      }
    }

    // Add edges for citations (papers that cite this one)
    for (const citerId of details.citedBy.slice(0, 10)) {
      graph.edges.push({ from: citerId, to: id });

      if (currentDepth < depth && !visited.has(citerId)) {
        queue.push({ id: citerId, currentDepth: currentDepth + 1 });
      }
    }
  }

  return graph;
}

async function fetchPaperWithCitations(paperId: string) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/${paperId}`;
  const params = new URLSearchParams({
    fields: 'title,year,citationCount,references.paperId,citations.paperId',
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  return {
    title: data.title,
    year: data.year,
    citationCount: data.citationCount,
    references: data.references?.map((r: any) => r.paperId) || [],
    citedBy: data.citations?.map((c: any) => c.paperId) || [],
  };
}
```

#### Analyze Citation Patterns

```typescript
// lib/research/analysis.ts
interface CitationAnalysis {
  influentialPapers: Paper[];
  emergingPapers: Paper[];
  foundationalPapers: Paper[];
  citationTrends: Array<{ year: number; count: number }>;
  keyAuthors: Array<{ name: string; papers: number; citations: number }>;
  topVenues: Array<{ name: string; papers: number }>;
}

function analyzeCitationGraph(graph: CitationGraph): CitationAnalysis {
  const nodes = Array.from(graph.nodes.values());

  // Find influential papers (high citation count)
  const influential = nodes
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 10);

  // Find emerging papers (recent with growing citations)
  const currentYear = new Date().getFullYear();
  const emerging = nodes
    .filter((n) => n.year >= currentYear - 3)
    .sort((a, b) => {
      const scoreA = a.citations / (currentYear - a.year + 1);
      const scoreB = b.citations / (currentYear - b.year + 1);
      return scoreB - scoreA;
    })
    .slice(0, 10);

  // Find foundational papers (old but still cited)
  const foundational = nodes
    .filter((n) => n.year < currentYear - 5)
    .filter((n) => n.citedBy.length > 0)
    .sort((a, b) => b.citedBy.length - a.citedBy.length)
    .slice(0, 10);

  // Citation trends by year
  const yearCounts = new Map<number, number>();
  nodes.forEach((n) => {
    yearCounts.set(n.year, (yearCounts.get(n.year) || 0) + 1);
  });
  const citationTrends = Array.from(yearCounts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  return {
    influentialPapers: influential.map(nodeToSimplePaper),
    emergingPapers: emerging.map(nodeToSimplePaper),
    foundationalPapers: foundational.map(nodeToSimplePaper),
    citationTrends,
    keyAuthors: [], // Would need author data
    topVenues: [], // Would need venue data
  };
}

function nodeToSimplePaper(node: CitationNode): Paper {
  return {
    id: node.id,
    title: node.title,
    year: node.year,
    citations: node.citations,
    authors: [],
    abstract: '',
    venue: '',
    url: `https://www.semanticscholar.org/paper/${node.id}`,
  };
}
```

### 3. Methodology Extraction

#### Extract Research Methods

```typescript
// lib/research/methodology.ts
interface MethodologyExtraction {
  studyType: string;
  dataCollection: string[];
  sampleSize?: string;
  analysisMethod: string[];
  tools?: string[];
  limitations: string[];
  validityMeasures: string[];
}

async function extractMethodology(abstract: string, fullText?: string): Promise<MethodologyExtraction> {
  const content = fullText || abstract;

  const prompt = `
    Extract the research methodology from this academic paper:

    ${content.substring(0, 4000)}

    Identify and structure:
    1. Study Type (e.g., experimental, observational, survey, meta-analysis, case study)
    2. Data Collection Methods (list all methods used)
    3. Sample Size (if mentioned)
    4. Analysis Methods (statistical or qualitative methods)
    5. Tools/Software Used (if mentioned)
    6. Limitations (acknowledged by authors)
    7. Validity Measures (how they ensured validity)

    Return as JSON with these fields.
  `;

  const response = await callAI(prompt);
  return JSON.parse(response);
}

// Compare methodologies across papers
function compareMethodologies(
  methodologies: MethodologyExtraction[]
): {
  commonMethods: string[];
  uniqueApproaches: string[];
  methodologyGaps: string[];
} {
  const allMethods = methodologies.flatMap((m) => [
    ...m.dataCollection,
    ...m.analysisMethod,
  ]);

  const methodCounts = new Map<string, number>();
  allMethods.forEach((method) => {
    const normalized = method.toLowerCase().trim();
    methodCounts.set(normalized, (methodCounts.get(normalized) || 0) + 1);
  });

  const threshold = methodologies.length * 0.5;

  const commonMethods = Array.from(methodCounts.entries())
    .filter(([, count]) => count >= threshold)
    .map(([method]) => method);

  const uniqueApproaches = Array.from(methodCounts.entries())
    .filter(([, count]) => count === 1)
    .map(([method]) => method);

  return {
    commonMethods,
    uniqueApproaches,
    methodologyGaps: identifyMethodologyGaps(methodologies),
  };
}

function identifyMethodologyGaps(methodologies: MethodologyExtraction[]): string[] {
  const gaps: string[] = [];

  // Check for common methodological issues
  const allLimitations = methodologies.flatMap((m) => m.limitations);

  const limitationPatterns = [
    { pattern: /sample size/i, gap: 'Limited sample sizes across studies' },
    { pattern: /generalizab/i, gap: 'Generalizability concerns' },
    { pattern: /longitudinal/i, gap: 'Lack of longitudinal studies' },
    { pattern: /causation|causal/i, gap: 'Difficulty establishing causation' },
  ];

  limitationPatterns.forEach(({ pattern, gap }) => {
    if (allLimitations.some((l) => pattern.test(l))) {
      gaps.push(gap);
    }
  });

  return gaps;
}
```

### 4. Research Synthesis

#### Build Literature Review

```typescript
// lib/research/synthesis.ts
interface LiteratureReview {
  title: string;
  researchQuestion: string;
  sections: Array<{
    heading: string;
    content: string;
    papers: Paper[];
  }>;
  themes: string[];
  gaps: string[];
  futureDirections: string[];
  references: Paper[];
}

async function synthesizeLiterature(
  papers: Paper[],
  summaries: PaperSummary[],
  researchQuestion: string
): Promise<LiteratureReview> {
  // Cluster papers by theme
  const themes = await identifyThemes(summaries);

  // Generate synthesis for each theme
  const sections = await Promise.all(
    themes.map(async (theme) => {
      const themePapers = papers.filter((p, i) =>
        summaries[i].keyFindings.some((f) =>
          f.toLowerCase().includes(theme.toLowerCase())
        )
      );

      const synthesis = await synthesizeTheme(theme, themePapers, summaries);

      return {
        heading: theme,
        content: synthesis,
        papers: themePapers,
      };
    })
  );

  // Identify research gaps
  const allLimitations = summaries.flatMap((s) => s.limitations);
  const allFutureWork = summaries.flatMap((s) => s.futureWork);

  const gaps = await identifyGaps(allLimitations, allFutureWork, researchQuestion);
  const futureDirections = await suggestFutureDirections(gaps, summaries);

  return {
    title: `Literature Review: ${researchQuestion}`,
    researchQuestion,
    sections,
    themes,
    gaps,
    futureDirections,
    references: papers,
  };
}

async function identifyThemes(summaries: PaperSummary[]): Promise<string[]> {
  const allFindings = summaries.flatMap((s) => s.keyFindings).join('\n');

  const prompt = `
    Analyze these research findings and identify 3-5 major themes:

    ${allFindings}

    Return as JSON array of theme names.
  `;

  const response = await callAI(prompt);
  return JSON.parse(response);
}

async function synthesizeTheme(
  theme: string,
  papers: Paper[],
  summaries: PaperSummary[]
): Promise<string> {
  const relevantSummaries = summaries.filter((s) =>
    s.keyFindings.some((f) => f.toLowerCase().includes(theme.toLowerCase()))
  );

  const prompt = `
    Synthesize the research findings on "${theme}" from these papers:

    ${relevantSummaries.map((s) => `
      - ${s.title}: ${s.keyFindings.join('; ')}
    `).join('\n')}

    Write 2-3 paragraphs that:
    1. Summarize the consensus findings
    2. Note any contradictions or debates
    3. Identify the current state of knowledge

    Write in academic style with proper synthesis, not just listing findings.
  `;

  return await callAI(prompt);
}
```

#### Generate Research Report

```typescript
// lib/research/report.ts
interface ResearchReport {
  executiveSummary: string;
  introduction: string;
  methodology: string;
  findings: string;
  discussion: string;
  conclusion: string;
  references: string;
}

async function generateResearchReport(
  review: LiteratureReview
): Promise<ResearchReport> {
  const executiveSummary = await generateExecutiveSummary(review);
  const introduction = await generateIntroduction(review);
  const methodology = generateMethodologySection(review);
  const findings = generateFindingsSection(review);
  const discussion = await generateDiscussion(review);
  const conclusion = await generateConclusion(review);
  const references = formatReferences(review.references);

  return {
    executiveSummary,
    introduction,
    methodology,
    findings,
    discussion,
    conclusion,
    references,
  };
}

function formatReferences(papers: Paper[]): string {
  return papers
    .sort((a, b) => a.authors[0]?.localeCompare(b.authors[0] || '') || 0)
    .map((paper) => {
      const authors = paper.authors.join(', ');
      return `${authors} (${paper.year}). ${paper.title}. ${paper.venue}. ${paper.doi ? `https://doi.org/${paper.doi}` : paper.url}`;
    })
    .join('\n\n');
}

function generateMethodologySection(review: LiteratureReview): string {
  return `
## Methodology

This literature review was conducted using a systematic approach:

### Search Strategy
Papers were searched across multiple academic databases including Semantic Scholar, arXiv, and Google Scholar using the research question: "${review.researchQuestion}"

### Inclusion Criteria
- Peer-reviewed publications
- Published within relevant timeframe
- Directly addressing the research question

### Analysis Approach
Papers were analyzed for:
- Key findings and contributions
- Methodological approaches
- Limitations and gaps

### Synthesis
Themes were identified through qualitative analysis of paper abstracts and findings, resulting in ${review.themes.length} major themes.

Total papers reviewed: ${review.references.length}
  `.trim();
}
```

## Real-World Examples

### Example 1: Research Topic Explorer

```typescript
// app/api/research/explore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchPapers, summarizePapers, buildCitationGraph, analyzeCitationGraph } from '@/lib/research';

export async function POST(request: NextRequest) {
  const { topic, depth = 2 } = await request.json();

  // Search for papers
  const papers = await searchPapers({
    query: topic,
    sources: ['semantic_scholar', 'arxiv'],
    filters: {
      dateRange: { from: '2020', to: '2024' },
      citationMin: 10,
    },
    limit: 30,
  });

  // Summarize top papers
  const summaries = await summarizePapers(papers.slice(0, 10), topic);

  // Build and analyze citation graph
  const graph = await buildCitationGraph(papers.slice(0, 5), depth);
  const analysis = analyzeCitationGraph(graph);

  return NextResponse.json({
    papers,
    summaries,
    analysis,
    stats: {
      totalPapers: papers.length,
      summarized: summaries.length,
      graphNodes: graph.nodes.size,
      graphEdges: graph.edges.length,
    },
  });
}
```

### Example 2: Systematic Review Generator

```typescript
// lib/systematic-review.ts
async function conductSystematicReview(config: {
  researchQuestion: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  databases: string[];
}) {
  // Phase 1: Search
  const allPapers = await searchPapers({
    query: config.researchQuestion,
    sources: config.databases as any,
    limit: 200,
  });

  // Phase 2: Screening
  const screenedPapers = await screenPapers(
    allPapers,
    config.inclusionCriteria,
    config.exclusionCriteria
  );

  // Phase 3: Full-text review
  const summaries = await summarizePapers(screenedPapers, config.researchQuestion);

  // Phase 4: Synthesis
  const review = await synthesizeLiterature(
    screenedPapers,
    summaries,
    config.researchQuestion
  );

  // Phase 5: Generate report
  const report = await generateResearchReport(review);

  return {
    prismaFlow: {
      identified: allPapers.length,
      screened: screenedPapers.length,
      included: screenedPapers.length,
    },
    review,
    report,
  };
}
```

## Related Skills

- **web-search** - General web research
- **content-writer** - Writing research summaries
- **notion-navigator** - Organizing research notes
- **vector-wizard** - Semantic search for papers

## Further Reading

- [Semantic Scholar API](https://api.semanticscholar.org/)
- [arXiv API](https://info.arxiv.org/help/api/index.html)
- [Systematic Review Guidelines](https://www.cochranelibrary.com/about/about-cochrane-reviews)
- [PRISMA Guidelines](http://www.prisma-statement.org/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
