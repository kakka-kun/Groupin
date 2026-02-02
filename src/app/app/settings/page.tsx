'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Moon, Sun, Save, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
    Card, CardHeader, CardContent,
    Button, Input, Toggle,
    PasswordStrengthIndicator, validatePasswordStrength
} from '@/components/ui';

// イニシャルアバター
function InitialAvatar({ name }: { name: string }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-2xl font-semibold shadow-lg`}>
            {initial}
        </div>
    );
}

export default function GlobalSettingsPage() {
    const { isDarkMode, toggleDarkMode, currentProfile, updateProfile } = useAppStore();

    // Initialize with current profile data or defaults
    const [defaultName, setDefaultName] = useState(currentProfile?.display_name || 'デモユーザー');
    const [email, setEmail] = useState('demo@groupin.jp');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (currentProfile) {
            updateProfile(currentProfile.id, {
                display_name: defaultName,
            });
        }

        // Reset sensitive fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setIsSaving(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

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
                        全体設定
                    </h1>
                </div>
                <p className="text-[var(--color-text-secondary)]">
                    アカウント全体の設定を管理
                </p>
            </motion.div>

            <div className="space-y-6">
                {/* Profile */}
                <Card delay={0.1}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">プロフィール</h2>
                        <p className="text-sm text-[var(--color-text-tertiary)]">デフォルトの表示名・アイコン</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <InitialAvatar name={defaultName} />
                            <Button variant="secondary" size="sm">
                                アイコン変更
                            </Button>
                        </div>
                        <Input
                            label="デフォルト表示名"
                            value={defaultName}
                            onChange={(e) => setDefaultName(e.target.value)}
                            helperText="団体に参加する際の初期名"
                        />
                    </CardContent>
                </Card>

                {/* Security */}
                <Card delay={0.12}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">セキュリティ</h2>
                        <p className="text-sm text-[var(--color-text-tertiary)]">ログイン情報の変更</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            helperText="メールアドレスの変更は再認証が必要です"
                        />

                        <div className="pt-2 border-t border-[var(--color-bg-tertiary)]">
                            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">パスワード変更</h3>
                            <div className="space-y-4">
                                <Input
                                    type="password"
                                    label="現在のパスワード"
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <div>
                                    <Input
                                        type="password"
                                        label="新しいパスワード"
                                        placeholder="新しいパスワードを入力"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <PasswordStrengthIndicator password={newPassword} />
                                </div>
                                <Input
                                    type="password"
                                    label="パスワード確認"
                                    placeholder="もう一度入力"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card delay={0.15}>
                    <CardHeader>
                        <h2 className="font-semibold text-[var(--color-text-primary)]">外観</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isDarkMode ? (
                                    <Moon size={20} className="text-[var(--color-accent)]" />
                                ) : (
                                    <Sun size={20} className="text-[var(--color-accent)]" />
                                )}
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        ダークモード
                                    </p>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">
                                        暗い配色に切り替えます
                                    </p>
                                </div>
                            </div>
                            <Toggle checked={isDarkMode} onChange={toggleDarkMode} />
                        </div>
                    </CardContent>
                </Card>

                {/* Save */}
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
