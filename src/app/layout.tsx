import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from '@/components/AppProvider';

export const metadata: Metadata = {
  title: "Meridian - 利润记账",
  description: "个人二手卖家轻量级利润记账应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
