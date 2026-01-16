import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const titilliumWeb = Titillium_Web({
  subsets: ["latin"],
  variable: "--font-titillium-web",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Estamos a X dias sem falar de IA",
  description:
    "Um site que conta quantos dias se passaram desde o último vídeo do Montano sobre inteligência artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${titilliumWeb.variable} antialiased`}>{children}</body>
    </html>
  );
}
