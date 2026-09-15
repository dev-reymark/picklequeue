import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PICKLEQUEUE | Pickleball Court Queuing",
  description: "High-performance court timer, rotation queuing, and skill-balanced matchmaking for pickleball venues and tournaments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-dots text-slate-950 dark:text-zinc-100 antialiased selection:bg-emerald-500 selection:text-white font-sans`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
