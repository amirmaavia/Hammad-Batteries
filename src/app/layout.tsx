import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hammad Batteries | Professional Mobile Battery Shop",
  description: "Premium mobile batteries for Samsung, Apple, and more. Auto-updated latest models available at Hammad Batteries.",
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
        {children}
      </body>
    </html>
  );
}
