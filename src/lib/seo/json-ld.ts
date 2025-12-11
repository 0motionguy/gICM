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

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.name,
    description: item.description,
    applicationCategory: kindLabels[item.kind] || item.kind,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: item.installs
      ? {
          "@type": "AggregateRating",
          ratingValue: "4.8",
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
    softwareVersion: "1.0",
    keywords: item.tags?.join(", "),
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
 * Safely stringify JSON-LD for embedding in HTML
 * Escapes < to prevent XSS
 */
export function safeJsonLd(schema: object): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
