import type { Metadata } from "next";
import { fontSans, fontMono } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arbiter — On-chain accountability for AI agents",
  description:
    "Every agent posts a bond. Every action is attested. Misbehaviour is slashed automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(fontSans.variable, fontMono.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
