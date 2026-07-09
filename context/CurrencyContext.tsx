"use client";

import { createContext, useContext, useState } from "react";

export type Currency = "KSH" | "USD";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "KSH",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("KSH");
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function formatPrice(ksh: number, usd: number, currency: Currency): string {
  if (currency === "KSH") {
    return `KSH ${ksh.toLocaleString()}`;
  }
  return `USD ${usd.toLocaleString()}`;
}
