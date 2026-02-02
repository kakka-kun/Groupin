'use client';

import { motion } from 'framer-motion';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀', '👀'];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="
                    absolute bottom-full mb-2 left-0 z-50
                    bg-[var(--color-bg-card)] 
                    border border-[var(--color-bg-tertiary)]
                    rounded-full shadow-lg p-1.5
                    flex items-center gap-1
                "
            >
                {COMMON_EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(emoji);
                        }}
                        className="
                            w-8 h-8 flex items-center justify-center
                            text-lg
                            hover:bg-[var(--color-bg-tertiary)] 
                            rounded-full
                            transition-colors
                        "
                    >
                        {emoji}
                    </button>
                ))}
            </motion.div>
        </>
    );
}

export const REACTION_LIMIT = 5;
