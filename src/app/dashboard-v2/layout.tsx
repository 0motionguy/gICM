import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard v2 | gICM",
  description: "Internal dashboard for gICM marketplace",
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
