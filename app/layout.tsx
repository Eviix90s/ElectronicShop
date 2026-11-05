import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartToast } from "@/components/cart/cart-toast";
import { ElectricChat } from "@/components/chat/electric-chat";
import { GridPulse } from "@/components/ui/grid-pulse";
import { site } from "@/lib/data";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: site.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f2",
  colorScheme: "light",
  // Permite usar las zonas seguras (notch y barra inferior) en iOS y Android.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${instrument.variable} ${jetbrains.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* Malla de fondo de toda la página: fija al viewport, debajo del contenido. */}
        <GridPulse attach="viewport" />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartToast />
        <ElectricChat />
      </body>
    </html>
  );
}
