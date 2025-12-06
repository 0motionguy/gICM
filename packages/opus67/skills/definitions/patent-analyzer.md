# Patent Analyzer
> **ID:** `patent-analyzer` | **Tier:** 3 | **Token Cost:** 6000 | **MCP:** tavily, exa

## What This Skill Does

Master patent research and intellectual property analysis including patent search, prior art discovery, claim analysis, and IP landscape mapping. Build systematic workflows for evaluating patent portfolios, identifying freedom-to-operate issues, and tracking competitive IP strategies.

## When to Use

- Searching for relevant patents on specific technologies
- Analyzing prior art for patent applications
- Breaking down patent claims for infringement analysis
- Mapping competitive IP landscapes
- Evaluating patent portfolio strength
- Identifying licensing opportunities

## Core Capabilities

### 1. Patent Search

#### Multi-Database Search Strategy

```typescript
// lib/patent/search.ts
interface PatentSearchConfig {
  query: string;
  databases: Array<'google_patents' | 'uspto' | 'espacenet' | 'wipo'>;
  filters?: {
    dateRange?: { from: string; to: string };
    jurisdictions?: string[];
    assignees?: string[];
    inventors?: string[];
    cpcCodes?: string[];
    status?: 'granted' | 'pending' | 'expired' | 'all';
  };
  limit?: number;
}

interface Patent {
  id: string;
  title: string;
  abstract: string;
  claims: string[];
  inventors: string[];
  assignee: string;
  filingDate: string;
  grantDate?: string;
  expirationDate?: string;
  status: string;
  jurisdiction: string;
  cpcCodes: string[];
  citations: {
    forward: number;
    backward: number;
  };
  pdfUrl?: string;
  familyId?: string;
}

// Google Patents API search
async function searchGooglePatents(query: string, limit: number = 20): Promise<Patent[]> {
  // Google Patents doesn't have official API - use web scraping or third-party
  const response = await fetch('https://patents.google.com/xhr/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: query,
      num: limit,
    }),
  });

  const data = await response.json();
  return parseGooglePatentsResponse(data);
}

// USPTO PatentsView API
async function searchUSPTO(query: string, limit: number = 20): Promise<Patent[]> {
  const url = 'https://api.patentsview.org/patents/query';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: { _text_any: { patent_abstract: query } },
      f: [
        'patent_number',
        'patent_title',
        'patent_abstract',
        'patent_date',
        'assignee_organization',
        'inventor_first_name',
        'inventor_last_name',
      ],
      o: { per_page: limit },
    }),
  });

  const data = await response.json();
  return data.patents.map((p: any) => ({
    id: p.patent_number,
    title: p.patent_title,
    abstract: p.patent_abstract,
    claims: [],
    inventors: p.inventors?.map((i: any) => `${i.inventor_first_name} ${i.inventor_last_name}`) || [],
    assignee: p.assignees?.[0]?.assignee_organization || '',
    filingDate: p.patent_date,
    status: 'granted',
    jurisdiction: 'US',
    cpcCodes: [],
    citations: { forward: 0, backward: 0 },
  }));
}

// Unified search
async function searchPatents(config: PatentSearchConfig): Promise<Patent[]> {
  const results = await Promise.all(
    config.databases.map(async (db) => {
      switch (db) {
        case 'google_patents':
          return searchGooglePatents(config.query, config.limit);
        case 'uspto':
          return searchUSPTO(config.query, config.limit);
        default:
          return [];
      }
    })
  );

  const allPatents = results.flat();

  // Deduplicate by patent number
  const unique = new Map<string, Patent>();
  allPatents.forEach((p) => {
    if (!unique.has(p.id)) {
      unique.set(p.id, p);
    }
  });

  // Apply filters
  let filtered = Array.from(unique.values());

  if (config.filters?.jurisdictions?.length) {
    filtered = filtered.filter((p) =>
      config.filters!.jurisdictions!.includes(p.jurisdiction)
    );
  }

  if (config.filters?.assignees?.length) {
    filtered = filtered.filter((p) =>
      config.filters!.assignees!.some((a) =>
        p.assignee.toLowerCase().includes(a.toLowerCase())
      )
    );
  }

  return filtered.slice(0, config.limit || 50);
}
```

#### CPC Classification Search

```typescript
// lib/patent/classification.ts
interface CPCClass {
  code: string;
  title: string;
  definition: string;
  parentCode?: string;
  children?: CPCClass[];
}

const cpcHierarchy: Record<string, CPCClass> = {
  'G06F': {
    code: 'G06F',
    title: 'Electric Digital Data Processing',
    definition: 'Computing; calculating; counting',
    children: [
      { code: 'G06F3', title: 'Input/Output', definition: 'Input arrangements for transferring data' },
      { code: 'G06F21', title: 'Security', definition: 'Security arrangements for protecting computers' },
    ],
  },
  'H04L': {
    code: 'H04L',
    title: 'Transmission of Digital Information',
    definition: 'Arrangements for transmission of digital information',
    children: [
      { code: 'H04L9', title: 'Cryptographic', definition: 'Cryptographic mechanisms or protocols' },
      { code: 'H04L67', title: 'Network', definition: 'Network arrangements, protocols or services' },
    ],
  },
};

function findRelevantCPCCodes(description: string): string[] {
  const keywords: Record<string, string[]> = {
    'G06F21': ['security', 'authentication', 'encryption', 'access control'],
    'G06F3': ['user interface', 'input', 'display', 'touch'],
    'H04L9': ['cryptography', 'blockchain', 'encryption', 'key exchange'],
    'H04L67': ['network', 'server', 'client', 'protocol', 'api'],
  };

  const matches: string[] = [];
  const lowerDesc = description.toLowerCase();

  for (const [code, terms] of Object.entries(keywords)) {
    if (terms.some((term) => lowerDesc.includes(term))) {
      matches.push(code);
    }
  }

  return matches;
}
```

### 2. Prior Art Analysis

#### Prior Art Search Workflow

```typescript
// lib/patent/prior-art.ts
interface PriorArtSearch {
  invention: {
    title: string;
    description: string;
    claims: string[];
    filingDate: string;
  };
  results: PriorArtResult[];
  analysis: PriorArtAnalysis;
}

interface PriorArtResult {
  source: 'patent' | 'publication' | 'product' | 'website';
  reference: string;
  title: string;
  date: string;
  relevance: 'high' | 'medium' | 'low';
  matchingElements: string[];
  summary: string;
}

interface PriorArtAnalysis {
  noveltyRisk: 'high' | 'medium' | 'low';
  obviousnessRisk: 'high' | 'medium' | 'low';
  recommendations: string[];
  gaps: string[];
}

async function conductPriorArtSearch(
  invention: PriorArtSearch['invention']
): Promise<PriorArtSearch> {
  // Search patents
  const patentResults = await searchPatents({
    query: invention.title + ' ' + invention.description.substring(0, 500),
    databases: ['google_patents', 'uspto'],
    filters: {
      dateRange: { from: '1990-01-01', to: invention.filingDate },
    },
    limit: 50,
  });

  // Search academic publications
  const academicResults = await searchAcademicPapers(invention.description);

  // Analyze relevance
  const priorArt: PriorArtResult[] = [];

  for (const patent of patentResults) {
    const relevance = await analyzeRelevance(invention, patent);
    if (relevance.score > 0.3) {
      priorArt.push({
        source: 'patent',
        reference: patent.id,
        title: patent.title,
        date: patent.filingDate,
        relevance: relevance.score > 0.7 ? 'high' : relevance.score > 0.5 ? 'medium' : 'low',
        matchingElements: relevance.matchingElements,
        summary: patent.abstract,
      });
    }
  }

  // Generate analysis
  const analysis = generatePriorArtAnalysis(priorArt, invention);

  return {
    invention,
    results: priorArt.sort((a, b) =>
      a.relevance === 'high' ? -1 : b.relevance === 'high' ? 1 : 0
    ),
    analysis,
  };
}

async function analyzeRelevance(
  invention: PriorArtSearch['invention'],
  reference: Patent
): Promise<{ score: number; matchingElements: string[] }> {
  // Use AI to compare invention claims with reference
  const prompt = `
    Compare the following invention claims with the prior art reference:

    Invention Claims:
    ${invention.claims.map((c, i) => `${i + 1}. ${c}`).join('\n')}

    Prior Art:
    Title: ${reference.title}
    Abstract: ${reference.abstract}
    Claims: ${reference.claims.slice(0, 3).join('\n')}

    Identify:
    1. Which invention claim elements are disclosed in the prior art?
    2. What is the overall similarity score (0-1)?

    Return as JSON: { "score": number, "matchingElements": string[] }
  `;

  const response = await callAI(prompt);
  return JSON.parse(response);
}

function generatePriorArtAnalysis(
  priorArt: PriorArtResult[],
  invention: PriorArtSearch['invention']
): PriorArtAnalysis {
  const highRelevance = priorArt.filter((p) => p.relevance === 'high');
  const allMatchingElements = [...new Set(priorArt.flatMap((p) => p.matchingElements))];

  const noveltyRisk =
    highRelevance.length > 3 ? 'high' :
    highRelevance.length > 0 ? 'medium' : 'low';

  const recommendations: string[] = [];

  if (noveltyRisk === 'high') {
    recommendations.push('Consider narrowing claims to distinguish from prior art');
    recommendations.push('Focus on unique technical features not found in prior art');
  }

  if (noveltyRisk === 'medium') {
    recommendations.push('Strengthen claims by adding specific technical details');
    recommendations.push('Consider dependent claims for additional protection');
  }

  // Identify claim elements NOT found in prior art
  const gaps = invention.claims.filter(
    (claim) => !allMatchingElements.some((el) =>
      claim.toLowerCase().includes(el.toLowerCase())
    )
  );

  return {
    noveltyRisk,
    obviousnessRisk: highRelevance.length > 5 ? 'high' : noveltyRisk,
    recommendations,
    gaps,
  };
}
```

### 3. Claim Analysis

#### Claim Parsing

```typescript
// lib/patent/claims.ts
interface ParsedClaim {
  number: number;
  type: 'independent' | 'dependent';
  dependsOn?: number;
  preamble: string;
  transitionPhrase: string;
  body: string[];
  elements: ClaimElement[];
}

interface ClaimElement {
  id: string;
  text: string;
  type: 'structural' | 'functional' | 'method_step';
  dependencies: string[];
}

function parseClaims(claimsText: string): ParsedClaim[] {
  const claims: ParsedClaim[] = [];
  const claimPattern = /(\d+)\.\s*(.+?)(?=\d+\.|$)/gs;

  let match;
  while ((match = claimPattern.exec(claimsText)) !== null) {
    const [, number, text] = match;
    const claim = parseClaimText(parseInt(number), text.trim());
    claims.push(claim);
  }

  return claims;
}

function parseClaimText(number: number, text: string): ParsedClaim {
  // Check if dependent
  const dependentMatch = text.match(/^(?:The|A)\s+\w+\s+(?:of|according to)\s+claim\s+(\d+)/i);
  const type = dependentMatch ? 'dependent' : 'independent';
  const dependsOn = dependentMatch ? parseInt(dependentMatch[1]) : undefined;

  // Find transition phrase
  const transitions = ['comprising:', 'consisting of:', 'consisting essentially of:', 'wherein:'];
  let transitionPhrase = 'comprising:';
  let transitionIndex = text.length;

  for (const transition of transitions) {
    const idx = text.toLowerCase().indexOf(transition);
    if (idx !== -1 && idx < transitionIndex) {
      transitionIndex = idx;
      transitionPhrase = transition;
    }
  }

  const preamble = text.substring(0, transitionIndex).trim();
  const bodyText = text.substring(transitionIndex + transitionPhrase.length).trim();

  // Split body into elements
  const body = bodyText
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Parse elements
  const elements = body.map((el, i) => ({
    id: `${number}.${i + 1}`,
    text: el,
    type: determineElementType(el),
    dependencies: findElementDependencies(el, body),
  }));

  return {
    number,
    type,
    dependsOn,
    preamble,
    transitionPhrase,
    body,
    elements,
  };
}

function determineElementType(element: string): ClaimElement['type'] {
  const functionalIndicators = ['configured to', 'adapted to', 'operable to', 'for'];
  const methodIndicators = ['step of', 'receiving', 'sending', 'processing', 'determining'];

  if (methodIndicators.some((ind) => element.toLowerCase().includes(ind))) {
    return 'method_step';
  }
  if (functionalIndicators.some((ind) => element.toLowerCase().includes(ind))) {
    return 'functional';
  }
  return 'structural';
}

function findElementDependencies(element: string, allElements: string[]): string[] {
  const refs: string[] = [];
  const refPattern = /(?:the|said)\s+(\w+(?:\s+\w+)?)/gi;

  let match;
  while ((match = refPattern.exec(element)) !== null) {
    const term = match[1].toLowerCase();
    allElements.forEach((el, i) => {
      if (el.toLowerCase().includes(term) && !refs.includes(`${i + 1}`)) {
        refs.push(`${i + 1}`);
      }
    });
  }

  return refs;
}
```

#### Claim Comparison

```typescript
// lib/patent/claim-comparison.ts
interface ClaimComparison {
  patentA: string;
  patentB: string;
  elementMapping: ElementMapping[];
  overlapScore: number;
  analysis: string;
}

interface ElementMapping {
  elementA: string;
  elementB: string | null;
  similarity: number;
  notes: string;
}

async function compareClaims(
  claimsA: ParsedClaim[],
  claimsB: ParsedClaim[]
): Promise<ClaimComparison> {
  const elementMapping: ElementMapping[] = [];

  // Compare independent claims
  const independentA = claimsA.filter((c) => c.type === 'independent');
  const independentB = claimsB.filter((c) => c.type === 'independent');

  for (const claimA of independentA) {
    for (const elementA of claimA.elements) {
      let bestMatch: ElementMapping = {
        elementA: elementA.text,
        elementB: null,
        similarity: 0,
        notes: 'No matching element found',
      };

      for (const claimB of independentB) {
        for (const elementB of claimB.elements) {
          const similarity = await calculateSimilarity(elementA.text, elementB.text);
          if (similarity > bestMatch.similarity) {
            bestMatch = {
              elementA: elementA.text,
              elementB: elementB.text,
              similarity,
              notes: similarity > 0.8 ? 'Strong match' : similarity > 0.5 ? 'Partial match' : 'Weak match',
            };
          }
        }
      }

      elementMapping.push(bestMatch);
    }
  }

  const overlapScore =
    elementMapping.reduce((sum, m) => sum + m.similarity, 0) / elementMapping.length;

  return {
    patentA: claimsA[0]?.preamble || '',
    patentB: claimsB[0]?.preamble || '',
    elementMapping,
    overlapScore,
    analysis: generateComparisonAnalysis(elementMapping, overlapScore),
  };
}

function generateComparisonAnalysis(
  mapping: ElementMapping[],
  overlapScore: number
): string {
  const strongMatches = mapping.filter((m) => m.similarity > 0.8).length;
  const noMatches = mapping.filter((m) => m.elementB === null).length;

  if (overlapScore > 0.7) {
    return `High overlap detected (${(overlapScore * 100).toFixed(1)}%). ${strongMatches} elements have strong matches. Potential infringement concerns.`;
  }
  if (overlapScore > 0.4) {
    return `Moderate overlap (${(overlapScore * 100).toFixed(1)}%). Some claim elements overlap but ${noMatches} are unique. Further analysis recommended.`;
  }
  return `Low overlap (${(overlapScore * 100).toFixed(1)}%). Claims appear to cover different technical solutions.`;
}
```

### 4. IP Landscape Mapping

#### Build IP Landscape

```typescript
// lib/patent/landscape.ts
interface IPLandscape {
  technology: string;
  dateRange: { from: string; to: string };
  totalPatents: number;
  topAssignees: Array<{ name: string; count: number; share: number }>;
  technologyAreas: Array<{ area: string; count: number; trend: 'growing' | 'stable' | 'declining' }>;
  timeline: Array<{ year: number; filings: number }>;
  geographicDistribution: Array<{ country: string; count: number }>;
  keyPatents: Patent[];
  whitespace: string[];
}

async function buildIPLandscape(
  technology: string,
  dateRange: { from: string; to: string }
): Promise<IPLandscape> {
  // Search all relevant patents
  const patents = await searchPatents({
    query: technology,
    databases: ['google_patents', 'uspto'],
    filters: { dateRange },
    limit: 500,
  });

  // Analyze assignees
  const assigneeCounts = new Map<string, number>();
  patents.forEach((p) => {
    const assignee = p.assignee || 'Unknown';
    assigneeCounts.set(assignee, (assigneeCounts.get(assignee) || 0) + 1);
  });

  const topAssignees = Array.from(assigneeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      count,
      share: (count / patents.length) * 100,
    }));

  // Analyze technology areas by CPC
  const cpcCounts = new Map<string, number>();
  patents.forEach((p) => {
    p.cpcCodes.forEach((code) => {
      const mainClass = code.substring(0, 4);
      cpcCounts.set(mainClass, (cpcCounts.get(mainClass) || 0) + 1);
    });
  });

  // Build timeline
  const yearCounts = new Map<number, number>();
  patents.forEach((p) => {
    const year = new Date(p.filingDate).getFullYear();
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
  });

  const timeline = Array.from(yearCounts.entries())
    .map(([year, filings]) => ({ year, filings }))
    .sort((a, b) => a.year - b.year);

  // Geographic distribution
  const countryCounts = new Map<string, number>();
  patents.forEach((p) => {
    countryCounts.set(p.jurisdiction, (countryCounts.get(p.jurisdiction) || 0) + 1);
  });

  // Identify key patents (high citations)
  const keyPatents = patents
    .filter((p) => p.citations.forward > 10)
    .sort((a, b) => b.citations.forward - a.citations.forward)
    .slice(0, 10);

  // Identify whitespace
  const whitespace = await identifyWhitespace(patents, technology);

  return {
    technology,
    dateRange,
    totalPatents: patents.length,
    topAssignees,
    technologyAreas: Array.from(cpcCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([area, count]) => ({
        area,
        count,
        trend: determineTrend(area, patents),
      })),
    timeline,
    geographicDistribution: Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
    keyPatents,
    whitespace,
  };
}

async function identifyWhitespace(patents: Patent[], technology: string): Promise<string[]> {
  const prompt = `
    Analyze this patent landscape for "${technology}":

    Top CPC codes: ${[...new Set(patents.flatMap((p) => p.cpcCodes))].slice(0, 20).join(', ')}
    Total patents: ${patents.length}
    Sample titles: ${patents.slice(0, 10).map((p) => p.title).join('; ')}

    Identify 3-5 potential whitespace opportunities - technical areas that are underexplored
    but have commercial potential in this technology space.

    Return as JSON array of strings.
  `;

  const response = await callAI(prompt);
  return JSON.parse(response);
}

function determineTrend(cpcCode: string, patents: Patent[]): 'growing' | 'stable' | 'declining' {
  const currentYear = new Date().getFullYear();
  const recentPatents = patents.filter(
    (p) => new Date(p.filingDate).getFullYear() >= currentYear - 2 &&
           p.cpcCodes.includes(cpcCode)
  ).length;
  const olderPatents = patents.filter(
    (p) => new Date(p.filingDate).getFullYear() < currentYear - 2 &&
           p.cpcCodes.includes(cpcCode)
  ).length;

  const ratio = recentPatents / (olderPatents || 1);
  return ratio > 1.5 ? 'growing' : ratio < 0.5 ? 'declining' : 'stable';
}
```

## Real-World Examples

### Example 1: Freedom to Operate Analysis

```typescript
// app/api/patent/fto/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchPatents, parseClaims, compareClaims } from '@/lib/patent';

export async function POST(request: NextRequest) {
  const { product, targetMarkets } = await request.json();

  // Search for relevant patents
  const patents = await searchPatents({
    query: product.description,
    databases: ['google_patents', 'uspto'],
    filters: {
      status: 'granted',
      jurisdictions: targetMarkets,
    },
    limit: 100,
  });

  // Analyze each patent
  const risks = await Promise.all(
    patents.slice(0, 20).map(async (patent) => {
      const claims = parseClaims(patent.claims.join('\n'));
      const comparison = await compareClaims(
        [{ ...product.claims, elements: product.features }],
        claims
      );

      return {
        patent: patent.id,
        title: patent.title,
        assignee: patent.assignee,
        overlapScore: comparison.overlapScore,
        riskLevel: comparison.overlapScore > 0.7 ? 'high' :
                   comparison.overlapScore > 0.4 ? 'medium' : 'low',
        analysis: comparison.analysis,
      };
    })
  );

  return NextResponse.json({
    product: product.name,
    patentsAnalyzed: risks.length,
    highRiskPatents: risks.filter((r) => r.riskLevel === 'high'),
    mediumRiskPatents: risks.filter((r) => r.riskLevel === 'medium'),
    recommendations: generateFTORecommendations(risks),
  });
}
```

### Example 2: Competitive Intelligence Report

```typescript
// lib/patent/competitive-intel.ts
async function generateCompetitiveReport(
  yourCompany: string,
  competitors: string[],
  technology: string
) {
  // Build landscape for each company
  const landscapes = await Promise.all([
    buildCompanyPatentProfile(yourCompany, technology),
    ...competitors.map((c) => buildCompanyPatentProfile(c, technology)),
  ]);

  return {
    summary: {
      yourPosition: landscapes[0],
      competitorAnalysis: landscapes.slice(1),
    },
    strengthsWeaknesses: analyzeStrengthsWeaknesses(landscapes),
    opportunities: identifyOpportunities(landscapes),
    threats: identifyThreats(landscapes[0], landscapes.slice(1)),
  };
}
```

## Related Skills

- **academic-researcher** - Technical paper research
- **web-search** - Market research
- **content-writer** - Patent documentation
- **legal-research** - IP law analysis

## Further Reading

- [USPTO PatentsView API](https://patentsview.org/apis/api-endpoints)
- [EPO Open Patent Services](https://www.epo.org/searching-for-patents/data/web-services/ops.html)
- [WIPO Patent Scope](https://patentscope.wipo.int/search/en/search.jsf)
- [Google Patents](https://patents.google.com/)

---

*This skill is part of OPUS 67 v5.1 - "The Precision Update"*
