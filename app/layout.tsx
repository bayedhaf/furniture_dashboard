import type { Metadata } from "next";
// Use local fallback fonts to avoid build-time network fetch
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = { variable: "--font-geist-sans" } as const;
const geistMono = { variable: "--font-geist-mono" } as const;

export const metadata: Metadata = {
  title: "A.W.Furniture App",
  description: "A.W.Furniture based on Ethiopia/Oromia /Shashemene and Negele Arsi city.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
