import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Dashboard | gICM",
  description: "Internal analytics dashboard for gICM marketplace",
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
