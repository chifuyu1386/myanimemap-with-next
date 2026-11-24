import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "@fontsource-variable/inter";
import { QueryProvider } from "@/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MyAnimeMap | مرجع و واچ‌لیست شخصی انیمه",
    template: "%s | MyAnimeMap",
  },
  description:
    "پلتفرم مدرن فارسی برای کشف انیمه‌ها، مشاهده جزئیات، رتبه‌بندی و مدیریت واچ‌لیست شخصی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-canvas text-text-primary selection:bg-primary/30 selection:text-text-primary flex min-h-screen flex-col">
        <QueryProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
