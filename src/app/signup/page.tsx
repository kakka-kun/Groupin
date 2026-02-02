'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import Cookies from 'js-cookie';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // デモ用: 簡易サインアップ処理
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (name && email && password) {
            // セッションCookieを設定
            Cookies.set('groupin_session', 'demo-session-token', { expires: 7 });
            router.push('/app');
        } else {
            setError('すべての項目を入力してください');
        }

        setIsLoading(false);
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

                {/* Signup Form */}
                <div className="bg-[var(--color-bg-card)] rounded-3xl shadow-[var(--shadow-lg)] p-8">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">
                        アカウント作成
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-center mb-8">
                        無料で始めましょう
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                            />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="お名前"
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
                            アカウント作成
                            <ArrowRight size={18} />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[var(--color-text-secondary)]">
                            すでにアカウントをお持ちですか？{' '}
                            <Link
                                href="/login"
                                className="text-[var(--color-accent)] hover:underline font-medium"
                            >
                                ログイン
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
