'use client';
import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  // You can inject shared logic here (e.g. loading guards, analytics)
  return <>{children}</>;
}
