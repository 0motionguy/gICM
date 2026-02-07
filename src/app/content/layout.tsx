import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Creator | ClawdBot",
  description: "Internal content creation tool for ClawdBot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
