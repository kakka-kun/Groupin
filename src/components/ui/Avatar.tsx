'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
};

export function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
    const dimension = sizes[size];

    if (!src) {
        return (
            <div
                className={`
          flex items-center justify-center rounded-full
          bg-[var(--color-bg-tertiary)]
          text-[var(--color-text-tertiary)]
          ${className}
        `}
                style={{ width: dimension, height: dimension }}
            >
                <User size={dimension * 0.5} />
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-full overflow-hidden bg-[var(--color-bg-tertiary)] ${className}`}
            style={{ width: dimension, height: dimension }}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
            />
        </div>
    );
}

interface AvatarGroupProps {
    avatars: { src?: string; alt?: string }[];
    max?: number;
    size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ avatars, max = 3, size = 'sm' }: AvatarGroupProps) {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;
    const dimension = sizes[size];

    return (
        <div className="flex -space-x-2">
            {visibleAvatars.map((avatar, index) => (
                <div
                    key={index}
                    className="relative ring-2 ring-[var(--color-bg-card)] rounded-full"
                    style={{ zIndex: visibleAvatars.length - index }}
                >
                    <Avatar src={avatar.src} alt={avatar.alt} size={size} />
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className={`
            flex items-center justify-center rounded-full
            bg-[var(--color-bg-tertiary)]
            text-[var(--color-text-secondary)]
            text-xs font-medium
            ring-2 ring-[var(--color-bg-card)]
          `}
                    style={{ width: dimension, height: dimension }}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}
