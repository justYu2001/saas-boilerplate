import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { CrispChat } from "@/components/crips-chat";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "SaaS Boilerplate - Landing template",
  description: "Free SaaS Boilerplate landing page for developers",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="bg-background min-h-screen">
        <CrispChat />

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
