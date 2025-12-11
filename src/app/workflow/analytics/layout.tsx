import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workflow Analytics | gICM",
  description: "Internal workflow analytics for gICM",
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
