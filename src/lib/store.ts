'use client';

import { create } from 'zustand';
import {
    Organization,
    Profile,
    ChatRoom,
    Message,
    AdminAnnouncement,
    MessageReaction,
} from '@/types';
import {
    mockOrganizations,
    mockProfiles,
    mockChatRooms,
    mockMessages,
    mockAnnouncements,
} from './mockData';

// ============================================
// Typing State
// ============================================
interface TypingUser {
    profileId: string;
    timestamp: number;
}

// ============================================
// Store Interface
// ============================================
interface AppState {
    // Auth
    isAuthenticated: boolean;
    currentUserId: string | null;
    isSystemAdmin: boolean;
    adminSetupCompleted: boolean;
    adminEmail: string | null;
    adminPasswordHash: string | null;

    // Demo Mode
    isDemoMode: boolean;
    demoSessionId: string | null;

    // Data
    organizations: Organization[];
    profiles: Profile[];
    chatRooms: ChatRoom[];
    messages: Message[];
    announcements: AdminAnnouncement[];

    // Current selections
    currentOrganization: Organization | null;
    currentChatRoom: ChatRoom | null;
    currentProfile: Profile | null;

    // Typing state
    typingUsers: { [roomId: string]: TypingUser[] };

    // UI State
    isDarkMode: boolean;
    isSidebarOpen: boolean;
    isObserverMode: boolean; // New

    // Actions
    login: (userId: string) => boolean; // Changed
    enterObserverMode: () => void; // New
    exitObserverMode: () => void; // New
    logout: () => void;
    demoLogin: () => void;
    adminLogin: (email: string, password: string) => boolean;
    completeAdminSetup: (email: string, password: string) => void;
    setCurrentOrganization: (org: Organization | null) => void;
    setCurrentChatRoom: (room: ChatRoom | null) => void;
    sendMessage: (content: string, files?: File[], sendDuration?: number) => void;
    markMessageAsRead: (messageId: string) => void;
    markAnnouncementAsRead: (announcementId: string) => void;
    toggleReadReceipt: (orgId: string) => void;
    toggleDarkMode: () => void;
    toggleSidebar: () => void;
    updateProfile: (profileId: string, data: Partial<Profile>) => void;
    updateOrganization: (orgId: string, data: Partial<Organization>) => void;
    setTyping: (roomId: string, profileId: string) => void;
    clearTyping: (roomId: string, profileId: string) => void;
    addOrganization: (org: Organization) => void;
    addProfile: (profile: Profile) => void;
    addChatRoom: (room: ChatRoom) => void;
    deleteChatRoom: (roomId: string) => void;
    joinOrganization: (inviteCode: string, displayName: string) => Organization | null;
    addReaction: (messageId: string, emoji: string) => boolean;
    removeReaction: (messageId: string, emoji: string) => void;
}

// ============================================
// LocalStorage helpers
// ============================================
const ANNOUNCEMENT_READS_KEY = 'groupin_announcement_reads';

function getAnnouncementReads(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(ANNOUNCEMENT_READS_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveAnnouncementRead(announcementId: string): void {
    if (typeof window === 'undefined') return;
    const reads = getAnnouncementReads();
    if (!reads.includes(announcementId)) {
        reads.push(announcementId);
        localStorage.setItem(ANNOUNCEMENT_READS_KEY, JSON.stringify(reads));
    }
}

// Initialize announcements with persisted read states
function initializeAnnouncements() {
    const readIds = getAnnouncementReads();
    return mockAnnouncements.map((ann) => ({
        ...ann,
        is_read: readIds.includes(ann.id),
    }));
}

// ============================================
// Store
// ============================================
export const useAppStore = create<AppState>((set, get) => ({
    // Initial State
    isAuthenticated: false,
    currentUserId: null,
    isSystemAdmin: false,
    adminSetupCompleted: false, // In a real app, check DB. For demo, default to false.
    adminEmail: null,
    adminPasswordHash: null,

    isDemoMode: false,
    demoSessionId: null,

    // Observer Mode (Admin)
    isObserverMode: false,

    organizations: mockOrganizations,
    profiles: mockProfiles,
    chatRooms: mockChatRooms,
    messages: mockMessages,
    announcements: initializeAnnouncements(),
    currentOrganization: null,
    currentChatRoom: null,
    currentProfile: null,
    typingUsers: {},
    isDarkMode: false,
    isSidebarOpen: true,

    // Auth Actions
    login: (userId: string) => {
        // Mock DB Check: In real app, this would happen on server
        // For now, we assume if userId exists in profile list or is a known ID
        // Simplified: 'user-1' is our standard dev user.
        // If unknown, we want to return false to prompt signup.
        const isValidUser = userId === 'user-1' || userId === 'admin';

        if (isValidUser) {
            set({ isAuthenticated: true, currentUserId: userId, isSystemAdmin: false, isDemoMode: false });
            return true;
        }
        return false;
    },

    logout: () => {
        set({
            isAuthenticated: false,
            currentUserId: null,
            isSystemAdmin: false,
            isDemoMode: false,
            demoSessionId: null,
            isObserverMode: false,
            currentOrganization: null,
            currentChatRoom: null,
            currentProfile: null,
        });
    },

    demoLogin: () => {
        const sessionId = `demo-${Date.now()}`;
        set({
            isAuthenticated: true,
            currentUserId: 'user-1',
            isSystemAdmin: false,
            isDemoMode: true, // Explicitly marked as demo
            demoSessionId: sessionId,
        });
    },

    adminLogin: (email, password) => {
        const state = get();
        if (!state.adminSetupCompleted) {
            if (email === 'admin' && password === 'admin') {
                return true;
            }
        } else {
            if (email === state.adminEmail && password === state.adminPasswordHash) {
                set({ isAuthenticated: true, isSystemAdmin: true, isDemoMode: false });
                return true;
            }
        }
        return false;
    },

    completeAdminSetup: (email, password) => {
        set({
            adminSetupCompleted: true,
            adminEmail: email,
            adminPasswordHash: password,
            isAuthenticated: true,
            isSystemAdmin: true,
            isDemoMode: false,
            currentUserId: 'admin',
        });
    },

    // Observer Mode Actions
    enterObserverMode: () => set({ isObserverMode: true }),
    exitObserverMode: () => set({ isObserverMode: false }),

    // Selection Actions
    setCurrentOrganization: (org) => {
        const state = get();
        let profile = null;
        if (org && state.currentUserId) {
            profile = state.profiles.find(
                (p) => p.org_id === org.id && p.user_id === state.currentUserId
            ) || null;
        }
        set({
            currentOrganization: org,
            currentChatRoom: null,
            currentProfile: profile,
        });
    },

    setCurrentChatRoom: (room) => {
        set({ currentChatRoom: room });
    },

    // Message Actions
    sendMessage: (content: string, files?: File[], sendDuration?: number) => {
        const state = get();
        if (!state.currentChatRoom || !state.currentProfile) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            room_id: state.currentChatRoom.id,
            sender_id: state.currentProfile.id,
            content,
            created_at: new Date(),
            reads: [],
            sendDuration,
            status: 'sent',
            files: files?.map((file, index) => ({
                id: `file-${Date.now()}-${index}`,
                message_id: `msg-${Date.now()}`,
                file_url: URL.createObjectURL(file),
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                uploaded_at: new Date(),
            })),
        };

        set({ messages: [...state.messages, newMessage] });
    },

    markMessageAsRead: (messageId: string) => {
        const state = get();
        if (!state.currentProfile) return;

        set({
            messages: state.messages.map((msg) => {
                if (msg.id === messageId) {
                    const alreadyRead = msg.reads?.some(
                        (r) => r.profile_id === state.currentProfile?.id
                    );
                    if (!alreadyRead) {
                        return {
                            ...msg,
                            reads: [
                                ...(msg.reads || []),
                                {
                                    message_id: messageId,
                                    profile_id: state.currentProfile!.id,
                                    read_at: new Date(),
                                },
                            ],
                        };
                    }
                }
                return msg;
            }),
        });
    },

    markAnnouncementAsRead: (announcementId: string) => {
        // Persist to localStorage
        saveAnnouncementRead(announcementId);
        set({
            announcements: get().announcements.map((ann) =>
                ann.id === announcementId ? { ...ann, is_read: true } : ann
            ),
        });
    },

    // Settings Actions
    toggleReadReceipt: (orgId: string) => {
        set({
            organizations: get().organizations.map((org) =>
                org.id === orgId
                    ? { ...org, read_receipt_enabled: !org.read_receipt_enabled }
                    : org
            ),
        });
    },

    toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newMode);
        }
        set({ isDarkMode: newMode });
    },

    toggleSidebar: () => {
        set({ isSidebarOpen: !get().isSidebarOpen });
    },

    updateProfile: (profileId: string, data: Partial<Profile>) => {
        set({
            profiles: get().profiles.map((p) =>
                p.id === profileId ? { ...p, ...data } : p
            ),
        });
    },

    updateOrganization: (orgId: string, data: Partial<Organization>) => {
        set({
            organizations: get().organizations.map((org) =>
                org.id === orgId ? { ...org, ...data } : org
            ),
        });
    },

    // Typing Actions
    setTyping: (roomId: string, profileId: string) => {
        const state = get();
        const roomTyping = state.typingUsers[roomId] || [];
        const existing = roomTyping.find((t) => t.profileId === profileId);

        if (existing) {
            existing.timestamp = Date.now();
        } else {
            roomTyping.push({ profileId, timestamp: Date.now() });
        }

        set({
            typingUsers: {
                ...state.typingUsers,
                [roomId]: roomTyping,
            },
        });
    },

    clearTyping: (roomId: string, profileId: string) => {
        const state = get();
        set({
            typingUsers: {
                ...state.typingUsers,
                [roomId]: (state.typingUsers[roomId] || []).filter(
                    (t) => t.profileId !== profileId
                ),
            },
        });
    },

    // Organization Actions
    addOrganization: (org: Organization) => {
        set({ organizations: [...get().organizations, org] });
    },

    addProfile: (profile: Profile) => {
        set({ profiles: [...get().profiles, profile] });
    },

    addChatRoom: (room: ChatRoom) => {
        set({ chatRooms: [...get().chatRooms, room] });
    },

    deleteChatRoom: (roomId: string) => {
        set({ chatRooms: get().chatRooms.filter((r) => r.id !== roomId) });
    },

    joinOrganization: (inviteCode: string, displayName: string) => {
        const state = get();
        const org = state.organizations.find((o) => o.invite_code === inviteCode);

        if (!org || !state.currentUserId) return null;

        // Check if already a member
        const existingProfile = state.profiles.find(
            (p) => p.org_id === org.id && p.user_id === state.currentUserId
        );
        if (existingProfile) return org;

        // Create new profile for this org
        const newProfile: Profile = {
            id: `profile-${Date.now()}`,
            user_id: state.currentUserId,
            org_id: org.id,
            display_name: displayName,
            role: 'メンバー',
            joined_at: new Date(),
        };

        set({ profiles: [...state.profiles, newProfile] });
        return org;
    },

    addReaction: (messageId: string, emoji: string) => {
        const state = get();
        if (!state.currentProfile) return false;

        const message = state.messages.find(m => m.id === messageId);
        if (!message) return false;

        // Check existing reaction by this user
        const existing = message.reactions?.find(
            r => r.profile_id === state.currentProfile!.id && r.emoji === emoji
        );

        if (existing) return false; // Already reacted

        // Check limit (legacy instruction said max 5 per user, but typically max unique emojis?)
        // Let's assume max 5 distinct emojis by this user on this message
        const userReactions = message.reactions?.filter(r => r.profile_id === state.currentProfile!.id) || [];
        if (userReactions.length >= 5) return false;

        const newReaction: MessageReaction = {
            id: `react-${Date.now()}`,
            message_id: messageId,
            profile_id: state.currentProfile!.id,
            emoji,
            created_at: new Date(),
        };

        set({
            messages: state.messages.map(m => m.id === messageId ? {
                ...m,
                reactions: [...(m.reactions || []), newReaction]
            } : m)
        });

        return true;
    },

    removeReaction: (messageId: string, emoji: string) => {
        const state = get();
        if (!state.currentProfile) return;

        set({
            messages: state.messages.map(m => m.id === messageId ? {
                ...m,
                reactions: (m.reactions || []).filter(
                    r => !(r.profile_id === state.currentProfile!.id && r.emoji === emoji)
                )
            } : m)
        });
    },
}));

// ============================================
// Custom Hooks
// ============================================
export function useCurrentOrgChatRooms() {
    const { currentOrganization, chatRooms } = useAppStore();
    if (!currentOrganization) return [];
    return chatRooms.filter((r) => r.org_id === currentOrganization.id);
}

export function useCurrentChatMessages() {
    const { currentChatRoom, messages } = useAppStore();
    if (!currentChatRoom) return [];
    return messages.filter((m) => m.room_id === currentChatRoom.id);
}

export function useUserOrganizations() {
    const { currentUserId, organizations, profiles } = useAppStore();
    if (!currentUserId) return [];
    const userOrgIds = profiles
        .filter((p) => p.user_id === currentUserId)
        .map((p) => p.org_id);
    return organizations.filter((org) => userOrgIds.includes(org.id));
}

export function useProfilesForOrg(orgId: string) {
    const { profiles } = useAppStore();
    return profiles.filter((p) => p.org_id === orgId);
}
