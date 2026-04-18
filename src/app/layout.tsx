import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import LazyMotionProvider from "@/components/LazyMotionProvider";

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const cabinetGrotesk = localFont({
  src: "../../public/fonts/CabinetGrotesk_Complete/Fonts/WEB/fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Make it — Projektujemy obecność, która sprzedaje",
  description:
    "Make it to agencja kreatywna z Krakowa. Tworzymy strony internetowe, prowadzimy social media, robimy zdjęcia i filmy. Wszystko w jednym miejscu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${satoshi.variable} ${cabinetGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LazyMotionProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </LazyMotionProvider>
      </body>
    </html>
  );
}
