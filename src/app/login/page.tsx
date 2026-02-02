'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import Cookies from 'js-cookie';

export default function LoginPage() {
    const router = useRouter();
    const { login, demoLogin, adminLogin } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check for admin login first
        const isAdmin = adminLogin(email, password);

        if (isAdmin) {
            // Check if it's initial setup (admin/admin)
            if (email === 'admin' && password === 'admin') {
                router.push('/admin-setup');
            } else {
                Cookies.set('groupin_session', 'admin-session', { expires: 7 });
                Cookies.set('groupin_admin', 'true', { expires: 7 });
                router.push('/admin');
            }
            return;
        }

        if (email && password) {
            // Simulator: 'demo@groupin.jp' is valid, others need signup
            // In real app, we'd check DB. Use hardcoded check for demo.
            const isKnownUser = email === 'demo@groupin.jp';

            if (isKnownUser) {
                const success = login('user-1');
                if (success) {
                    Cookies.set('groupin_session', 'session-token', { expires: 7 });
                    router.push('/app');
                } else {
                    router.push('/signup');
                }
            } else {
                // Unknown user -> redirect to signup
                router.push('/signup');
            }
        } else {
            setError('メールアドレスとパスワードを入力してください');
        }

        setIsLoading(false);
    };

    const handleDemoLogin = () => {
        demoLogin();
        Cookies.set('groupin_session', 'demo-session', { expires: 7 });
        router.push('/app');
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-12">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">G</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--color-text-primary)]">Groupin</span>
                </Link>

                {/* Login Form */}
                <div className="bg-[var(--color-bg-card)] rounded-3xl shadow-[var(--shadow-lg)] p-8">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-8">
                        ログイン
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="メールアドレス"
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

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="パスワード"
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
                            ログイン
                            <ArrowRight size={18} />
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--color-bg-tertiary)]" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-[var(--color-bg-card)] px-4 text-[var(--color-text-muted)]">
                                または
                            </span>
                        </div>
                    </div>

                    {/* Demo Login */}
                    <Button
                        variant="secondary"
                        onClick={handleDemoLogin}
                        className="w-full py-4 text-base"
                    >
                        <Sparkles size={18} />
                        デモでログイン
                    </Button>

                    <div className="mt-8 text-center">
                        <p className="text-[var(--color-text-secondary)]">
                            アカウントをお持ちでないですか？{' '}
                            <Link
                                href="/signup"
                                className="text-[var(--color-accent)] hover:underline font-medium"
                            >
                                新規登録
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
