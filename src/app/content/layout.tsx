import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Creator | gICM",
  description: "Internal content creation tool for gICM",
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
