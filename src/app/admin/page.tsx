'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Users,
    Building2,
    MessageSquare,
    Bell,
    TrendingUp,
    AlertTriangle,
    Search,
    Plus,
    Send,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';
import { CATEGORY_LABELS } from '@/types';

// イニシャルアバター
function InitialAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClasses = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' };
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold`}>
            {initial}
        </div>
    );
}

// Stats Card Component
function StatCard({ icon: Icon, label, value, trend, color }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    trend?: string;
    color: string;
}) {
    return (
        <Card delay={0.1}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-[var(--color-text-tertiary)] mb-1">{label}</p>
                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
                        {trend && (
                            <p className="text-xs text-[var(--color-success)] mt-1 flex items-center gap-1">
                                <TrendingUp size={12} />
                                {trend}
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl ${color}`}>
                        <Icon size={24} className="text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SystemAdminPage() {
    const { organizations, profiles, messages, announcements, enterObserverMode, updateProfile } = useAppStore();
    const router = useRouter(); // To redirect on mobile

    const [searchQuery, setSearchQuery] = useState('');
    const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
    const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
    const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
    const [newAnnouncementPriority, setNewAnnouncementPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
    const [targetUsers, setTargetUsers] = useState<'all' | 'specific'>('all');

    // User Management State
    const [showUserModal, setShowUserModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [editingProfile, setEditingProfile] = useState<any | null>(null); // Type 'any' temporarily to avoid import issues if Profile not imported
    const [editDisplayName, setEditDisplayName] = useState('');

    const [isSending, setIsSending] = useState(false);
    const [showSent, setShowSent] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Filter organizations
    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter users
    const filteredUsers = profiles.filter(p =>
        p.display_name.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    // Calculate stats
    const totalOrganizations = organizations.length;
    const totalUsers = profiles.length;
    const totalMessages = messages.length;
    const unreadAnnouncements = announcements.filter(a => !a.is_read).length;

    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 768) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleEnterObserverMode = (slug: string) => {
        enterObserverMode();
        router.push(`/app/${slug}`);
    };

    if (isMobile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg-primary)] text-center">
                <div>
                    <Shield size={48} className="mx-auto mb-4 text-[var(--color-text-tertiary)]" />
                    <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">PCからアクセスしてください</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        管理者ダッシュボードはモバイルデバイスに対応していません。
                    </p>
                    <Link href="/app">
                        <Button className="mt-6" variant="secondary">アプリに戻る</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleSendAnnouncement = async () => {
        if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;

        setIsSending(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        // In production, this would call an API to create the announcement
        // For now, we just show success feedback
        setIsSending(false);
        setShowSent(true);
        setNewAnnouncementTitle('');
        setNewAnnouncementContent('');
        setShowNewAnnouncement(false);

        setTimeout(() => setShowSent(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-[var(--color-bg-card)]/80 backdrop-blur-xl border-b border-[var(--color-bg-tertiary)]"
            >
                <div className="flex items-center gap-4">
                    <Link href="/app" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Groupin
                        </span>
                    </Link>
                    <span className="text-[var(--color-text-muted)]">/</span>
                    <span className="text-sm font-medium text-[var(--color-accent)]">Admin</span>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <Shield size={28} className="text-[var(--color-accent)]" />
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                            システム管理
                        </h1>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">
                        Groupin全体の状況確認とシステム管理
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={Building2}
                        label="団体数"
                        value={totalOrganizations}
                        trend="+12% 今月"
                        color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    />
                    <div className="cursor-pointer" onClick={() => setShowUserModal(true)}>
                        <StatCard
                            icon={Users}
                            label="総ユーザー"
                            value={totalUsers}
                            trend="+8% 今月"
                            color="bg-gradient-to-br from-purple-500 to-pink-600"
                        />
                    </div>
                    <StatCard
                        icon={MessageSquare}
                        label="メッセージ"
                        value={totalMessages}
                        color="bg-gradient-to-br from-green-500 to-emerald-600"
                    />
                    <StatCard
                        icon={Bell}
                        label="未読お知らせ"
                        value={unreadAnnouncements}
                        color="bg-gradient-to-br from-amber-500 to-orange-600"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Organizations List */}
                    <Card delay={0.2}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 size={18} className="text-[var(--color-accent)]" />
                                    <h2 className="font-semibold text-[var(--color-text-primary)]">
                                        団体一覧
                                    </h2>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Search */}
                            <div className="relative mb-4">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="団体を検索..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                                />
                            </div>

                            {/* Organizations */}
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {filteredOrgs.map((org) => {
                                    const memberCount = profiles.filter(p => p.org_id === org.id).length;
                                    return (
                                        <button
                                            key={org.id}
                                            onClick={() => handleEnterObserverMode(org.slug)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors group text-left"
                                        >
                                            {org.icon_url ? (
                                                <img src={org.icon_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                                            ) : (
                                                <InitialAvatar name={org.name} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[var(--color-text-primary)] truncate">
                                                    {org.name}
                                                </p>
                                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                                    {CATEGORY_LABELS[org.category]} · {memberCount}人
                                                </p>
                                            </div>
                                            <ChevronRight size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Announcements */}
                    <Card delay={0.25}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell size={18} className="text-[var(--color-accent)]" />
                                    <h2 className="font-semibold text-[var(--color-text-primary)]">
                                        システムお知らせ
                                    </h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}
                                >
                                    <Plus size={16} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* New Announcement Form */}
                            <AnimatePresence>
                                {showNewAnnouncement && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 p-4 rounded-xl bg-[var(--color-bg-secondary)]"
                                    >
                                        <div className="space-y-3">
                                            <Input
                                                label="タイトル"
                                                value={newAnnouncementTitle}
                                                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                                                placeholder="お知らせのタイトル"
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                                    内容
                                                </label>
                                                <textarea
                                                    value={newAnnouncementContent}
                                                    onChange={(e) => setNewAnnouncementContent(e.target.value)}
                                                    placeholder="お知らせの内容を入力..."
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)] resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                                    優先度
                                                </label>
                                                <select
                                                    value={newAnnouncementPriority}
                                                    onChange={(e) => setNewAnnouncementPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                                                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                                                >
                                                    <option value="low">低</option>
                                                    <option value="normal">通常</option>
                                                    <option value="high">高</option>
                                                    <option value="urgent">緊急</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => setShowNewAnnouncement(false)}>
                                                    キャンセル
                                                </Button>
                                                <Button
                                                    onClick={handleSendAnnouncement}
                                                    isLoading={isSending}
                                                    disabled={!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()}
                                                >
                                                    <Send size={16} />
                                                    配信
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Existing Announcements */}
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {announcements.length === 0 ? (
                                    <div className="text-center py-8 text-[var(--color-text-tertiary)]">
                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">お知らせはありません</p>
                                    </div>
                                ) : (
                                    announcements.map((ann) => (
                                        <div
                                            key={ann.id}
                                            className={`p-3 rounded-xl ${ann.priority === 'urgent' ? 'bg-red-50 border border-red-200' :
                                                ann.priority === 'high' ? 'bg-amber-50 border border-amber-200' :
                                                    'bg-[var(--color-bg-secondary)]'
                                                } ${ann.is_read ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {ann.priority === 'urgent' && (
                                                    <AlertTriangle size={16} className="text-[var(--color-error)] mt-0.5" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-[var(--color-text-primary)] text-sm">
                                                        {ann.title}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1 line-clamp-2">
                                                        {ann.content}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                                        {format(new Date(ann.created_at), 'yyyy/MM/dd', { locale: ja })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Moderation (Placeholder) */}
                    <Card delay={0.3} className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-500" />
                                <h2 className="font-semibold text-[var(--color-text-primary)]">
                                    コンテンツモデレーション
                                </h2>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                                <Shield size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium mb-2">報告されたコンテンツはありません</p>
                                <p className="text-sm">
                                    ユーザーからの報告がここに表示されます
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* User Management Modal */}
            <AnimatePresence>
                {showUserModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowUserModal(false);
                                setEditingProfile(null);
                            }}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 m-auto w-full max-w-2xl h-[80vh] bg-[var(--color-bg-card)] rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-[var(--color-bg-tertiary)] flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                                    {editingProfile ? 'ユーザー編集' : 'ユーザー管理'}
                                </h2>
                                <Button variant="ghost" onClick={() => {
                                    setShowUserModal(false);
                                    setEditingProfile(null);
                                }}>閉じる</Button>
                            </div>

                            {editingProfile ? (
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                            表示名
                                        </label>
                                        <Input
                                            value={editDisplayName}
                                            onChange={(e) => setEditDisplayName(e.target.value)}
                                            placeholder="表示名を入力"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setEditingProfile(null)}
                                        >
                                            キャンセル
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (editDisplayName.trim()) {
                                                    updateProfile(editingProfile.id, { display_name: editDisplayName });
                                                    setEditingProfile(null);
                                                }
                                            }}
                                            disabled={!editDisplayName.trim()}
                                        >
                                            保存
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 border-b border-[var(--color-bg-tertiary)]">
                                        <div className="relative">
                                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                            <input
                                                type="text"
                                                placeholder="ユーザーを検索..."
                                                value={userSearchQuery}
                                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                        {filteredUsers.length === 0 ? (
                                            <p className="text-center text-[var(--color-text-tertiary)] py-8">ユーザーが見つかりません</p>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-bg-tertiary)]">
                                                    <InitialAvatar name={user.display_name} />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-[var(--color-text-primary)]">{user.display_name}</p>
                                                        <p className="text-xs text-[var(--color-text-tertiary)]">ID: {user.id}</p>
                                                        <p className="text-xs text-[var(--color-text-muted)]">
                                                            参加日: {format(new Date(user.joined_at), 'yyyy/MM/dd', { locale: ja })}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            setEditingProfile(user);
                                                            setEditDisplayName(user.display_name);
                                                        }}
                                                    >
                                                        編集
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {showSent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 px-4 py-3 bg-[var(--color-success)] text-white rounded-xl shadow-lg flex items-center gap-2"
                    >
                        <Bell size={18} />
                        お知らせを配信しました
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
