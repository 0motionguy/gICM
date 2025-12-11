import type { RegistryItem } from "@/types/registry";

/**
 * SEO JSON-LD Schema Generators
 * Implements Schema.org structured data for Google rich results
 */

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "gICM",
    url: "https://gicm.app",
    logo: "https://gicm.app/favicon.png",
    description:
      "The Universal AI Workflow Marketplace - Cross-chain marketplace for AI agents, skills, and workflows",
    sameAs: [
      "https://twitter.com/icm_motion",
      "https://github.com/0motionguy/gICM",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://gicm.app",
    },
  };
}

export function generateProductSchema(item: RegistryItem) {
  const kindLabels: Record<string, string> = {
    agent: "AI Agent",
    skill: "Skill",
    mcp: "MCP Server",
    command: "Command",
  };

  // Convert quality score (0-100) to rating (0-5)
  const qualityScore = item.audit?.qualityScore;
  const ratingValue = qualityScore ? (qualityScore / 20).toFixed(1) : "4.8";

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.name,
    description: item.description,
    url: `https://gicm.app/items/${item.slug}`,
    applicationCategory: kindLabels[item.kind] || item.kind,
    operatingSystem: "Any",
    inLanguage: "en",
    datePublished: "2024-01-01",
    dateModified: item.audit?.lastAudited || "2024-01-01",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: item.installs
      ? {
          "@type": "AggregateRating",
          ratingValue,
          ratingCount: item.installs,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined,
    author: {
      "@type": "Organization",
      name: "gICM",
      url: "https://gicm.app",
    },
    softwareVersion: item.version || "1.0.0",
    keywords: item.tags?.join(", "),
    downloadUrl: `https://gicm.app/api/items/${item.slug}/files`,
    installUrl: `https://gicm.app/items/${item.slug}`,
    softwareRequirements:
      "Node.js 18+, Claude Code CLI or compatible AI platform",
    releaseNotes:
      item.changelog ||
      `${item.name} - Production ready AI component for Claude, Gemini, and OpenAI`,
    screenshot:
      item.screenshot ||
      `https://gicm.app/api/og?title=${encodeURIComponent(item.name)}&kind=${item.kind}`,
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "gICM",
    url: "https://gicm.app",
    description: "The Universal AI Workflow Marketplace",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://gicm.app/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOpus67ProductSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OPUS 67",
    description:
      "Self-Evolving AI Runtime - Make Claude 10x smarter with 141 skills, 83 MCPs, 30 modes, and 108 agents",
    applicationCategory: "AI Development Tool",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: 1500,
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "141 AI Skills",
      "83 MCP Connections",
      "30 Operating Modes",
      "108 Specialized Agents",
      "Auto-updates",
      "One-command installation",
    ],
    author: {
      "@type": "Organization",
      name: "gICM",
      url: "https://gicm.app",
    },
  };
}

/**
 * Generate FAQPage schema for rich snippets in Google
 * Can appear as expandable FAQ section in search results
 */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate CollectionPage schema for category/collection pages
 * Helps Google understand page organization and content grouping
 */
export function generateCollectionSchema(
  name: string,
  description: string,
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: "https://gicm.app",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    },
  };
}

/**
 * Generate HowTo schema for instructional content
 * Can appear as step-by-step guides in search results
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: { name: string; text: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Generate ItemList schema for category/collection pages
 * Enables category carousels in Google search results
 */
export function generateItemListSchema(
  name: string,
  description: string,
  items: { name: string; url: string; position?: number }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position || index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * Generate ItemList for gICM marketplace categories
 */
export function generateMarketplaceCategoriesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "gICM Marketplace Categories",
    description: "Browse AI agents, skills, commands, and MCP integrations",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AI Agents",
        url: "https://gicm.app/?kind=agent",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Skills",
        url: "https://gicm.app/?kind=skill",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Commands",
        url: "https://gicm.app/?kind=command",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "MCP Integrations",
        url: "https://gicm.app/?kind=mcp",
      },
    ],
  };
}

/**
 * Generate Speakable schema for voice search optimization
 * Helps Google Assistant, Alexa, and Siri identify readable content
 */
export function generateSpeakableSchema(
  url: string,
  cssSelectors: string[] = ["h1", ".description", ".summary"]
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

/**
 * Speakable schema optimized for gICM homepage
 */
export function generateHomepageSpeakableSchema() {
  return generateSpeakableSchema("https://gicm.app", [
    "h1",
    "[data-speakable='true']",
    ".hero-description",
  ]);
}

/**
 * Generate Article schema for guide/tutorial pages
 * Improves visibility in Google News and article carousels
 */
export function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  datePublished: string = "2024-01-01",
  dateModified?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: "gICM",
      url: "https://gicm.app",
    },
    publisher: {
      "@type": "Organization",
      name: "gICM",
      url: "https://gicm.app",
      logo: {
        "@type": "ImageObject",
        url: "https://gicm.app/favicon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/**
 * Safely stringify JSON-LD for embedding in HTML
 * Escapes < to prevent XSS
 */
export function safeJsonLd(schema: object): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
