import type { Metadata } from "next";
import { Archivo_Black, DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400" });

const siteName = "Cuadra";
const title = "Cuadra — Crea cuadrantes de trabajo gratis";
const description = "Crea cuadrantes de trabajo por turnos u horarios, personalízalos con tu empresa y descárgalos en PDF. Gratis, sin registro y desde cualquier dispositivo.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cuadra.leo-dev.es"),
  applicationName: siteName,
  title,
  description,
  keywords: ["cuadrantes de trabajo", "turnos de trabajo", "horarios de empleados", "generador de cuadrantes", "cuadrante PDF"],
  authors: [{ name: "Leandro Canela", url: "https://github.com/Leocanela279" }],
  creator: "Leandro Canela",
  publisher: siteName,
  category: "productivity",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName,
    images: [{
      url: "/og-share-v2.jpg",
      secureUrl: "https://cuadra.leo-dev.es/og-share-v2.jpg",
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: "Cuadra: cuadrantes claros, sin cuentas y gratis",
    }],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: "/og-share-v2.jpg", alt: "Cuadra: cuadrantes claros, sin cuentas y gratis" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
