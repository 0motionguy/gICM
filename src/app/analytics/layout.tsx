import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Dashboard | ClawdBot",
  description: "Internal analytics dashboard for ClawdBot marketplace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
