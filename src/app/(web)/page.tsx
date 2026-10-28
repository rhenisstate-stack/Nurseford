
'use client'

import { useHomepageData } from '@/lib/hooks/home/useHomepageData'
import HomePageContent from '@/app/(web)/pages/home/home'

export default function HomePageClient() {
  const data = useHomepageData()
  return <HomePageContent data={data} />
}
