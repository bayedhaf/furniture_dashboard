
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";


export const metadata: Metadata = {
  title: {
    default: "A.W.G Wandiye Furniture | Quality Furniture in Ethiopia",
    template: "%s | A.W.G Wandiye Furniture",
  },

  description:
    "A.W.G Wandiye Furniture is a trusted furniture manufacturer and seller based in Shashemene and Negele Arsi, Oromia, Ethiopia. We provide modern home, office, and custom-made furniture.",

  applicationName: "A.W.G Wandiye Furniture App",

  keywords: [
    "A.W.G Wandiye Furniture",
    "Wandiye Furniture",
    "Furniture Ethiopia",
    "Furniture in Shashemene",
    "Furniture in Negele Arsi",
    "Oromia Furniture",
    "Ethiopian Furniture Manufacturer",
    "Office Furniture Ethiopia",
    "Home Furniture Ethiopia",
    "Custom Furniture Ethiopia",
    "Modern Furniture Ethiopia",
  ],

  authors: [{ name: "A.W.G Wandiye Furniture" }],
  creator: "A.W.G Wandiye Furniture",
  publisher: "A.W.G Wandiye Furniture",

  metadataBase: new URL("https://a-w-furniture.vercel.app/"), // update if needed

  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "om": "/om", // if you add Afaan Oromo later
    },
  },

  openGraph: {
    title: "A.W.G Wandiye Furniture",
    description:
      "High-quality furniture manufacturer based in Shashemene and Negele Arsi, Ethiopia.",
    url: "https://a-w-furniture.vercel.app/",
    siteName: "A.W.G Wandiye Furniture",
    locale: "en_ET",
    type: "website",
    images: [
      {
        url: "/og-main.jpg", // place in /public
        width: 1200,
        height: 630,
        alt: "A.W.G Wandiye Furniture Ethiopia",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "A.W.G Wandiye Furniture",
    description:
      "Quality home and office furniture made in Ethiopia.",
    images: ["/og-main.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "Furniture & Interior Design",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <Providers>
          {/* Only render children, Footer is now in page/layout components */}
          {children}
        </Providers>
      </body>
    </html>
  );
}