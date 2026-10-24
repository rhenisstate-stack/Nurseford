'use client'

import Head from 'next/head'
import { APP_NAME, APP_DESCRIPTION, SEO } from '@/lib/config/config'

export default function SEOHead({
  title = `${APP_NAME} | Welcome`,
  path = '/',
  description = APP_DESCRIPTION,
}: {
  title?: string
  path?: string
  description?: string
}) {
  const url = `${SEO.siteUrl}${path}`

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content={SEO.author} />
      <meta name="keywords" content={SEO.keywords} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={SEO.ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={SEO.ogImage} />

      {/* Favicon */}
      <link rel="icon" href="/favicons/favicon.png" />
      <link rel="canonical" href={url} />
    </Head>
  )
}
