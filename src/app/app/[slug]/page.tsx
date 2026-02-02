'use client';

import { useEffect, useRef, use } from 'react';
import { motion } from 'framer-motion';
import { Hash, Users } from 'lucide-react';
import { useAppStore, useCurrentOrgChatRooms, useProfilesForOrg } from '@/lib/store';
import { Card } from '@/components/ui';
import { mockOrganizations } from '@/lib/mockData';
import { CATEGORY_LABELS } from '@/types';

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

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function OrganizationPage({ params }: PageProps) {
    const { slug } = use(params);
    const currentOrganization = useAppStore((s) => s.currentOrganization);
    const setCurrentOrganization = useAppStore((s) => s.setCurrentOrganization);
    const chatRooms = useCurrentOrgChatRooms();
    const profiles = useProfilesForOrg(currentOrganization?.id || '');

    // Prevent infinite loop: only update if slug changed
    const prevSlugRef = useRef<string | null>(null);

    useEffect(() => {
        if (slug !== prevSlugRef.current) {
            prevSlugRef.current = slug;
            const org = mockOrganizations.find((o) => o.slug === slug);
            if (org && org.id !== currentOrganization?.id) {
                setCurrentOrganization(org);
            }
        }
    }, [slug, currentOrganization?.id, setCurrentOrganization]);

    if (!currentOrganization) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-pulse text-[var(--color-text-tertiary)]">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center py-8"
            >
                {currentOrganization.icon_url ? (
                    <img src={currentOrganization.icon_url} alt="" className="w-20 h-20 mx-auto mb-6 rounded-xl object-cover" />
                ) : (
                    <div className="flex justify-center mb-6">
                        <InitialAvatar name={currentOrganization.name} />
                    </div>
                )}

                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    {currentOrganization.name}
                </h1>
                <p className="text-sm text-[var(--color-accent)] mb-4">
                    {CATEGORY_LABELS[currentOrganization.category]}
                </p>
                <p className="text-[var(--color-text-secondary)] mb-8">
                    {currentOrganization.description || '説明はまだありません'}
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                    <Card delay={0.1} className="p-4" hoverable={false}>
                        <Users size={20} className="mx-auto mb-2 text-[var(--color-accent)]" />
                        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{profiles.length}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">メンバー</p>
                    </Card>
                    <Card delay={0.15} className="p-4" hoverable={false}>
                        <Hash size={20} className="mx-auto mb-2 text-[var(--color-accent)]" />
                        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{chatRooms.length}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">チャンネル</p>
                    </Card>
                </div>

                <p className="text-sm text-[var(--color-text-muted)]">
                    左のサイドバーからチャンネルを選択してください
                </p>
            </motion.div>
        </div>
    );
}
