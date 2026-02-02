'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Cookies from 'js-cookie';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const router = useRouter();
  const { demoLogin } = useAppStore();

  const handleDemoLogin = () => {
    // デモユーザーとして即時ログイン
    demoLogin();
    Cookies.set('groupin_session', 'demo-session', { expires: 7 });
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
      {/* Simple Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-[var(--color-text-primary)]">Groupin</span>
          </div>
        </div>
      </motion.header>

      {/* Hero - Ultra Simple */}
      <main className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial="initial"
          animate="animate"
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-[var(--color-text-primary)] leading-tight mb-6"
          >
            つながる、
            <br />
            切り替える、
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
              分ける。
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto mb-12"
          >
            1つのアカウントで、団体ごとに
            <br />
            異なる自分を使い分ける。
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="
                inline-flex items-center gap-2 px-8 py-4
                text-lg font-medium text-white
                bg-gradient-to-r from-blue-500 to-indigo-600
                rounded-2xl shadow-lg shadow-blue-500/25
                hover:shadow-xl hover:shadow-blue-500/30
                hover:-translate-y-0.5
                transition-all duration-200
              "
            >
              はじめる
              <ArrowRight size={20} />
            </Link>

            <button
              onClick={handleDemoLogin}
              className="
                inline-flex items-center gap-2 px-8 py-4
                text-lg font-medium text-[var(--color-text-secondary)]
                bg-[var(--color-bg-secondary)]
                rounded-2xl
                hover:bg-[var(--color-bg-tertiary)]
                transition-all duration-200
              "
            >
              <Sparkles size={18} />
              デモを試す
            </button>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6 text-center"
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          © 2024 Groupin. Private Edition.
        </p>
      </motion.footer>
    </div>
  );
}
