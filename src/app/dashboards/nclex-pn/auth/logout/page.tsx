// src\app\(web)\auth\logout\page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { FiHome, FiLogIn, FiHeart } from 'react-icons/fi'
import { APP_NAME } from '@/lib/config/config'
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const TARGET_DASHBOARD = "nclex-pn";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// extract searchParams logic into a child (mirrors LoginSearchParamsHandler pattern)
function LogoutSearchParamsHandler({
  onMessage,
}: {
  onMessage: (msg: string) => void
}) {
  const searchParams = useSearchParams()
  const msg = searchParams.get('msg')

  useEffect(() => {
    if (msg) {
      onMessage(decodeURIComponent(msg))
    }
  }, [msg, onMessage])

  return null
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function WebLogoutPage() {
  const [message, setMessage] = useState('')
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();

  return (
    <main
      className={`py-16 transition-all duration-300 ease-in-out overflow-x-hidden flex flex-col items-center justify-center relative  }`}
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <Suspense fallback={null}>
        <LogoutSearchParamsHandler onMessage={setMessage} />
      </Suspense>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center">

        {/* Top image / brand strip */}
        <div className="relative w-full h-40 bg-gradient-to-br from-indigo-100 via-purple-100 to-cyan-100 flex items-center justify-center">
          <Image
            src="/web/auth/login/loginFoto.jpg"
            alt="See you soon"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <FiHeart className="absolute text-white text-4xl drop-shadow-lg animate-pulse" />
        </div>

        <div className="p-8 space-y-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
            We&apos;ll Miss You !
          </h1>

          <p className="text-sm text-gray-600">
            You&apos;ve been signed out of <span className="font-semibold text-blue-700">{APP_NAME}</span>.
            Thanks for spending time with us today — your progress is safe and waiting for you.
          </p>

          {message && (
            <div className="flex justify-center">
              <div className="max-w-sm w-full bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-xl shadow-sm text-xs">
                {message}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-indigo-600 text-indigo-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-50 hover:scale-[1.02] transition-all duration-300"
            >
              <FiHome />
              Go Home
            </Link>

            <Link
              href={`/dashboards/${TARGET_DASHBOARD}/auth/login`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300"
            >
              <FiLogIn />
              Login Again
            </Link>
          </div>

          <p className="text-[11px] text-gray-400 pt-2">
            For your security, remember to close this tab on shared or public devices.
          </p>
        </div>
      </div>
    </main>
  )
}