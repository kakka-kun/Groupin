// ============================================
// Groupin - Type Definitions (Production)
// ============================================

// ============================================
// Organization Types
// ============================================
export type OrgCategory = 'company' | 'school' | 'community';

export interface Organization {
    id: string;
    slug: string;
    name: string;
    description?: string;
    category: OrgCategory;
    icon_url?: string;
    invite_code?: string;
    read_receipt_enabled: boolean;
    created_at: Date;
    updated_at?: Date;
}

// カテゴリ別デフォルト役割
export const CATEGORY_ROLES: Record<OrgCategory, string[]> = {
    company: ['オーナー', 'マネージャー', 'メンバー'],
    school: ['顧問', '部長', '部員'],
    community: ['管理者', 'スタッフ', 'メンバー'],
};

export const CATEGORY_LABELS: Record<OrgCategory, string> = {
    company: '企業',
    school: '学校（部活/委員会）',
    community: 'コミュニティ',
};

// ============================================
// User / Profile Types
// ============================================
export interface User {
    id: string;
    email: string;
    default_name: string;
    default_avatar_url?: string;
    created_at: Date;
}

// 団体別プロフィール
export interface Profile {
    id: string;
    user_id: string;
    org_id: string;
    display_name: string;
    avatar_url?: string;
    role: string;
    joined_at: Date;
}

// ============================================
// Chat / Message Types
// ============================================
export interface ChatRoom {
    id: string;
    org_id: string;
    name: string;
    description?: string;
    created_at: Date;
}

export interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    created_at: Date;
    updated_at?: Date;
    files?: FileAttachment[];
    reads?: MessageRead[];
    reactions?: MessageReaction[];
    sendDuration?: number; // ms - time it took to send
    status?: 'sending' | 'sent' | 'failed';
    // Populated from join
    sender?: Profile;
}

// ============================================
// Read Receipt Types
// ============================================
export interface MessageRead {
    message_id: string;
    profile_id: string;
    read_at: Date;
    // Populated from join
    profile?: Profile;
}

// ============================================
// Reaction Types
// ============================================
export interface MessageReaction {
    id: string;
    message_id: string;
    profile_id: string;
    emoji: string;
    created_at: Date;
    // Populated from join
    profile?: Profile;
}

// ============================================
// File Attachment Types
// ============================================
export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

export interface FileAttachment {
    id: string;
    message_id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_at: Date;
}

// ============================================
// Admin Announcement Types
// ============================================
export interface AdminAnnouncement {
    id: string;
    title: string;
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    is_read?: boolean;
    created_at: Date;
}

// ============================================
// SWR Fetcher
// ============================================
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
