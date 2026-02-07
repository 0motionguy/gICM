import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System | ClawdBot",
  description: "Internal design system showcase for ClawdBot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
