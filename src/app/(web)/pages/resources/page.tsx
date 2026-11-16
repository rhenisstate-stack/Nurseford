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
        description: 'Registered Nurse core competency review and practice Q-Bank.',
        icon: <FaStethoscope className="text-blue-400 text-3xl" />,
        route: '/dashboards/rn-nursing',
    },
    {
        label: 'LPN Nursing EXAMS',
        description: 'Licensed Practical Nurse exam simulations and practice tests.',
        icon: <FaStethoscope className="text-purple-400 text-3xl" />,
        route: '/dashboards/lpn-nursing',
    },
    {
        label: 'RN EXIT EXAMS',
        description: 'Comprehensive RN exit exam review and readiness prep.',
        icon: <FaAward className="text-green-400 text-3xl" />,
        route: '/dashboards/rn-nursing',
    },
    {
        label: 'LPN EXIT EXAMS',
        description: 'Comprehensive LPN exit exam review and clinical practice.',
        icon: <FaAward className="text-orange-400 text-3xl" />,
        route: '/dashboards/lpn-nursing',
    },
    {
        label: 'RN Subscriptions & Plans',
        description: 'Browse and activate RN Nursing & RN Exit Exam packages.',
        icon: <FaClipboardList className="text-rose-400 text-3xl" />,
        route: '/dashboards/rn-nursing/vista/subscriptions/items',
    },
    {
        label: 'LPN Subscriptions & Plans',
        description: 'Browse and activate LPN Nursing & LPN Exit Exam packages.',
        icon: <FaClipboardList className="text-cyan-400 text-3xl" />,
        route: '/dashboards/lpn-nursing/vista/subscriptions/items',
    },
    {
        label: 'My Progress & Coverage',
        description: 'Track completed exams, average scores, and question coverage.',
        icon: <FaUserGraduate className="text-blue-400 text-3xl" />,
        route: '/dashboards/rn-nursing/vista/stats/progress',
    },
    {
        label: 'Exam Reports',
        description: 'Review attempt status, durations, and historical exam reports.',
        icon: <FaBookOpen className="text-teal-400 text-3xl" />,
        route: '/dashboards/rn-nursing/vista/stats/reports',
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
        <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-14 px-4 sm:px-6 md:px-10" style={{ backgroundColor: 'var(--content-bg)' }}>
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                <span className="inline-block font-mono text-xs tracking-widest uppercase text-teal-600 dark:text-[#2FD9C4] font-bold mb-2">
                    Clinical Dashboards &amp; Resources
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-navy dark:text-white tracking-tight">
                    Explore All Resources
                </h1>
                <p className="mt-3 text-sm sm:text-base text-navy/65 dark:text-white/65">
                    Access your specialized RN &amp; LPN question banks, exit exams, subscription plans, and performance analytics.
                </p>
            </div>

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

                                <h2 className="font-serif text-lg font-semibold text-navy dark:text-white text-center mb-2">
                                    {card.label}
                                </h2>

                                <p className="text-sm text-navy/60 dark:text-white/60 text-center">{card.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
