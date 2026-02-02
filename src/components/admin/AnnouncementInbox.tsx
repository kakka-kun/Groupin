'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Bell, AlertTriangle, Info, AlertCircle, X, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { AdminAnnouncement } from '@/types';
import { Button } from '@/components/ui';

const priorityConfig = {
    low: {
        icon: Info,
        color: 'text-[var(--color-text-tertiary)]',
        bg: 'bg-[var(--color-bg-tertiary)]',
    },
    normal: {
        icon: Info,
        color: 'text-[var(--color-accent)]',
        bg: 'bg-[var(--color-accent-light)]',
    },
    high: {
        icon: AlertCircle,
        color: 'text-[var(--color-warning)]',
        bg: 'bg-amber-50',
    },
    urgent: {
        icon: AlertTriangle,
        color: 'text-[var(--color-error)]',
        bg: 'bg-red-50',
    },
};

function AnnouncementItem({ announcement, onMarkAsRead }: { announcement: AdminAnnouncement; onMarkAsRead: () => void }) {
    const config = priorityConfig[announcement.priority];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className={`
                p-4 rounded-xl
                ${announcement.is_read ? 'opacity-60' : ''}
                ${config.bg}
            `}
        >
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${config.color}`}>
                    <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                            {announcement.title}
                        </h4>
                        {!announcement.is_read && (
                            <button
                                onClick={onMarkAsRead}
                                className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                                title="既読にする"
                            >
                                <Check size={14} className="text-[var(--color-text-tertiary)]" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                        {announcement.content}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {format(new Date(announcement.created_at), 'M月d日 HH:mm', { locale: ja })}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export function AnnouncementInbox() {
    const { announcements, markAnnouncementAsRead } = useAppStore();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = announcements.filter((a) => !a.is_read).length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsPanelOpen(false);
            }
        };

        if (isPanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPanelOpen]);

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="
                            absolute -top-0.5 -right-0.5
                            w-5 h-5 flex items-center justify-center
                            bg-[var(--color-error)] text-white
                            text-xs font-medium rounded-full
                        "
                    >
                        {unreadCount}
                    </motion.span>
                )}
            </Button>

            {/* Announcement Panel */}
            <AnimatePresence>
                {isPanelOpen && (
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="
                            absolute right-0 top-full mt-2
                            w-96 max-h-[480px]
                            bg-[var(--color-bg-card)] rounded-2xl
                            shadow-[var(--shadow-xl)]
                            overflow-hidden
                            z-50
                        "
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-bg-tertiary)]">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                お知らせ
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsPanelOpen(false)}>
                                <X size={18} />
                            </Button>
                        </div>

                        {/* Announcements List */}
                        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {announcements.length === 0 ? (
                                <div className="text-center py-8 text-[var(--color-text-tertiary)]">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">お知らせはありません</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {announcements.map((announcement) => (
                                        <AnnouncementItem
                                            key={announcement.id}
                                            announcement={announcement}
                                            onMarkAsRead={() => markAnnouncementAsRead(announcement.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
