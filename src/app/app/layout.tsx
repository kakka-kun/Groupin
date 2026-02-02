'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Moon, Sun, LogOut, Hash, Settings, Plus, Users, Menu, X, Shield, AlertTriangle } from 'lucide-react';
import { useAppStore, useCurrentOrgChatRooms, useProfilesForOrg } from '@/lib/store';
import { AnnouncementInbox } from '@/components/admin';
import { Button, Input } from '@/components/ui';
import { mockOrganizations } from '@/lib/mockData';
import { CATEGORY_LABELS } from '@/types';
import Cookies from 'js-cookie';

// イニシャルアバター
function InitialAvatar({ name, size = 'md', className = '' }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl',
    };

    // 名前からハッシュで色を生成
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-medium ${className}`}>
            {initial}
        </div>
    );
}

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const {
        isAuthenticated,
        currentUserId,
        isSystemAdmin,
        isObserverMode,
        exitObserverMode,
        currentOrganization,
        currentProfile,
        isDarkMode,
        isSidebarOpen,
        toggleDarkMode,
        toggleSidebar,
        setCurrentOrganization,
        setCurrentChatRoom,
        addChatRoom,
        logout,
        deleteOrganization,
    } = useAppStore();
    const chatRooms = useCurrentOrgChatRooms();
    const orgProfiles = useProfilesForOrg(currentOrganization?.id || '');

    // Channel creation state
    const [showNewChannelForm, setShowNewChannelForm] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);

    // Extract slug from pathname
    const pathParts = pathname.split('/');
    const currentSlug = pathParts[2]; // /app/[slug]/...


    // Set current organization based on URL slug
    useEffect(() => {
        if (currentSlug && currentSlug !== 'settings') {
            const org = mockOrganizations.find((o) => o.slug === currentSlug);
            if (org && (!currentOrganization || currentOrganization.slug !== currentSlug)) {
                setCurrentOrganization(org);
            }
        }
    }, [currentSlug, currentOrganization, setCurrentOrganization]);

    const handleLogout = () => {
        logout();
        Cookies.remove('groupin_session');
        router.push('/');
    };

    const handleChatClick = (chatId: string) => {
        const room = chatRooms.find((r) => r.id === chatId);
        if (room && currentOrganization) {
            setCurrentChatRoom(room);
            router.push(`/app/${currentOrganization.slug}/${chatId}`);
            // Close sidebar on mobile after navigation
            if (window.innerWidth < 768) {
                toggleSidebar();
            }
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim() || !currentOrganization) return;

        setIsCreatingChannel(true);
        await new Promise((resolve) => setTimeout(resolve, 200));

        addChatRoom({
            id: `chat-${Date.now()}`,
            org_id: currentOrganization.id,
            name: newChannelName.trim(),
            created_at: new Date(),
        });

        setNewChannelName('');
        setShowNewChannelForm(false);
        setIsCreatingChannel(false);
    };

    const showSidebarContent = currentOrganization && pathname !== '/app';

    return (
        <div className="flex h-screen bg-[var(--color-bg-primary)] overflow-hidden">
            {/* Observer Mode Banner */}
            {isObserverMode && (
                <div className="fixed top-0 left-0 right-0 h-10 bg-amber-500 text-white z-50 flex items-center justify-between px-6 shadow-md">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <Shield size={16} />
                        管理者閲覧モード（操作無効）
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20 h-7 text-xs"
                        onClick={() => {
                            exitObserverMode();
                            router.push('/admin');
                        }}
                    >
                        モード終了
                    </Button>
                </div>
            )}

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {showSidebarContent && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            {showSidebarContent && (
                <motion.aside
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: isSidebarOpen ? 0 : -288 }}
                    className={`
                        w-72 flex-shrink-0
                        bg-[var(--color-bg-card)]
                        border-r border-[var(--color-bg-tertiary)]
                        flex flex-col
                        h-screen
                        fixed md:sticky top-0 left-0 z-40
                        transform transition-transform duration-200 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}
                >
                    {/* Home Button */}
                    <div className="p-4 border-b border-[var(--color-bg-tertiary)]">
                        <Link
                            href="/app"
                            className="
                flex items-center gap-3 px-4 py-3 rounded-xl
                bg-[var(--color-accent-light)]
                text-[var(--color-accent)]
                font-medium
                hover:bg-[var(--color-accent)] hover:text-white
                transition-all duration-200
              "
                        >
                            <Home size={20} />
                            <span>ホーム</span>
                        </Link>
                    </div>

                    {/* Organization Info */}
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
                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                    {CATEGORY_LABELS[currentOrganization.category]}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Rooms */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                                    チャンネル
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewChannelForm(!showNewChannelForm)}
                                >
                                    <Plus size={14} />
                                </Button>
                            </div>

                            {/* Inline Channel Creation Form */}
                            <AnimatePresence>
                                {showNewChannelForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]"
                                    >
                                        <input
                                            type="text"
                                            value={newChannelName}
                                            onChange={(e) => setNewChannelName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateChannel()}
                                            placeholder="チャンネル名"
                                            autoFocus
                                            className="
                                                w-full px-3 py-2 rounded-lg text-sm
                                                bg-[var(--color-bg-primary)]
                                                text-[var(--color-text-primary)]
                                                placeholder:text-[var(--color-text-muted)]
                                                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]
                                                mb-2
                                            "
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setShowNewChannelForm(false);
                                                    setNewChannelName('');
                                                }}
                                                className="flex-1 text-xs"
                                            >
                                                キャンセル
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCreateChannel}
                                                disabled={!newChannelName.trim()}
                                                isLoading={isCreatingChannel}
                                                className="flex-1 text-xs"
                                            >
                                                作成
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-1">
                                {chatRooms.map((room, index) => {
                                    const isActive = pathname.includes(room.id);
                                    return (
                                        <motion.button
                                            key={room.id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleChatClick(room.id)}
                                            className={`
                        w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left
                        transition-colors
                        ${isActive
                                                    ? 'bg-[var(--color-accent)] text-white'
                                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                                                }
                      `}
                                        >
                                            <Hash size={16} className="flex-shrink-0" />
                                            <span className="truncate">{room.name}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Members */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                                    メンバー ({orgProfiles.length})
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {orgProfiles.map((profile, index) => (
                                    <motion.div
                                        key={profile.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.03 }}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                    >
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <InitialAvatar name={profile.display_name} size="sm" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[var(--color-text-primary)] truncate">
                                                {profile.display_name}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-tertiary)]">
                                                {profile.role}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Settings Link */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => router.push(`/app/${currentOrganization.slug}/settings`)}
                        >
                            <Settings size={16} />
                            団体設定
                        </Button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] rounded-xl hover:bg-red-50 hover:text-[var(--color-error)] transition-colors"
                        >
                            <LogOut size={18} />
                            ログアウト
                        </button>

                        {/* System Admin Link (Protected) */}
                        {isSystemAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors mt-2 border-t border-[var(--color-bg-tertiary)]"
                            >
                                <Shield size={18} className="text-[var(--color-accent)]" />
                                管理者ダッシュボード
                            </Link>
                        )}
                    </div>
                </motion.aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="
            sticky top-0 z-30
            flex items-center justify-between
            h-16 px-6
            bg-[var(--color-bg-card)]/80 backdrop-blur-xl
            border-b border-[var(--color-bg-tertiary)]
          "
                >
                    <div className="flex items-center gap-4">
                        {/* Mobile hamburger menu */}
                        {showSidebarContent && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSidebar}
                                className="md:hidden"
                            >
                                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </Button>
                        )}

                        <Link href="/app" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">G</span>
                            </div>
                            <span className="text-lg font-semibold text-[var(--color-text-primary)] hidden sm:inline">
                                Groupin
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <AnnouncementInbox />

                        <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </Button>

                        {currentProfile && (
                            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[var(--color-bg-tertiary)]">
                                {currentProfile.avatar_url ? (
                                    <img src={currentProfile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <InitialAvatar name={currentProfile.display_name} size="sm" />
                                )}
                                <span className="text-sm font-medium text-[var(--color-text-primary)] hidden sm:block">
                                    {currentProfile.display_name}
                                </span>
                            </div>
                        )}

                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut size={18} />
                        </Button>
                    </div>
                </motion.header>

                {/* Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* Admin Info Panel (Right Side) */}
            {isObserverMode && currentOrganization && (
                <div className="w-80 border-l border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] p-6 pt-16 flex flex-col gap-6 overflow-y-auto hidden xl:flex">
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
                            団体情報 (管理者用)
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)]">
                                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">団体名</p>
                                <p className="font-bold text-[var(--color-text-primary)]">{currentOrganization.name}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)]">
                                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">ID</p>
                                <p className="font-mono text-xs text-[var(--color-text-primary)] break-all">{currentOrganization.id}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)]">
                                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Slug</p>
                                <p className="font-mono text-sm text-[var(--color-text-primary)]">{currentOrganization.slug}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                            <h4 className="flex items-center gap-2 font-bold text-red-700 mb-2">
                                <AlertTriangle size={16} />
                                危険な操作
                            </h4>
                            <p className="text-xs text-red-600 mb-4">
                                この団体と関連データを完全に削除します。この操作は取り消せません。
                            </p>
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white border-none"
                                onClick={() => {
                                    if (confirm('本当にこの団体を削除しますか？\n（関連するすべてのデータが削除されます）')) {
                                        deleteOrganization(currentOrganization.id);
                                        exitObserverMode();
                                        router.push('/admin');
                                    }
                                }}
                            >
                                団体を削除
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
