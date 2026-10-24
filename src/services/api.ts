import {
  AuthUser,
  UserProfile,
  PostItem,
  GroupItem,
  ConversationItem,
  MessageItem,
  NotificationItem,
  FriendConnection,
  FriendRequestItem,
  BlockedUserItem,
  ReportItem,
  ReactionType,
} from '../types/index.ts';

const TOKEN_KEY = 'konekta_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Auth
  async getDemoAccounts() {
    return request<{ accounts: any[] }>('/api/auth/demo-accounts');
  },

  async switchDemoAccount(userId: string) {
    const res = await request<{ token: string; user: AuthUser }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    setStoredToken(res.token);
    return res;
  },

  async register(payload: {
    email?: string;
    phone?: string;
    password?: string;
    displayName: string;
    username: string;
  }) {
    const res = await request<{ token: string; user: AuthUser; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(identifier: string, password?: string) {
    const res = await request<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async sendPhoneOtp(phone: string, purpose: 'login' | 'register' | 'link' = 'login') {
    return request<{
      message: string;
      phone: string;
      expiresInSeconds: number;
      resendCooldownSeconds: number;
      previewCode?: string;
    }>('/api/auth/phone/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose }),
    });
  },

  async verifyPhoneOtp(payload: {
    phone: string;
    code: string;
    purpose?: string;
    displayName?: string;
    username?: string;
  }) {
    const res = await request<{ token: string; user: AuthUser; message: string }>('/api/auth/phone/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    return res;
  },

  async sendEmailOtp(email: string) {
    return request<{
      message: string;
      email: string;
      expiresInSeconds: number;
      resendCooldownSeconds: number;
      previewCode?: string;
    }>('/api/auth/email/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyEmailOtp(payload: {
    email: string;
    code: string;
    displayName?: string;
    username?: string;
  }) {
    const res = await request<{ token: string; user: AuthUser; message: string }>('/api/auth/email/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    return res;
  },

  async forgotPassword(identifier: string) {
    return request<{ message: string; demoResetToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async getMe() {
    return request<{ user: AuthUser }>('/api/auth/me');
  },

  // Profiles
  async getProfile(username: string) {
    return request<{
      profile: UserProfile;
      posts: PostItem[];
      isRestricted: boolean;
    }>(`/api/profiles/${encodeURIComponent(username)}`);
  },

  async updateProfile(updates: Partial<UserProfile>) {
    return request<{ profile: UserProfile; message: string }>('/api/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Posts
  async getPosts(params: { filter?: string; groupId?: string; authorId?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.filter) query.set('filter', params.filter);
    if (params.groupId) query.set('groupId', params.groupId);
    if (params.authorId) query.set('authorId', params.authorId);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    return request<{
      posts: PostItem[];
      total: number;
      page: number;
      hasMore: boolean;
    }>(`/api/posts?${query.toString()}`);
  },

  async createPost(payload: { content: string; mediaUrls?: string[]; groupId?: string | null; visibility?: string }) {
    return request<{ post: PostItem; message: string }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async editPost(postId: string, content: string) {
    return request<{ post: PostItem; message: string }>(`/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  async deletePost(postId: string) {
    return request<{ message: string }>(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  async reactToPost(postId: string, type: ReactionType) {
    return request<{ reactions: PostItem['reactions'] }>(`/api/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  async addComment(postId: string, content: string) {
    return request<{ comment: PostItem['comments'][0] }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(postId: string, commentId: string) {
    return request<{ message: string }>(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  async repost(postId: string, content?: string) {
    return request<{ post: PostItem; message: string }>(`/api/posts/${postId}/repost`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Friends
  async getFriends() {
    return request<{
      friends: FriendConnection[];
      receivedRequests: FriendRequestItem[];
      sentRequests: FriendRequestItem[];
    }>('/api/friends');
  },

  async sendFriendRequest(targetUserId: string) {
    return request<{ request: any; message: string }>(`/api/friends/request/${targetUserId}`, {
      method: 'POST',
    });
  },

  async acceptFriendRequest(requestId: string) {
    return request<{ friendship: any; message: string }>(`/api/friends/accept/${requestId}`, {
      method: 'POST',
    });
  },

  async rejectFriendRequest(requestId: string) {
    return request<{ message: string }>(`/api/friends/reject/${requestId}`, {
      method: 'POST',
    });
  },

  async cancelFriendRequest(requestId: string) {
    return request<{ message: string }>(`/api/friends/request/${requestId}`, {
      method: 'DELETE',
    });
  },

  async removeFriend(friendUserId: string) {
    return request<{ message: string }>(`/api/friends/${friendUserId}`, {
      method: 'DELETE',
    });
  },

  async getSuggestions() {
    return request<{ suggestions: UserProfile[] }>('/api/friends/suggestions');
  },

  // Groups
  async getGroups() {
    return request<{ groups: GroupItem[] }>('/api/groups');
  },

  async createGroup(payload: {
    name: string;
    description: string;
    isPrivate?: boolean;
    rules?: string;
    coverUrl?: string;
    avatarUrl?: string;
  }) {
    return request<{ group: GroupItem; message: string }>('/api/groups', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getGroupDetails(groupId: string) {
    return request<{ group: GroupItem }>(`/api/groups/${groupId}`);
  },

  async joinGroup(groupId: string) {
    return request<{ membership: any; message: string }>(`/api/groups/${groupId}/join`, {
      method: 'POST',
    });
  },

  async leaveGroup(groupId: string) {
    return request<{ message: string }>(`/api/groups/${groupId}/leave`, {
      method: 'POST',
    });
  },

  async manageGroupRequest(groupId: string, memberRecordId: string, action: 'approve' | 'reject') {
    return request<{ message: string }>(`/api/groups/${groupId}/requests/${memberRecordId}/${action}`, {
      method: 'POST',
    });
  },

  // Messages
  async getConversations() {
    return request<{ conversations: ConversationItem[] }>('/api/conversations');
  },

  async startConversation(recipientUserId: string) {
    return request<{ conversationId: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientUserId }),
    });
  },

  async getMessages(conversationId: string) {
    return request<{
      conversationId: string;
      otherUser: UserProfile | null;
      messages: MessageItem[];
    }>(`/api/conversations/${conversationId}/messages`);
  },

  async sendMessage(conversationId: string, content: string, mediaUrl?: string) {
    return request<{ message: MessageItem }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, mediaUrl }),
    });
  },

  // Notifications
  async getNotifications() {
    return request<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return request<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead() {
    return request<{ message: string }>('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Search
  async search(q: string, type: string = 'all') {
    return request<{
      users: UserProfile[];
      groups: GroupItem[];
      posts: PostItem[];
    }>(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
  },

  // Safety & Privacy
  async blockUser(targetUserId: string) {
    return request<{ message: string }>('/api/safety/block', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },

  async unblockUser(targetUserId: string) {
    return request<{ message: string }>('/api/safety/unblock', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },

  async getBlockedUsers() {
    return request<{ blockedUsers: BlockedUserItem[] }>('/api/safety/blocks');
  },

  async submitReport(payload: {
    targetType: 'post' | 'user' | 'group' | 'comment';
    targetId: string;
    reason: string;
    details?: string;
  }) {
    return request<{ message: string; reportId: string }>('/api/safety/report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getReports() {
    return request<{ reports: ReportItem[] }>('/api/safety/reports');
  },

  async deleteAccount() {
    return request<{ message: string }>('/api/safety/account', {
      method: 'DELETE',
    });
  },
};
