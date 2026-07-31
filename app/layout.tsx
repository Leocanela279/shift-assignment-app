import type { Metadata } from "next";
import { Archivo_Black, DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cuadra.leo-dev.es"),
  title: "Cuadra — Crea cuadrantes de trabajo gratis",
  description: "Crea cuadrantes por turnos u horarios, personalízalos y descárgalos en PDF. Gratis, sin registro y con tus datos en tu dispositivo.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Cuadra — Tu equipo, bien cuadrado",
    description: "Cuadrantes claros. Sin cuentas. Gratis.",
    images: [{ url: "/og.png", width: 1536, height: 864, alt: "Cuadra, creador gratuito de cuadrantes" }],
    locale: "es_ES",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Cuadra", description: "Cuadrantes claros. Sin cuentas. Gratis.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
