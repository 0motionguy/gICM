import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System | gICM",
  description: "Internal design system showcase for gICM",
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
