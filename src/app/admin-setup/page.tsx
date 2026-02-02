'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button, Input, PasswordStrengthIndicator, validatePasswordStrength } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import Cookies from 'js-cookie';

export default function AdminSetupPage() {
    const router = useRouter();
    const { adminSetupCompleted, completeAdminSetup } = useAppStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // If setup is already completed, redirect to admin
        if (mounted && adminSetupCompleted) {
            router.push('/admin');
        }
    }, [mounted, adminSetupCompleted, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('すべての項目を入力してください');
            return;
        }

        if (!email.includes('@')) {
            setError('有効なメールアドレスを入力してください');
            return;
        }

        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        if (!validatePasswordStrength(password)) {
            setError('より強力なパスワードを設定してください（8文字以上、大文字・小文字・数字・記号のうち3つ以上）');
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Complete admin setup
        completeAdminSetup(email, password);

        // Set admin session cookie
        Cookies.set('groupin_session', 'admin-session', { expires: 7 });
        Cookies.set('groupin_admin', 'true', { expires: 7 });

        router.push('/admin');
        setIsLoading(false);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                        <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        管理者セットアップ
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-2 text-center">
                        初回ログインです。正規の管理者情報を設定してください。
                    </p>
                </div>

                {/* Warning */}
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">重要</p>
                            <p className="text-xs text-amber-700 mt-1">
                                デフォルトの管理者パスワード（admin/admin）は無効化されます。
                                新しい認証情報を必ず記録してください。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Setup Form */}
                <div className="bg-[var(--color-bg-card)] rounded-3xl shadow-[var(--shadow-lg)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="管理者メールアドレス"
                                className="
                                    w-full pl-12 pr-4 py-4 rounded-xl
                                    bg-[var(--color-bg-secondary)]
                                    text-[var(--color-text-primary)]
                                    placeholder:text-[var(--color-text-muted)]
                                    border border-transparent
                                    focus:outline-none focus:border-[var(--color-accent)]
                                    focus:ring-2 focus:ring-[var(--color-accent-light)]
                                    transition-all
                                "
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="新しいパスワード"
                                    className="
                                        w-full pl-12 pr-4 py-4 rounded-xl
                                        bg-[var(--color-bg-secondary)]
                                        text-[var(--color-text-primary)]
                                        placeholder:text-[var(--color-text-muted)]
                                        border border-transparent
                                        focus:outline-none focus:border-[var(--color-accent)]
                                        focus:ring-2 focus:ring-[var(--color-accent-light)]
                                        transition-all
                                    "
                                />
                            </div>
                            <PasswordStrengthIndicator password={password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="パスワード確認"
                                className="
                                    w-full pl-12 pr-4 py-4 rounded-xl
                                    bg-[var(--color-bg-secondary)]
                                    text-[var(--color-text-primary)]
                                    placeholder:text-[var(--color-text-muted)]
                                    border border-transparent
                                    focus:outline-none focus:border-[var(--color-accent)]
                                    focus:ring-2 focus:ring-[var(--color-accent-light)]
                                    transition-all
                                "
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-[var(--color-error)] text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-4 text-base"
                        >
                            セットアップを完了
                            <ArrowRight size={18} />
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
