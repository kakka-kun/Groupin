'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image, Film, Music, Archive, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES } from '@/types';
import { Button } from '@/components/ui';

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void;
    maxSize?: number;
}

const FILE_ICONS: Record<string, typeof FileText> = {
    'image': Image,
    'video': Film,
    'audio': Music,
    'application/zip': Archive,
    'application/x-rar': Archive,
};

function getFileIcon(type: string) {
    if (type.startsWith('image')) return Image;
    if (type.startsWith('video')) return Film;
    if (type.startsWith('audio')) return Music;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return FileText;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FileUploader({ onFilesSelected, maxSize = MAX_FILE_SIZE_BYTES }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFiles = useCallback((files: FileList | File[]): { valid: File[]; errors: string[] } => {
        const validFiles: File[] = [];
        const fileErrors: string[] = [];

        Array.from(files).forEach((file) => {
            if (file.size > maxSize) {
                fileErrors.push(`${file.name}: ファイルサイズが${formatFileSize(maxSize)}を超えています`);
            } else {
                validFiles.push(file);
            }
        });

        return { valid: validFiles, errors: fileErrors };
    }, [maxSize]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const { valid, errors: fileErrors } = validateFiles(e.dataTransfer.files);
        setErrors(fileErrors);

        if (valid.length > 0) {
            setSelectedFiles((prev) => [...prev, ...valid]);
        }
    }, [validateFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const { valid, errors: fileErrors } = validateFiles(e.target.files);
        setErrors(fileErrors);

        if (valid.length > 0) {
            setSelectedFiles((prev) => [...prev, ...valid]);
        }
    }, [validateFiles]);

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onFilesSelected(selectedFiles);
            setSelectedFiles([]);
            setErrors([]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <motion.div
                className={`
          relative border-2 border-dashed rounded-2xl p-8
          transition-colors duration-200
          ${isDragging
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                        : 'border-[var(--color-bg-tertiary)] hover:border-[var(--color-text-muted)]'
                    }
        `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                animate={{ scale: isDragging ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="flex flex-col items-center gap-4 text-center">
                    <motion.div
                        className={`
              p-4 rounded-full
              ${isDragging ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-tertiary)]'}
            `}
                        animate={{ y: isDragging ? -4 : 0 }}
                    >
                        <Upload
                            size={24}
                            className={isDragging ? 'text-white' : 'text-[var(--color-text-tertiary)]'}
                        />
                    </motion.div>

                    <div>
                        <p className="text-[var(--color-text-primary)] font-medium">
                            ファイルをドラッグ&ドロップ
                        </p>
                        <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
                            または
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[var(--color-accent)] hover:underline mx-1"
                            >
                                ファイルを選択
                            </button>
                            （最大 {formatFileSize(maxSize)}）
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Error Messages */}
            <AnimatePresence>
                {errors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2"
                    >
                        {errors.map((error, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-[var(--color-error)] text-sm"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selected Files */}
            <AnimatePresence>
                {selectedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                    >
                        {selectedFiles.map((file, index) => {
                            const Icon = getFileIcon(file.type);
                            return (
                                <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]"
                                >
                                    <div className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]">
                                        <Icon size={16} className="text-[var(--color-text-tertiary)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--color-text-primary)] truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-tertiary)]">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                                    >
                                        <X size={16} className="text-[var(--color-text-tertiary)]" />
                                    </button>
                                </motion.div>
                            );
                        })}

                        <Button onClick={handleUpload} className="w-full mt-4">
                            {selectedFiles.length}件のファイルを添付
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
