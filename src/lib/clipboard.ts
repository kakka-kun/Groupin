'use client';

/**
 * Safe clipboard utility with fallback for non-secure environments (HTTP)
 * and browsers that don't support the Clipboard API
 */
export async function safeClipboardWrite(text: string): Promise<boolean> {
    // Try the modern Clipboard API first
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall through to legacy method
        }
    }

    // Fallback for HTTP or unsupported browsers using execCommand
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);

        // Select text
        textarea.focus();
        textarea.select();

        // Try to copy
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    } catch {
        return false;
    }
}
