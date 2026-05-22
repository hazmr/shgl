import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SHGL",
  description: "Smart Hiring and Global Listings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
