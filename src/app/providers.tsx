"use client"
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from "react";

type ProviderProps = {
    children: ReactNode;
};

export function Providers({ children }:  ProviderProps) {
  return (
    <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}