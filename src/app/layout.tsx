import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/app/Shell";

export const metadata: Metadata = {
  title: "Chambea · Servicios para tu casa en Lima",
  description: "Marketplace de servicios del hogar en Lima. Publica lo que necesitas, recibe ofertas de trabajadores verificados y paga seguro.",
};

export const viewport: Viewport = {
  themeColor: "#f3f4f6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className="h-full antialiased">
      <body className="min-h-full">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
