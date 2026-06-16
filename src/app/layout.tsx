import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hammadbatteries.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hammad Batteries",
    template: "%s | Hammad Batteries",
  },
  description: "Premium mobile batteries for Samsung, Apple, and more. Auto-updated latest models available at Hammad Batteries.",
  keywords: [
    "Hammad Batteries",
    "mobile batteries Pakistan",
    "phone battery shop",
    "Samsung battery",
    "iPhone battery",
    "mobile accessories",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hammad Batteries",
    description: "Premium mobile batteries and accessories for Samsung, Apple, and more.",
    url: "/",
    siteName: "Hammad Batteries",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Hammad Batteries",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Hammad Batteries",
    description: "Premium mobile batteries and accessories for Samsung, Apple, and more.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function () {
      var storageKey = 'hammad-batteries-theme';
      var savedTheme = window.localStorage.getItem(storageKey);
      var theme = savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    })();
  `;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
