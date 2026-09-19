import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { Navbar } from "@/components/layout/navbar";
import { MobileDock } from "@/components/layout/mobile-dock";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import "./globals.css";

// Inter is vendored through @fontsource and loaded with next/font, so the type
// is self-hosted, preloaded and never requested from a font CDN.
const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Aayushman Chandra — software, interfaces, products",
    template: "%s — Aayushman Chandra",
  },
  description:
    "Software, interfaces and products by Aayushman Chandra — with SkibidiSpin, Berty and Totem.components built in and running on this site.",
  applicationName: "Aayushman Chandra",
  authors: [{ name: "Aayushman Chandra" }],
  openGraph: {
    type: "website",
    title: "Aayushman Chandra",
    description:
      "Software, interfaces and products — plus SkibidiSpin, Berty and Totem.components, built in.",
    siteName: "Aayushman Chandra",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFDEE" },
    { media: "(prefers-color-scheme: dark)", color: "#081D3B" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Decides the theme before first paint: no light-mode flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-[15px] text-foreground antialiased sm:text-base">
        <ThemeProvider>
          <SmoothScroll />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
          >
            Skip to content
          </a>
          <Navbar />
          {/* The skip link needs a focusable target, hence tabIndex={-1}. */}
          <div id="main" tabIndex={-1}>
            {children}
          </div>
          <MobileDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
