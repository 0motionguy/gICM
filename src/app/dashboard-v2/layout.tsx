import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard v2 | ClawdBot",
  description: "Internal dashboard for ClawdBot marketplace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
