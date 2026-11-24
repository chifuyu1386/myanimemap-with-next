"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="text-text-primary mb-2 text-xl font-bold">
        مشکلی در بارگذاری صفحه پیش آمد
      </h1>
      <p className="text-text-secondary mb-6 text-sm">
        ممکن است اتصال اینترنت یا سرور Kitsu موقتاً دچار اختلال شده باشد.
      </p>
      <Button variant="primary" onClick={reset}>
        تلاش مجدد
      </Button>
    </main>
  );
}
