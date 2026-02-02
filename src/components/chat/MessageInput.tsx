'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { FileUploader } from './FileUploader';

interface MessageInputProps {
    onSend: (content: string, files?: File[]) => void;
    disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [message]);

    const handleSubmit = () => {
        if ((message.trim() || attachedFiles.length > 0) && !disabled) {
            onSend(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
            setMessage('');
            setAttachedFiles([]);
            setShowFileUploader(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleFilesSelected = (files: File[]) => {
        setAttachedFiles((prev) => [...prev, ...files]);
        setShowFileUploader(false);
    };

    const removeAttachedFile = (index: number) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="border-t border-[var(--color-bg-tertiary)] bg-[var(--color-bg-card)] p-4">
            {/* File Uploader Modal */}
            <AnimatePresence>
                {showFileUploader && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mb-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)]"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                                ファイルを添付
                            </h3>
                            <button
                                onClick={() => setShowFileUploader(false)}
                                className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                            >
                                <X size={16} className="text-[var(--color-text-tertiary)]" />
                            </button>
                        </div>
                        <FileUploader onFilesSelected={handleFilesSelected} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attached Files Preview */}
            <AnimatePresence>
                {attachedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 mb-3"
                    >
                        {attachedFiles.map((file, index) => (
                            <motion.div
                                key={`${file.name}-${index}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-sm"
                            >
                                <span className="truncate max-w-[120px]">{file.name}</span>
                                <button
                                    onClick={() => removeAttachedFile(index)}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="flex items-end gap-2">
                {/* Attachment Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUploader(!showFileUploader)}
                    className="flex-shrink-0"
                >
                    <Paperclip size={20} />
                </Button>

                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="メッセージを入力..."
                        disabled={disabled}
                        rows={1}
                        className="
              w-full px-4 py-3 rounded-2xl
              bg-[var(--color-bg-secondary)]
              text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-muted)]
              resize-none
              focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]
              disabled:opacity-50
            "
                    />
                </div>

                {/* Emoji Button (Placeholder) */}
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Smile size={20} />
                </Button>

                {/* Send Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={disabled || (!message.trim() && attachedFiles.length === 0)}
                    className="flex-shrink-0"
                >
                    <Send size={18} />
                </Button>
            </div>
        </div>
    );
}
