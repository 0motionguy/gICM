import { MetadataRoute } from "next";
import { REGISTRY } from "@/lib/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gicm.app";

  // Static pages with SEO-optimized priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/build`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/opus67`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides/vibe-coding`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/workflow`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/stack`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic item pages with priority based on popularity/installs
  const itemPages: MetadataRoute.Sitemap = REGISTRY.map((item) => {
    // Higher priority for items with more installs
    let priority = 0.6;
    if (item.installs && item.installs > 1000) {
      priority = 0.8;
    } else if (item.installs && item.installs > 500) {
      priority = 0.7;
    }

    return {
      url: `${baseUrl}/items/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    };
  });

  return [...staticPages, ...itemPages];
}
