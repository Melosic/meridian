'use client';

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/store';

export default function LanguageManager({ children }: { children: React.ReactNode }) {
  const language = useLanguageStore((s) => s.language);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    }
  }, [language, mounted]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
