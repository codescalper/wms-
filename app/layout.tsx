import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import NextTopLoader from 'nextjs-toploader';
import { Toaster as Sooner } from "@/components/ui/sonner"
import CommandPalette from "@/components/features/searchModules";
import IdleTimerWrapper from '@/utills/IdleTimerWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WMS",
  description: "Wms Bartech Pvt.Ltd",
  manifest:'/manifest.json',
  icons:'/icon.ico'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
      <NextTopLoader color="blue" />
      <IdleTimerWrapper timeout={10 * 60 * 1000}> {/* 10 minutes */}
      <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
        {children}
        <CommandPalette />
        <Sooner />
        <Toaster />

        </ThemeProvider>
        </IdleTimerWrapper>
        </body>
    </html>
  );
}
