import type { Metadata } from "next";
import { generateFAQSchema, safeJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "AI Developer Leaderboard | ClawdBot - Top Contributors & Badges",
  description:
    "See the top AI workflow creators and contributors on ClawdBot. Earn badges, climb the rankings, and get recognized for your AI development contributions to the community.",
  keywords: [
    "AI leaderboard",
    "developer rankings",
    "AI contributors",
    "achievement badges",
    "ClawdBot community",
    "AI workflow creators",
    "builder leaderboard",
    "developer gamification",
  ],
  openGraph: {
    title: "AI Developer Leaderboard | ClawdBot",
    description:
      "Top contributors in the AI workflow community. Climb the rankings and earn badges.",
    url: "https://clawdbot.com/leaderboard",
    siteName: "ClawdBot",
    type: "website",
    images: [
      {
        url: "/api/og?title=Leaderboard&kind=tool",
        width: 1200,
        height: 630,
        alt: "ClawdBot Leaderboard - Top AI Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Developer Leaderboard | ClawdBot",
    description: "Top contributors in the AI workflow community",
    creator: "@icm_motion",
    images: ["/api/og?title=Leaderboard&kind=tool"],
  },
  alternates: {
    canonical: "https://clawdbot.com/leaderboard",
  },
};

const LEADERBOARD_FAQS = [
  {
    question: "What is the ClawdBot Leaderboard?",
    answer:
      "The ClawdBot Leaderboard ranks AI workflow creators and contributors based on their contributions to the community. It showcases top builders who create agents, skills, MCP servers, and commands. Rankings are based on install counts, usage frequency, and community engagement.",
  },
  {
    question: "How are rankings calculated?",
    answer:
      "Rankings are calculated based on multiple factors including install counts, usage frequency, user ratings, and community contributions. The leaderboard updates in real-time to reflect current metrics and activity.",
  },
  {
    question: "What badges can I earn on ClawdBot?",
    answer:
      "ClawdBot offers various achievement badges for contributors, including badges for first contributions, popular items, community engagement, and reaching install milestones. Each badge recognizes a specific achievement in the AI workflow ecosystem.",
  },
  {
    question: "How do I climb the leaderboard rankings?",
    answer:
      "To climb the rankings, contribute high-quality AI agents, skills, MCP servers, or commands to ClawdBot. Focus on creating useful tools that solve real problems. Engage with the community, maintain your contributions, and encourage users to install and rate your items.",
  },
  {
    question: "Is the leaderboard updated in real-time?",
    answer:
      "Yes, the ClawdBot leaderboard updates continuously based on live usage metrics, installs, and community activity. Your ranking reflects your current standing in the community.",
  },
];

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqSchema = generateFAQSchema(LEADERBOARD_FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
      {children}
    </>
  );
}
