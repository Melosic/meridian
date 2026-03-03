import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { AppProvider } from '@/components/AppProvider';
import { Analytics } from "@vercel/analytics/next";
import LanguageManager from '@/components/LanguageManager';

export const metadata: Metadata = {
    title: "Meridian",
    description: "Lightweight profit bookkeeping app for second-hand sellers",
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
            <LanguageManager>{children}</LanguageManager>
        </AppProvider>
        <Analytics />
        </body>
        </html>
    );
}