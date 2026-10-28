// castoline/src/hooks/home/useHomepageData.ts
import { useState } from 'react'
import type { PageContent } from '@/lib/types/PageContent'

export function useHomepageData() {
  // Keep the state in case you want to populate it later
  const [data] = useState<PageContent | null>(null)

  // Currently, no API call since getHomepageContent was removed

  return data
}
