import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "CostGuard AI — Cloud Cost & Security Auditor",
  description:
    "Enterprise-grade cloud cost optimization and security auditing dashboard. Detect waste, fix security vulnerabilities, and optimize your infrastructure spend.",
  keywords: [
    "cloud cost optimization",
    "AWS security audit",
    "cloud security",
    "cost analysis",
    "infrastructure optimization",
  ],
  authors: [{ name: "CostGuard AI" }],
  openGraph: {
    title: "CostGuard AI",
    description: "Cloud Cost & Security Auditor Dashboard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex h-screen overflow-hidden bg-background bg-grid-pattern">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="page-enter">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
