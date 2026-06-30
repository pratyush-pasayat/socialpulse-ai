import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialPulse AI",
  description: "Real-time social listening & sentiment analytics powered by AI agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}