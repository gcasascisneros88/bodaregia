import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bodaregia.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'BodaRegia — Proveedores de bodas en Monterrey, NL',
    template: '%s | BodaRegia',
  },
  description: 'El ranking más honesto de proveedores nupciales de Nuevo León. Fotógrafos, salones, floristas y más.',
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: BASE_URL,
    siteName: 'BodaRegia',
    title: 'BodaRegia — Proveedores de bodas en Monterrey, NL',
    description: 'El ranking más honesto de proveedores nupciales de Nuevo León. Fotógrafos, salones, floristas y más.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BodaRegia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BodaRegia — Proveedores de bodas en Monterrey, NL',
    description: 'El ranking más honesto de proveedores nupciales de Nuevo León.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'GtxPfY1UoopLoj5j15D0mBJ_UICJWM-njvSSvqRueXo',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${outfit.variable}`}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
