'use client';

import { useEffect, useState, useRef, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Hash, RefreshCw, Copy, Check, Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { useAppStore, useCurrentOrgChatRooms, useProfilesForOrg } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, Input, Toggle } from '@/components/ui';
import { mockOrganizations } from '@/lib/mockData';
import { CATEGORY_LABELS, CATEGORY_ROLES } from '@/types';
import { safeClipboardWrite } from '@/lib/clipboard';

// イニシャルアバター
function InitialAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClasses = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base' };
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-medium`}>
            {initial}
        </div>
    );
}

// 招待コード生成
function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GR-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function AdminPage({ params }: PageProps) {
    const { slug } = use(params);

    const currentOrganization = useAppStore((s) => s.currentOrganization);
    const setCurrentOrganization = useAppStore((s) => s.setCurrentOrganization);
    const updateOrganization = useAppStore((s) => s.updateOrganization);
    const updateProfile = useAppStore((s) => s.updateProfile);
    const toggleReadReceipt = useAppStore((s) => s.toggleReadReceipt);
    const addChatRoom = useAppStore((s) => s.addChatRoom);
    const deleteChatRoom = useAppStore((s) => s.deleteChatRoom);

    const chatRooms = useCurrentOrgChatRooms();
    const profiles = useProfilesForOrg(currentOrganization?.id || '');
    const categoryRoles = currentOrganization ? CATEGORY_ROLES[currentOrganization.category] : [];

    const [inviteCode, setInviteCode] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [showNewChannelForm, setShowNewChannelForm] = useState(false);
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
    const [showSaved, setShowSaved] = useState(false);

    const prevSlugRef = useRef<string | null>(null);

    // Load org
    useEffect(() => {
        if (slug !== prevSlugRef.current) {
            prevSlugRef.current = slug;
            const org = mockOrganizations.find((o) => o.slug === slug);
            if (org && org.id !== currentOrganization?.id) {
                setCurrentOrganization(org);
            }
        }
    }, [slug, currentOrganization?.id, setCurrentOrganization]);

    useEffect(() => {
        if (currentOrganization) {
            setInviteCode(currentOrganization.invite_code || generateInviteCode());
        }
    }, [currentOrganization?.invite_code]);

    const handleCopyInviteCode = async () => {
        const success = await safeClipboardWrite(inviteCode);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRegenerateCode = async () => {
        setIsRegenerating(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newCode = generateInviteCode();
        setInviteCode(newCode);
        if (currentOrganization) {
            updateOrganization(currentOrganization.id, { invite_code: newCode });
        }
        setIsRegenerating(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim() || !currentOrganization) return;

        setIsCreatingChannel(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        addChatRoom({
            id: `chat-${Date.now()}`,
            org_id: currentOrganization.id,
            name: newChannelName,
            description: newChannelDesc || undefined,
            created_at: new Date(),
        });

        setNewChannelName('');
        setNewChannelDesc('');
        setShowNewChannelForm(false);
        setIsCreatingChannel(false);
    };

    const handleDeleteChannel = async (roomId: string) => {
        if (!confirm('このチャンネルを削除しますか？')) return;
        deleteChatRoom(roomId);
    };

    const handleRoleChange = (profileId: string, newRole: string) => {
        updateProfile(profileId, { role: newRole });
        setEditingProfileId(null);
    };

    if (!currentOrganization) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-pulse text-[var(--color-text-tertiary)]">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4 mb-2">
                    <Shield size={24} className="text-[var(--color-accent)]" />
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        管理ダッシュボード
                    </h1>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                    {currentOrganization.name} の管理設定
                </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Invite Code */}
                <Card delay={0.1}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">招待コード</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 px-4 py-3 bg-[var(--color-bg-secondary)] rounded-xl font-mono text-lg text-[var(--color-text-primary)] tracking-wider">
                                {inviteCode}
                            </code>
                            <Button variant="secondary" onClick={handleCopyInviteCode}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleRegenerateCode}
                                isLoading={isRegenerating}
                            >
                                <RefreshCw size={18} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Read Receipt Toggle */}
                <Card delay={0.15}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">既読表示</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {currentOrganization.read_receipt_enabled ? (
                                    <Eye size={20} className="text-[var(--color-accent)]" />
                                ) : (
                                    <EyeOff size={20} className="text-[var(--color-text-muted)]" />
                                )}
                                <span className="text-[var(--color-text-primary)]">
                                    既読表示を有効にする
                                </span>
                            </div>
                            <Toggle
                                checked={currentOrganization.read_receipt_enabled}
                                onChange={() => toggleReadReceipt(currentOrganization.id)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Members */}
                <Card delay={0.2} className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-[var(--color-accent)]" />
                                <h2 className="font-semibold text-[var(--color-text-primary)]">メンバー ({profiles.length})</h2>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {profiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]"
                                >
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <InitialAvatar name={profile.display_name} />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--color-text-primary)] truncate">
                                            {profile.display_name}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-tertiary)]">
                                            {new Date(profile.joined_at).toLocaleDateString('ja-JP')} 加入
                                        </p>
                                    </div>
                                    {editingProfileId === profile.id ? (
                                        <select
                                            value={profile.role}
                                            onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                            className="px-3 py-1 rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm"
                                        >
                                            {categoryRoles.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <button
                                            onClick={() => setEditingProfileId(profile.id)}
                                            className="px-3 py-1 rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)] text-sm hover:opacity-80"
                                        >
                                            {profile.role}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Channels */}
                <Card delay={0.25} className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Hash size={18} className="text-[var(--color-accent)]" />
                                <h2 className="font-semibold text-[var(--color-text-primary)]">チャンネル ({chatRooms.length})</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNewChannelForm(!showNewChannelForm)}
                            >
                                <Plus size={18} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence>
                            {showNewChannelForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-4 rounded-xl bg-[var(--color-bg-secondary)]"
                                >
                                    <div className="space-y-3">
                                        <Input
                                            label="チャンネル名"
                                            value={newChannelName}
                                            onChange={(e) => setNewChannelName(e.target.value)}
                                            placeholder="例: 一般"
                                        />
                                        <Input
                                            label="説明（任意）"
                                            value={newChannelDesc}
                                            onChange={(e) => setNewChannelDesc(e.target.value)}
                                            placeholder="例: 全体での連絡用"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowNewChannelForm(false)}
                                            >
                                                キャンセル
                                            </Button>
                                            <Button
                                                onClick={handleCreateChannel}
                                                isLoading={isCreatingChannel}
                                                disabled={!newChannelName.trim()}
                                            >
                                                作成
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            {chatRooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]"
                                >
                                    <Hash size={18} className="text-[var(--color-text-tertiary)]" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--color-text-primary)]">
                                            {room.name}
                                        </p>
                                        {room.description && (
                                            <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                                                {room.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteChannel(room.id)}
                                        className="text-[var(--color-error)] hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Saved Toast */}
            <AnimatePresence>
                {showSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 px-4 py-2 bg-[var(--color-success)] text-white rounded-xl shadow-lg flex items-center gap-2"
                    >
                        <Check size={18} />
                        保存しました
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
