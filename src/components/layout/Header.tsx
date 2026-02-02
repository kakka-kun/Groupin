'use client';

import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { AnnouncementInbox } from '@/components/admin';
import { Button } from '@/components/ui';

// イニシャルアバター
function InitialAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClasses = { sm: 'w-8 h-8 text-xs', lg: 'w-12 h-12 text-base' };
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-medium`}>
            {initial}
        </div>
    );
}

interface HeaderProps {
    showBackButton?: boolean;
    title?: string;
}

export function Header({ showBackButton, title }: HeaderProps) {
    const {
        currentProfile,
        isDarkMode,
        toggleDarkMode,
        isSidebarOpen,
        toggleSidebar,
    } = useAppStore();

    return (
        <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="
                sticky top-0 z-30
                flex items-center justify-between
                h-16 px-6
                bg-[var(--color-bg-card)]/80 backdrop-blur-xl
                border-b border-[var(--color-bg-tertiary)]
            "
        >
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="lg:hidden"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>

                {showBackButton ? (
                    <Link
                        href="/app"
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        ← 戻る
                    </Link>
                ) : (
                    <Link href="/app" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Groupin
                        </span>
                    </Link>
                )}

                {title && (
                    <h1 className="text-lg font-medium text-[var(--color-text-primary)] hidden sm:block">
                        {title}
                    </h1>
                )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Announcement Bell */}
                <AnnouncementInbox />

                {/* Dark Mode Toggle */}
                <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </Button>

                {/* User Avatar */}
                {currentProfile && (
                    <div className="flex items-center gap-3 ml-2">
                        {currentProfile.avatar_url ? (
                            <img src={currentProfile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <InitialAvatar name={currentProfile.display_name} />
                        )}
                        <span className="text-sm font-medium text-[var(--color-text-primary)] hidden sm:block">
                            {currentProfile.display_name}
                        </span>
                    </div>
                )}
            </div>
        </motion.header>
    );
}

interface SidebarProps {
    children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    const { isSidebarOpen, currentOrganization } = useAppStore();

    return (
        <>
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : -280 }}
                className="
                    fixed lg:static inset-y-0 left-0
                    w-72 z-30
                    bg-[var(--color-bg-card)]
                    border-r border-[var(--color-bg-tertiary)]
                    flex flex-col
                    pt-16 lg:pt-0
                "
            >
                {currentOrganization && (
                    <div className="p-4 border-b border-[var(--color-bg-tertiary)]">
                        <div className="flex items-center gap-3">
                            {currentOrganization.icon_url ? (
                                <img src={currentOrganization.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                                <InitialAvatar name={currentOrganization.name} size="lg" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-[var(--color-text-primary)] truncate">
                                    {currentOrganization.name}
                                </h2>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>
            </motion.aside>
        </>
    );
}
