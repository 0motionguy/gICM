import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflow Analytics | ClawdBot",
  description: "Internal workflow analytics for ClawdBot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkflowAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
