import {
    Organization,
    Profile,
    ChatRoom,
    Message,
    AdminAnnouncement,
} from '@/types';

// ============================================
// Mock Profiles (グローバルユーザー)
// ============================================
export const mockUsers = [
    {
        id: 'user-1',
        email: 'demo@groupin.jp',
        default_name: 'デモユーザー',
        default_avatar_url: null,
        created_at: new Date('2024-01-15'),
    },
    {
        id: 'user-2',
        email: 'tanaka@example.com',
        default_name: '田中 太郎',
        default_avatar_url: null,
        created_at: new Date('2024-02-01'),
    },
];

// ============================================
// Mock Organizations
// ============================================
export const mockOrganizations: Organization[] = [
    {
        id: 'org-1',
        slug: 'tech-startup',
        name: 'テックスタートアップ株式会社',
        description: 'イノベーションを創造する技術集団',
        category: 'company',
        icon_url: undefined,
        invite_code: 'tech123',
        read_receipt_enabled: true,
        created_at: new Date('2024-01-01'),
    },
    {
        id: 'org-2',
        slug: 'soccer-club',
        name: '東京高校サッカー部',
        description: '全国大会を目指して日々練習',
        category: 'school',
        icon_url: undefined,
        invite_code: 'soccer456',
        read_receipt_enabled: true,
        created_at: new Date('2024-02-01'),
    },
    {
        id: 'org-3',
        slug: 'design-community',
        name: 'デザインコミュニティ',
        description: 'デザイナーの交流の場',
        category: 'community',
        icon_url: undefined,
        invite_code: 'design789',
        read_receipt_enabled: false,
        created_at: new Date('2024-03-01'),
    },
];

// ============================================
// Mock Profiles (団体別プロフィール)
// ============================================
export const mockProfiles: Profile[] = [
    // Tech Startup
    {
        id: 'profile-1',
        user_id: 'user-1',
        org_id: 'org-1',
        display_name: '開発リーダー',
        avatar_url: undefined,
        role: 'オーナー',
        joined_at: new Date('2024-01-01'),
    },
    {
        id: 'profile-2',
        user_id: 'user-2',
        org_id: 'org-1',
        display_name: '田中（エンジニア）',
        avatar_url: undefined,
        role: 'メンバー',
        joined_at: new Date('2024-01-05'),
    },
    // Soccer Club
    {
        id: 'profile-3',
        user_id: 'user-1',
        org_id: 'org-2',
        display_name: 'サッカー太郎',
        avatar_url: undefined,
        role: '部員',
        joined_at: new Date('2024-02-01'),
    },
    // Design Community
    {
        id: 'profile-4',
        user_id: 'user-1',
        org_id: 'org-3',
        display_name: 'デザイナーD',
        avatar_url: undefined,
        role: 'メンバー',
        joined_at: new Date('2024-03-01'),
    },
];

// ============================================
// Mock Chat Rooms
// ============================================
export const mockChatRooms: ChatRoom[] = [
    // Tech Startup
    { id: 'chat-1', org_id: 'org-1', name: '一般', description: '全体的な話題', created_at: new Date('2024-01-01') },
    { id: 'chat-2', org_id: 'org-1', name: '開発チーム', description: '開発議論', created_at: new Date('2024-01-02') },
    { id: 'chat-3', org_id: 'org-1', name: 'ランダム', description: '雑談', created_at: new Date('2024-01-03') },
    // Soccer Club
    { id: 'chat-4', org_id: 'org-2', name: '連絡', description: '練習・試合連絡', created_at: new Date('2024-02-01') },
    { id: 'chat-5', org_id: 'org-2', name: '雑談', description: '部活以外', created_at: new Date('2024-02-02') },
    // Design Community
    { id: 'chat-6', org_id: 'org-3', name: 'レビュー', description: 'フィードバック', created_at: new Date('2024-03-01') },
    { id: 'chat-7', org_id: 'org-3', name: 'インスピ', description: 'アイデア共有', created_at: new Date('2024-03-02') },
];

// ============================================
// Mock Messages
// ============================================
export const mockMessages: Message[] = [
    {
        id: 'msg-1',
        room_id: 'chat-1',
        sender_id: 'profile-1',
        content: 'おはようございます！今日のミーティングは10時からです。',
        created_at: new Date('2024-03-20T09:00:00'),
        reads: [
            { message_id: 'msg-1', profile_id: 'profile-2', read_at: new Date('2024-03-20T09:05:00') },
        ],
    },
    {
        id: 'msg-2',
        room_id: 'chat-1',
        sender_id: 'profile-2',
        content: '了解です！準備しておきます。',
        created_at: new Date('2024-03-20T09:05:00'),
        reads: [],
    },
];

// ============================================
// Mock Announcements
// ============================================
export const mockAnnouncements: AdminAnnouncement[] = [
    {
        id: 'ann-1',
        title: 'Groupinへようこそ！',
        content: 'Groupinをご利用いただきありがとうございます。団体ごとに異なるプロフィールを使い分けて、快適なコミュニケーションをお楽しみください。',
        priority: 'normal',
        is_read: false,
        created_at: new Date('2024-03-15T14:00:00'),
    },
    {
        id: 'ann-2',
        title: 'ファイル共有機能',
        content: '最大200MBまでのファイルをドラッグ&ドロップでアップロードできます。',
        priority: 'normal',
        is_read: true,
        created_at: new Date('2024-03-10T09:00:00'),
    },
];

// ============================================
// Current User (デモ用)
// ============================================
export const currentUser = mockUsers[0];

// Helper: Get profile for org
export function getProfileForOrg(userId: string, orgId: string): Profile | undefined {
    return mockProfiles.find((p) => p.user_id === userId && p.org_id === orgId);
}

// Helper: Get chat rooms for org
export function getChatRoomsForOrg(orgId: string): ChatRoom[] {
    return mockChatRooms.filter((r) => r.org_id === orgId);
}

// Helper: Get messages for room
export function getMessagesForRoom(roomId: string): Message[] {
    return mockMessages.filter((m) => m.room_id === roomId);
}
