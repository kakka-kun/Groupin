import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, CheckCheck, FileText, Download, Smile, Plus } from 'lucide-react';
import { Message, FileAttachment } from '@/types';
import { Avatar, AvatarGroup } from '@/components/ui';
import { mockProfiles } from '@/lib/mockData';
import { useAppStore } from '@/lib/store';
import { EmojiPicker } from './EmojiPicker';

interface MessageItemProps {
    message: Message;
    isOwn: boolean;
    showReadReceipts: boolean;
    animationDelay?: number;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function FileAttachmentItem({ file }: { file: FileAttachment }) {
    const isImage = file.file_type.startsWith('image');

    if (isImage) {
        return (
            <div className="mt-2 rounded-xl overflow-hidden max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={file.file_url}
                    alt={file.file_name}
                    className="w-full h-auto"
                />
            </div>
        );
    }

    return (
        <a
            href={file.file_url}
            download={file.file_name}
            className="
        mt-2 flex items-center gap-3 p-3 rounded-xl
        bg-[var(--color-bg-secondary)]
        hover:bg-[var(--color-bg-tertiary)]
        transition-colors group
      "
        >
            <div className="p-2 rounded-lg bg-[var(--color-accent-light)]">
                <FileText size={16} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] truncate">
                    {file.file_name}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                    {formatFileSize(file.file_size)}
                </p>
            </div>
            <Download
                size={16}
                className="text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </a>
    );
}

export function MessageItem({ message, isOwn, showReadReceipts, animationDelay = 0 }: MessageItemProps) {
    const { addReaction, removeReaction, currentProfile } = useAppStore();
    const [showPicker, setShowPicker] = useState(false);

    const sender = mockProfiles.find((p) => p.id === message.sender_id);
    const readByUsers = message.reads?.map((read) =>
        mockProfiles.find((p) => p.id === read.profile_id)
    ).filter(Boolean) || [];

    // Group reactions by emoji
    const reactionCounts = (message.reactions || []).reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const hasReacted = (emoji: string) => {
        return message.reactions?.some(
            r => r.emoji === emoji && r.profile_id === currentProfile?.id
        );
    };

    const handleReaction = (emoji: string) => {
        if (hasReacted(emoji)) {
            removeReaction(message.id, emoji);
        } else {
            addReaction(message.id, emoji);
        }
        setShowPicker(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: animationDelay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`flex gap-3 group relative ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            {!isOwn && (
                <Avatar
                    src={sender?.avatar_url}
                    alt={sender?.display_name}
                    size="md"
                />
            )}

            {/* Message Content */}
            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Sender Name */}
                {!isOwn && (
                    <span className="text-xs text-[var(--color-text-tertiary)] mb-1 ml-1">
                        {sender?.display_name}
                    </span>
                )}

                {/* Message Bubble Container */}
                <div className="relative">
                    {/* Picker Trigger (Hover) */}
                    <div className={`
                        absolute top-0 bottom-0 flex items-center 
                        ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     `}>
                        <button
                            onClick={() => setShowPicker(!showPicker)}
                            className="
                                p-1.5 rounded-full
                                text-[var(--color-text-tertiary)]
                                hover:bg-[var(--color-bg-tertiary)]
                                hover:text-[var(--color-text-secondary)]
                                transition-colors
                            "
                        >
                            <Smile size={18} />
                        </button>

                        {/* Picker */}
                        <AnimatePresence>
                            {showPicker && (
                                <div className="absolute bottom-full mb-2 z-50">
                                    <EmojiPicker
                                        onSelect={handleReaction}
                                        onClose={() => setShowPicker(false)}
                                    />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Message Bubble */}
                    <div
                        className={`
                            px-4 py-3 rounded-2xl
                            ${isOwn
                                ? 'bg-[var(--color-accent)] text-white rounded-br-md'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-bl-md'
                            }
                        `}
                    >
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    </div>
                </div>

                {/* File Attachments */}
                {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {message.files.map((file) => (
                            <FileAttachmentItem key={file.id} file={file} />
                        ))}
                    </div>
                )}

                {/* Reactions Display */}
                {Object.keys(reactionCounts).length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className={`
                                    flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border
                                    transition-all
                                    ${hasReacted(emoji)
                                        ? 'bg-[var(--color-accent-light)] border-[var(--color-accent)] text-[var(--color-accent-dark)]'
                                        : 'bg-[var(--color-bg-secondary)] border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                                    }
                                `}
                            >
                                <span>{emoji}</span>
                                <span className={hasReacted(emoji) ? 'text-[var(--color-accent)]' : ''}>{count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Timestamp & Read Receipts */}
                <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-[var(--color-text-muted)]" suppressHydrationWarning>
                        {format(new Date(message.created_at), 'HH:mm', { locale: ja })}
                    </span>

                    {/* Read Receipts */}
                    {isOwn && showReadReceipts && (
                        <div className="flex items-center gap-1">
                            {readByUsers.length > 0 ? (
                                <>
                                    <CheckCheck size={14} className="text-[var(--color-accent)]" />
                                    <AvatarGroup
                                        avatars={readByUsers.map((u) => ({
                                            src: u?.avatar_url,
                                            alt: u?.display_name,
                                        }))}
                                        max={3}
                                        size="sm"
                                    />
                                </>
                            ) : (
                                <Check size={14} className="text-[var(--color-text-muted)]" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
