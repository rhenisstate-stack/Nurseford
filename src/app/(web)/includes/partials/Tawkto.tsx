'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export default function Tawkto() {
  useEffect(() => {
    if (document.getElementById('tawkto-script')) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    s1.id = 'tawkto-script';
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68da4de8438b6919521c9f99/default';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
  }, []);

  return null;
}