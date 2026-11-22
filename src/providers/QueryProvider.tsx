"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [qeuryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // ۵ دقیقه کش تازه برای کاهش فشار به API
            gcTime: 1000 * 60 * 30, // ۳۰ دقیقه نگهداری در حافظه
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={qeuryClient}>{children}</QueryClientProvider>;
}
