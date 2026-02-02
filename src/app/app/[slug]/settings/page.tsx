'use client';

import { useEffect, useState, useRef, use } from 'react';
import { motion } from 'framer-motion';
import { Settings, Eye, EyeOff, Save, Copy, Check, RefreshCw, Shield } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardHeader, CardContent, Button, Input, Toggle } from '@/components/ui';
import { mockOrganizations } from '@/lib/mockData';
import { CATEGORY_LABELS } from '@/types';
import { useRouter } from 'next/navigation';
import { safeClipboardWrite } from '@/lib/clipboard';

// イニシャルアバター
function InitialAvatar({ name, size = 'xl' }: { name: string; size?: 'lg' | 'xl' }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClasses = { lg: 'w-12 h-12 text-lg', xl: 'w-20 h-20 text-2xl' };
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

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function SettingsPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();

    // Selective subscriptions to prevent infinite loops
    const currentOrganization = useAppStore((s) => s.currentOrganization);
    const currentProfile = useAppStore((s) => s.currentProfile);
    const setCurrentOrganization = useAppStore((s) => s.setCurrentOrganization);
    const toggleReadReceipt = useAppStore((s) => s.toggleReadReceipt);
    const updateProfile = useAppStore((s) => s.updateProfile);
    const updateOrganization = useAppStore((s) => s.updateOrganization);

    const [displayName, setDisplayName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const prevSlugRef = useRef<string | null>(null);

    // Load org - with ref to prevent infinite loops
    useEffect(() => {
        if (slug !== prevSlugRef.current) {
            prevSlugRef.current = slug;
            const org = mockOrganizations.find((o) => o.slug === slug);
            if (org && org.id !== currentOrganization?.id) {
                setCurrentOrganization(org);
            }
        }
    }, [slug, currentOrganization?.id, setCurrentOrganization]);

    // Sync form state with current data
    useEffect(() => {
        if (currentProfile) setDisplayName(currentProfile.display_name);
        if (currentOrganization) {
            setOrgName(currentOrganization.name);
            setInviteCode(currentOrganization.invite_code || generateInviteCode());
        }
    }, [currentProfile?.display_name, currentOrganization?.name, currentOrganization?.invite_code]);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (currentProfile) {
            updateProfile(currentProfile.id, { display_name: displayName });
        }
        if (currentOrganization) {
            updateOrganization(currentOrganization.id, { name: orgName, invite_code: inviteCode });
        }

        setIsSaving(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

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
        setInviteCode(generateInviteCode());
        setIsRegenerating(false);
    };

    if (!currentOrganization) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-pulse text-[var(--color-text-tertiary)]">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-4 mb-2">
                    <Settings size={24} className="text-[var(--color-accent)]" />
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        団体設定
                    </h1>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                    {currentOrganization.name} の設定
                </p>
            </motion.div>

            <div className="space-y-6">
                {/* Organization Info */}
                <Card delay={0.1}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">団体情報</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            {currentOrganization.icon_url ? (
                                <img src={currentOrganization.icon_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                            ) : (
                                <InitialAvatar name={currentOrganization.name} />
                            )}
                            <div>
                                <Button variant="secondary" size="sm">
                                    アイコン変更
                                </Button>
                            </div>
                        </div>
                        <Input
                            label="団体名"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                カテゴリ
                            </label>
                            <p className="text-[var(--color-text-secondary)]">
                                {CATEGORY_LABELS[currentOrganization.category]}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                カスタムID
                            </label>
                            <p className="text-[var(--color-text-secondary)] font-mono">
                                groupin.jp/app/{currentOrganization.slug}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Settings */}
                <Card delay={0.15}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">プロフィール設定</h2>
                        <p className="text-sm text-[var(--color-text-tertiary)]">この団体での表示名</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="表示名"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            helperText="この団体でのみ使用されます"
                        />
                    </CardContent>
                </Card>

                {/* Invite Code */}
                <Card delay={0.2}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">招待コード</h2>
                        <p className="text-sm text-[var(--color-text-tertiary)]">メンバーを招待するためのコード</p>
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
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                            コードを再生成すると、古いコードは無効になります
                        </p>
                    </CardContent>
                </Card>

                {/* Read Receipt */}
                <Card delay={0.25}>
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
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        既読表示を有効にする
                                    </p>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">
                                        メッセージが読まれたかどうかを表示します
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                checked={currentOrganization.read_receipt_enabled}
                                onChange={() => toggleReadReceipt(currentOrganization.id)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Link */}
                <Card delay={0.3}>
                    <CardContent>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => router.push(`/app/${slug}/admin`)}
                        >
                            <Shield size={18} />
                            管理ダッシュボード
                        </Button>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="sticky bottom-6 flex justify-end">
                    <Button onClick={handleSave} isLoading={isSaving} className="shadow-lg">
                        {showSaved ? (
                            <>
                                <Check size={18} />
                                保存しました
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                変更を保存
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
