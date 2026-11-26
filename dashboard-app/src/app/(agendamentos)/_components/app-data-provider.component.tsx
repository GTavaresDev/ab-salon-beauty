"use client";

import { useAppDataProvider, type AppDataContextValue } from "../hooks/use-app-data-provider";
import { type ReactNode } from "react";
import {
  createContext,
  useContext,
} from "react";

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const {
    value,
  } = useAppDataProvider({ children });

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData deve ser usado dentro de AppDataProvider");
  }
  return context;
}
