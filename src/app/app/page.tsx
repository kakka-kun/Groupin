'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, Plus, Building2, School, Users2, UserPlus, Check, X } from 'lucide-react';
import { useAppStore, useUserOrganizations } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, Input, Modal } from '@/components/ui';
import { Organization, OrgCategory, CATEGORY_LABELS, Profile } from '@/types';

// イニシャルアバター
function InitialAvatar({ name, size = 'lg' }: { name: string; size?: 'md' | 'lg' | 'xl' }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClasses = {
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-20 h-20 text-2xl',
    };
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold shadow-lg`}>
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

const CATEGORY_ICONS = {
    company: Building2,
    school: School,
    community: Users2,
};

function OrganizationCard({ org, index }: { org: Organization; index: number }) {
    const router = useRouter();
    const setCurrentOrganization = useAppStore((s) => s.setCurrentOrganization);
    const profiles = useAppStore((s) => s.profiles);
    const currentUserId = useAppStore((s) => s.currentUserId);

    const profile = profiles.find((p) => p.org_id === org.id && p.user_id === currentUserId);
    const CategoryIcon = CATEGORY_ICONS[org.category];

    const handleClick = () => {
        setCurrentOrganization(org);
        router.push(`/app/${org.slug}`);
    };

    return (
        <Card onClick={handleClick} delay={0.1 + index * 0.05} className="group">
            <CardHeader>
                <div className="flex items-start justify-between">
                    {org.icon_url ? (
                        <img src={org.icon_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                        <InitialAvatar name={org.name} />
                    )}
                    <div className="p-2 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]">
                        <CategoryIcon size={16} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
                    {org.name}
                </h3>
                <p className="text-xs text-[var(--color-accent)] mb-2">
                    {CATEGORY_LABELS[org.category]}
                </p>
                {profile && (
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                        {profile.display_name} として参加中
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const currentUserId = useAppStore((s) => s.currentUserId);
    const setCurrentOrganization = useAppStore((s) => s.setCurrentOrganization);
    const addOrganization = useAppStore((s) => s.addOrganization);
    const addProfile = useAppStore((s) => s.addProfile);
    const joinOrganization = useAppStore((s) => s.joinOrganization);
    const userOrgs = useUserOrganizations();

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgSlug, setNewOrgSlug] = useState('');
    const [newOrgCategory, setNewOrgCategory] = useState<OrgCategory>('community');
    const [displayName, setDisplayName] = useState('');

    // Join modal
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [joinDisplayName, setJoinDisplayName] = useState('');
    const [joinStep, setJoinStep] = useState<'code' | 'profile' | 'success'>('code');
    const [foundOrg, setFoundOrg] = useState<Organization | null>(null);
    const [joinError, setJoinError] = useState('');

    const handleCreateOrg = () => {
        if (newOrgName && newOrgSlug && displayName && currentUserId) {
            const newOrg: Organization = {
                id: `org-${Date.now()}`,
                slug: newOrgSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                name: newOrgName,
                description: '',
                category: newOrgCategory,
                invite_code: generateInviteCode(),
                read_receipt_enabled: true,
                created_at: new Date(),
            };

            addOrganization(newOrg);

            const newProfile: Profile = {
                id: `profile-${Date.now()}`,
                user_id: currentUserId,
                org_id: newOrg.id,
                display_name: displayName,
                role: 'オーナー',
                joined_at: new Date(),
            };
            addProfile(newProfile);

            setCurrentOrganization(newOrg);
            setShowCreateModal(false);
            setNewOrgName('');
            setNewOrgSlug('');
            setDisplayName('');
            router.push(`/app/${newOrg.slug}`);
        }
    };

    const handleCheckInviteCode = () => {
        const org = useAppStore.getState().organizations.find((o) => o.invite_code === inviteCode.toUpperCase());
        if (org) {
            // Check if already a member
            const existingProfile = useAppStore.getState().profiles.find(
                (p) => p.org_id === org.id && p.user_id === currentUserId
            );
            if (existingProfile) {
                setJoinError('すでにこの団体に参加しています');
                return;
            }
            setFoundOrg(org);
            setJoinError('');
            setJoinStep('profile');
        } else {
            setJoinError('招待コードが見つかりません');
        }
    };

    const handleJoinOrg = () => {
        if (foundOrg && joinDisplayName && currentUserId) {
            const newProfile: Profile = {
                id: `profile-${Date.now()}`,
                user_id: currentUserId,
                org_id: foundOrg.id,
                display_name: joinDisplayName,
                role: 'メンバー',
                joined_at: new Date(),
            };
            addProfile(newProfile);
            setJoinStep('success');
        }
    };

    const handleJoinComplete = () => {
        if (foundOrg) {
            setCurrentOrganization(foundOrg);
            router.push(`/app/${foundOrg.slug}`);
        }
        // Reset modal state
        setShowJoinModal(false);
        setInviteCode('');
        setJoinDisplayName('');
        setJoinStep('code');
        setFoundOrg(null);
    };

    const resetJoinModal = () => {
        setShowJoinModal(false);
        setInviteCode('');
        setJoinDisplayName('');
        setJoinStep('code');
        setFoundOrg(null);
        setJoinError('');
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                    ダッシュボード
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    参加している団体を選択してください
                </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 flex gap-3 flex-wrap"
            >
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    新しい団体を作成
                </Button>
                <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
                    <UserPlus size={18} />
                    招待コードで参加
                </Button>
            </motion.div>

            {/* Organizations Grid */}
            {userOrgs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userOrgs.map((org, index) => (
                        <OrganizationCard key={org.id} org={org} index={index} />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                        <Users size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                        まだ団体に参加していません
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                        新しい団体を作成するか、招待コードで参加してください
                    </p>
                </motion.div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="新しい団体を作成"
            >
                <div className="space-y-4">
                    <Input
                        label="団体名"
                        placeholder="例: 東京高校サッカー部"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                    />
                    <Input
                        label="カスタムID（URL用）"
                        placeholder="例: soccer-club"
                        value={newOrgSlug}
                        onChange={(e) => setNewOrgSlug(e.target.value)}
                        helperText="英数字とハイフンのみ"
                    />

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            カテゴリ
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['company', 'school', 'community'] as OrgCategory[]).map((cat) => {
                                const Icon = CATEGORY_ICONS[cat];
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setNewOrgCategory(cat)}
                                        className={`
                                            p-3 rounded-xl text-center transition-all
                                            ${newOrgCategory === cat
                                                ? 'bg-[var(--color-accent)] text-white'
                                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                                            }
                                        `}
                                    >
                                        <Icon size={20} className="mx-auto mb-1" />
                                        <span className="text-xs">{CATEGORY_LABELS[cat]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <Input
                        label="この団体での表示名"
                        placeholder="例: サッカー太郎"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        helperText="団体ごとに異なる名前を使えます"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                            キャンセル
                        </Button>
                        <Button onClick={handleCreateOrg} disabled={!newOrgName || !newOrgSlug || !displayName}>
                            作成
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Join Modal */}
            <Modal
                isOpen={showJoinModal}
                onClose={resetJoinModal}
                title={
                    joinStep === 'code' ? '招待コードで参加' :
                        joinStep === 'profile' ? 'プロフィール設定' :
                            '参加完了'
                }
            >
                <AnimatePresence mode="wait">
                    {joinStep === 'code' && (
                        <motion.div
                            key="code"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <p className="text-[var(--color-text-secondary)]">
                                団体の管理者から受け取った招待コードを入力してください
                            </p>
                            <Input
                                label="招待コード"
                                placeholder="例: GR-ABC123"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                error={joinError}
                            />
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={resetJoinModal}>
                                    キャンセル
                                </Button>
                                <Button onClick={handleCheckInviteCode} disabled={!inviteCode.trim()}>
                                    確認
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {joinStep === 'profile' && foundOrg && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] flex items-center gap-4">
                                {foundOrg.icon_url ? (
                                    <img src={foundOrg.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                ) : (
                                    <InitialAvatar name={foundOrg.name} size="md" />
                                )}
                                <div>
                                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                                        {foundOrg.name}
                                    </h3>
                                    <p className="text-sm text-[var(--color-accent)]">
                                        {CATEGORY_LABELS[foundOrg.category]}
                                    </p>
                                </div>
                            </div>

                            <Input
                                label="この団体での表示名"
                                placeholder="例: 山田太郎"
                                value={joinDisplayName}
                                onChange={(e) => setJoinDisplayName(e.target.value)}
                                helperText="他のメンバーに表示される名前です"
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setJoinStep('code')}>
                                    戻る
                                </Button>
                                <Button onClick={handleJoinOrg} disabled={!joinDisplayName.trim()}>
                                    参加する
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {joinStep === 'success' && foundOrg && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                                参加しました！
                            </h3>
                            <p className="text-[var(--color-text-secondary)] mb-4">
                                <strong>{foundOrg.name}</strong> に参加しました
                            </p>
                            <Button onClick={handleJoinComplete}>
                                団体ページへ
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Modal>
        </div>
    );
}
