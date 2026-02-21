import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Super Space RPG - Pixel Adventure",
  description: "A gamified pixel art RPG for managing your life aspects. Build your workspace, interact with NPCs, and level up your life!",
  keywords: ["RPG", "pixel art", "game", "dashboard", "life management", "Next.js", "TypeScript"],
  authors: [{ name: "Super Space RPG Team" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect fill='%23f4b41a' width='16' height='16'/><rect fill='%231a1c2c' x='2' y='2' width='4' height='4'/><rect fill='%231a1c2c' x='10' y='2' width='4' height='4'/><rect fill='%231a1c2c' x='4' y='10' width='8' height='4'/></svg>",
  },
  openGraph: {
    title: "Super Space RPG - Pixel Adventure",
    description: "A gamified pixel art RPG for managing your life aspects",
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
      <body className="antialiased bg-background text-foreground pixel-font">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
