import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jacmiya Safaris & Holiday Tours | East Africa's Premier Safari Operator",
  description:
    "Discover Africa's wild heart with Jacmiya Safaris. Expert-guided wildlife adventures across Kenya, Tanzania, and Rwanda. 70+ destinations, price-match guarantee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lato.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <CurrencyProvider>
          <Navbar />
          <main className="flex-1 pt-28">{children}</main>
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
