import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <div className="border-border-subtle bg-surface text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-primary mb-2 text-4xl font-extrabold">۴۰۴</h1>
      <p className="text-text-secondary mb-6 text-sm">
        صفحه‌ای که دنبالش هستید پیدا نشد یا آدرس آن تغییر کرده است.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="primary">بازگشت به خانه</Button>
        </Link>
        <Link href="/explore">
          <Button variant="secondary">اکسپلور انیمه</Button>
        </Link>
      </div>
    </main>
  );
}
