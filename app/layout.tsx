import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelMate",
  description:
    "Plan your own trips with AI, local-style guidance, budget estimates, and real-time travel information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
