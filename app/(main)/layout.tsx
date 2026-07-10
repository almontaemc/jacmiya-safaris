import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <Navbar />
      <main className="flex-1 pt-36">{children}</main>
      <Footer />
    </CurrencyProvider>
  );
}
