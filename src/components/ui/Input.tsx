'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-4 py-3 rounded-xl
            bg-[var(--color-bg-secondary)]
            border border-transparent
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            transition-all duration-200
            focus:outline-none focus:bg-[var(--color-bg-primary)]
            focus:border-[var(--color-accent)]
            focus:ring-2 focus:ring-[var(--color-accent-light)]
            ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-red-100' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, rows = 4, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    rows={rows}
                    className={`
            w-full px-4 py-3 rounded-xl
            bg-[var(--color-bg-secondary)]
            border border-transparent
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            transition-all duration-200
            focus:outline-none focus:bg-[var(--color-bg-primary)]
            focus:border-[var(--color-accent)]
            focus:ring-2 focus:ring-[var(--color-accent-light)]
            resize-none
            ${error ? 'border-[var(--color-error)]' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
