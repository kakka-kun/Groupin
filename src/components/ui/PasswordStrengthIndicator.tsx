'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
    password: string;
    showRequirements?: boolean;
}

type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong';

interface Requirement {
    label: string;
    check: (password: string) => boolean;
}

const requirements: Requirement[] = [
    { label: '8文字以上', check: (p) => p.length >= 8 },
    { label: '大文字を含む', check: (p) => /[A-Z]/.test(p) },
    { label: '小文字を含む', check: (p) => /[a-z]/.test(p) },
    { label: '数字を含む', check: (p) => /[0-9]/.test(p) },
    { label: '記号を含む', check: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function calculateStrength(password: string): { level: StrengthLevel; score: number } {
    if (!password) return { level: 'weak', score: 0 };

    let score = 0;
    requirements.forEach((req) => {
        if (req.check(password)) score++;
    });

    if (score <= 1) return { level: 'weak', score };
    if (score <= 2) return { level: 'medium', score };
    if (score <= 4) return { level: 'strong', score };
    return { level: 'very-strong', score };
}

const strengthConfig: Record<StrengthLevel, { label: string; color: string; bgColor: string }> = {
    'weak': { label: '弱い', color: 'bg-red-500', bgColor: 'bg-red-100' },
    'medium': { label: '普通', color: 'bg-yellow-500', bgColor: 'bg-yellow-100' },
    'strong': { label: '強い', color: 'bg-green-500', bgColor: 'bg-green-100' },
    'very-strong': { label: 'とても強い', color: 'bg-blue-500', bgColor: 'bg-blue-100' },
};

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
    const { level, score } = useMemo(() => calculateStrength(password), [password]);
    const config = strengthConfig[level];
    const percentage = (score / requirements.length) * 100;

    if (!password) return null;

    return (
        <div className="mt-2 space-y-3">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-tertiary)]">パスワード強度</span>
                    <span className={`font-medium ${level === 'weak' ? 'text-red-500' :
                            level === 'medium' ? 'text-yellow-600' :
                                level === 'strong' ? 'text-green-500' :
                                    'text-blue-500'
                        }`}>
                        {config.label}
                    </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${config.color}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Requirements List */}
            {showRequirements && (
                <div className="grid grid-cols-2 gap-1.5">
                    {requirements.map((req, index) => {
                        const met = req.check(password);
                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-[var(--color-text-muted)]'
                                    }`}
                            >
                                {met ? (
                                    <Check size={12} className="text-green-500" />
                                ) : (
                                    <X size={12} className="text-[var(--color-text-muted)]" />
                                )}
                                <span>{req.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function validatePasswordStrength(password: string): boolean {
    const { score } = calculateStrength(password);
    return score >= 3; // At least "strong" level
}
