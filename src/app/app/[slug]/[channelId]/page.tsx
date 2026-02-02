'use client';

import { useEffect, useState, useRef, use, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Hash, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useAppStore, useCurrentChatMessages, useProfilesForOrg } from '@/lib/store';
import { Card, Button } from '@/components/ui';
import { mockOrganizations, mockChatRooms } from '@/lib/mockData';
import { MAX_FILE_SIZE_BYTES, Profile, Message } from '@/types';

// イニシャルアバター
function InitialAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const sizeClasses = { sm: 'w-6 h-6 text-xs', md: 'w-10 h-10 text-sm' };
    const colors = ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-medium`}>
            {initial}
        </div>
    );
}

// タイピングインジケーター
function TypingIndicator({ names }: { names: string[] }) {
    if (names.length === 0) return null;
    const text = names.length === 1
        ? `${names[0]}が入力中...`
        : `${names.slice(0, 2).join(', ')}${names.length > 2 ? `他${names.length - 2}名` : ''}が入力中...`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)] px-4 py-2"
        >
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{text}</span>
        </motion.div>
    );
}

interface PageProps {
    params: Promise<{ slug: string; channelId: string }>;
}

export default function ChatPage({ params }: PageProps) {
    const { slug, channelId } = use(params);

    // Selective subscriptions to prevent infinite loops
    const currentOrganization = useAppStore((s) => s.currentOrganization);
    const currentChatRoom = useAppStore((s) => s.currentChatRoom);
    const currentProfile = useAppStore((s) => s.currentProfile);
    const setCurrentOrganization = useAppStore((s) => s.setCurrentOrganization);
    const setCurrentChatRoom = useAppStore((s) => s.setCurrentChatRoom);
    const sendMessage = useAppStore((s) => s.sendMessage);
    const markMessageAsRead = useAppStore((s) => s.markMessageAsRead);
    const typingUsers = useAppStore((s) => s.typingUsers);
    const setTyping = useAppStore((s) => s.setTyping);

    const messages = useCurrentChatMessages();
    const orgProfiles = useProfilesForOrg(currentOrganization?.id || '');

    const [newMessage, setNewMessage] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [sendingMessage, setSendingMessage] = useState<{ content: string; startTime: number } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevSlugRef = useRef<string | null>(null);
    const prevChannelRef = useRef<string | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load org and room - with refs to prevent infinite loops
    useEffect(() => {
        if (slug !== prevSlugRef.current) {
            prevSlugRef.current = slug;
            const org = mockOrganizations.find((o) => o.slug === slug);
            if (org && org.id !== currentOrganization?.id) {
                setCurrentOrganization(org);
            }
        }

        if (channelId !== prevChannelRef.current) {
            prevChannelRef.current = channelId;
            const room = mockChatRooms.find((r) => r.id === channelId);
            if (room && room.id !== currentChatRoom?.id) {
                setCurrentChatRoom(room);
            }
        }
    }, [slug, channelId, currentOrganization?.id, currentChatRoom?.id, setCurrentOrganization, setCurrentChatRoom]);

    // Mark messages as read - only for new messages
    const prevMessageCountRef = useRef(0);
    useEffect(() => {
        if (messages.length > prevMessageCountRef.current && currentProfile) {
            messages.slice(prevMessageCountRef.current).forEach((msg) => {
                if (msg.sender_id !== currentProfile.id) {
                    markMessageAsRead(msg.id);
                }
            });
        }
        prevMessageCountRef.current = messages.length;
    }, [messages.length, currentProfile?.id, markMessageAsRead]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Handle typing indicator
    const handleInputChange = useCallback((value: string) => {
        setNewMessage(value);

        if (currentChatRoom && currentProfile && value) {
            setTyping(currentChatRoom.id, currentProfile.id);

            // Clear typing after 2 seconds of inactivity
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                // Would call clearTyping here in production
            }, 2000);
        }
    }, [currentChatRoom, currentProfile, setTyping]);

    const handleSend = async () => {
        if (!newMessage.trim() && attachedFiles.length === 0) return;

        const startTime = performance.now();
        setSendingMessage({ content: newMessage, startTime });

        // Simulate network delay for demo
        await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        sendMessage(newMessage, attachedFiles, duration);
        setNewMessage('');
        setAttachedFiles([]);
        setSendingMessage(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);
        if (validFiles.length < files.length) {
            alert('200MBを超えるファイルは除外されました');
        }
        setAttachedFiles((prev) => [...prev, ...validFiles]);
    };

    const getSenderProfile = (senderId: string): Profile | undefined => {
        return orgProfiles.find((p) => p.id === senderId);
    };

    // Get typing users excluding self
    const typingUserNames = (typingUsers[currentChatRoom?.id || ''] || [])
        .filter((t) => t.profileId !== currentProfile?.id)
        .map((t) => {
            const profile = orgProfiles.find((p) => p.id === t.profileId);
            return profile?.display_name || 'Someone';
        });

    if (!currentChatRoom) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-pulse text-[var(--color-text-tertiary)]">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Chat Header */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-bg-tertiary)]"
            >
                <Hash size={20} className="text-[var(--color-text-tertiary)]" />
                <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {currentChatRoom.name}
                </h1>
                {currentChatRoom.description && (
                    <>
                        <span className="text-[var(--color-text-muted)]">|</span>
                        <span className="text-sm text-[var(--color-text-tertiary)]">
                            {currentChatRoom.description}
                        </span>
                    </>
                )}
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => {
                    const sender = getSenderProfile(msg.sender_id);
                    const isOwn = msg.sender_id === currentProfile?.id;

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                            {sender?.avatar_url ? (
                                <img src={sender.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <InitialAvatar name={sender?.display_name || '?'} />
                            )}
                            <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                                <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {sender?.display_name || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        {new Date(msg.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <Card hoverable={false} delay={0}>
                                    <div className="p-3">
                                        <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                        {msg.files && msg.files.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {msg.files.map((file) => (
                                                    <div key={file.id} className="text-sm text-[var(--color-accent)] hover:underline">
                                                        📎 {file.file_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Status: Read Receipt + Send Duration */}
                                {isOwn && (
                                    <div className="flex items-center gap-2 mt-1 justify-end">
                                        {currentOrganization?.read_receipt_enabled && (
                                            <>
                                                {msg.reads && msg.reads.length > 0 ? (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCheck size={14} className="text-[var(--color-accent)]" />
                                                        <span className="text-xs text-[var(--color-text-tertiary)]">
                                                            {msg.reads.length}人が既読
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Check size={14} className="text-[var(--color-text-muted)]" />
                                                )}
                                            </>
                                        )}
                                        {msg.sendDuration && (
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                {msg.sendDuration}ms
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {/* Sending message indicator */}
                {sendingMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 flex-row-reverse"
                    >
                        {currentProfile?.avatar_url ? (
                            <img src={currentProfile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <InitialAvatar name={currentProfile?.display_name || '?'} />
                        )}
                        <div className="max-w-[70%]">
                            <Card hoverable={false} delay={0}>
                                <div className="p-3 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-[var(--color-accent)]" />
                                    <p className="text-[var(--color-text-secondary)]">
                                        {sendingMessage.content}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* Typing indicator */}
                <AnimatePresence>
                    <TypingIndicator names={typingUserNames} />
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-bg-tertiary)]">
                {attachedFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {attachedFiles.map((file, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-bg-secondary)] rounded-full text-sm text-[var(--color-text-secondary)]"
                            >
                                📎 {file.name}
                                <button
                                    onClick={() => setAttachedFiles((prev) => prev.filter((_, j) => j !== i))}
                                    className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={18} />
                    </Button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="メッセージを入力..."
                        className="
                            flex-1 px-4 py-3 rounded-xl
                            bg-[var(--color-bg-secondary)]
                            text-[var(--color-text-primary)]
                            placeholder:text-[var(--color-text-muted)]
                            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]
                        "
                    />
                    <Button
                        onClick={handleSend}
                        disabled={(!newMessage.trim() && attachedFiles.length === 0) || !!sendingMessage}
                        isLoading={!!sendingMessage}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
