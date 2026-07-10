import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <Navbar />
      <main className="flex-1 pt-28">{children}</main>
      <Footer />
    </CurrencyProvider>
  );
}
