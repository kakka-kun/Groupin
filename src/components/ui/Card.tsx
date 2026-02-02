'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
    delay?: number;
}

export function Card({ children, className = '', onClick, hoverable = true, delay = 0 }: CardProps) {
    return (
        <motion.div
            className={`
        bg-[var(--color-bg-card)] rounded-2xl
        shadow-[var(--shadow-card)]
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={hoverable ? {
                y: -4,
                boxShadow: 'var(--shadow-card-hover)',
                transition: { duration: 0.2 },
            } : undefined}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`p-6 pb-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`px-6 pb-6 ${className}`}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-[var(--color-bg-tertiary)] ${className}`}>
            {children}
        </div>
    );
}
