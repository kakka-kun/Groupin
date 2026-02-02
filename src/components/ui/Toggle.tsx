'use client';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled = false }: ToggleProps) {
    return (
        <label className={`flex items-start gap-4 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
          relative inline-flex h-6 w-11 flex-shrink-0
          rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-[var(--color-accent)]
          ${checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-tertiary)]'}
        `}
            >
                <span
                    className={`
            inline-block h-5 w-5 transform rounded-full
            bg-white shadow-md
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}
            mt-0.5
          `}
                />
            </button>
            {(label || description) && (
                <div className="flex-1">
                    {label && (
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {label}
                        </span>
                    )}
                    {description && (
                        <p className="text-sm text-[var(--color-text-tertiary)] mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </label>
    );
}
