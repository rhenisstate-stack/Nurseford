'use client'

import { useEffect, useState } from 'react'
import React from 'react'
import { useRouter } from 'next/navigation'
import {
    FaUserGraduate,
    FaStethoscope,
    FaAward,
    FaClipboardList,
    FaBookOpen,
    FaCrown,
    FaFire,
    FaStar,
    FaBolt,
} from 'react-icons/fa'

// Badge types with label, color, and icon
const badgePool = [
    { label: 'New', color: 'bg-green-500', icon: <FaStar className="mr-1" /> },
    { label: 'Hot', color: 'bg-red-500', icon: <FaFire className="mr-1" /> },
    { label: 'Updated', color: 'bg-yellow-500', icon: <FaBolt className="mr-1" /> },
    { label: 'Popular', color: 'bg-indigo-500', icon: <FaCrown className="mr-1" /> },
]

interface DashboardCard {
    label: string
    description: string
    icon: React.ReactElement
    route: string
    badge?: {
        label: string
        color: string
        icon: React.ReactElement
    }
}

// Move this outside to avoid useEffect ESLint warning
const rawCards: DashboardCard[] = [
    {
        label: 'RN Nursing EXAMS',
        description: 'Registered Nurse core competency review and practice test bank.',
        icon: <FaStethoscope className="text-blue-400 text-3xl" />,
        route: '/dashboards/rn-nursing',
    },
    {
        label: 'LPN Nursing EXAMS',
        description: 'Licensed Practical Nurse exam simulations and practice questions.',
        icon: <FaStethoscope className="text-purple-400 text-3xl" />,
        route: '/dashboards/lpn-nursing',
    },
    {
        label: 'RN Exit EXAMS',
        description: 'ATI & HESI Comprehensive RN Exit Examination preparation.',
        icon: <FaAward className="text-rose-400 text-3xl" />,
        route: '/dashboards/rn-nursing/exams/exit-ati-exams-rn/36',
    },
    {
        label: 'LPN Exit EXAMS',
        description: 'ATI & HESI Comprehensive LPN Exit Examination simulations.',
        icon: <FaAward className="text-amber-400 text-3xl" />,
        route: '/dashboards/lpn-nursing/exams/exit-ati-exams-lpn/23',
    },
    {
        label: 'Student Dashboard',
        description: 'Manage profile, study progress, and assessment reports.',
        icon: <FaUserGraduate className="text-emerald-400 text-3xl" />,
        route: '/dashboards/rn-nursing',
    },
]

export default function DashboardsPage() {
    const router = useRouter()
    const [lastOpenedRoute, setLastOpenedRoute] = useState<string | null>(null)

    const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([])

    // Assign badges randomly
    function assignRandomBadges(cards: DashboardCard[]) {
        const maxBadges = 5
        const shuffled = [...cards].sort(() => 0.5 - Math.random()).slice(0, maxBadges)
        return cards.map((card) => {
            const matched = shuffled.find((c) => c.route === card.route)
            return {
                ...card,
                badge: matched ? badgePool[Math.floor(Math.random() * badgePool.length)] : undefined,
            }
        })
    }

    useEffect(() => {
        const updated = assignRandomBadges(rawCards)
        setDashboardCards(updated)

        const last = localStorage.getItem('lastOpenedRoute')
        if (last) setLastOpenedRoute(last)
    }, [])

    const handleCardClick = (route: string) => {
        localStorage.setItem('lastOpenedRoute', route)
        router.push(route)
    }

    return (
        <div className="min-h-screen pt-8 pb-10 px-4 md:px-10" style={{ backgroundColor: 'var(--content-bg)' }}>
            <h1 className="font-serif text-4xl font-semibold text-center text-navy mb-3">
                📚 Explore All Resources.
            </h1>

            <div className="border border-black/50 dark:border-border rounded-2xl p-6 bg-paper/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dashboardCards.map((card, index) => {
                        const isLastOpened = lastOpenedRoute === card.route

                        return (
                            <div
                                key={index}
                                onClick={() => handleCardClick(card.route)}
                                className={`relative cursor-pointer rounded-xl shadow hover:shadow-xl transition-all duration-300 p-5 border border-black/50 dark:border-border bg-paper hover:border-coral ${isLastOpened ? 'ring-2 ring-purple-500 bg-paper-dim' : ''
                                    }`}
                            >
                                {card.badge && (
                                    <span
                                        className={`absolute top-3 right-3 text-white font-bold text-xs px-2 py-1 rounded-full shadow-sm flex items-center ${card.badge.color
                                            } ${isLastOpened ? 'opacity-50' : ''}`}
                                    >
                                        {card.badge.icon}
                                        {card.badge.label}
                                    </span>
                                )}

                                {isLastOpened && (
                                    <span className="animate-pulse absolute top-3 left-3 font-bold bg-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
                                        Last Opened
                                    </span>
                                )}

                                <div className="mb-4 flex justify-center">{card.icon}</div>

                                <h2 className="font-serif text-lg font-semibold text-navy text-center mb-2">
                                    {card.label}
                                </h2>

                                <p className="text-sm text-navy/60 text-center">{card.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
