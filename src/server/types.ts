export interface User {
  id: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  location: string;
  website?: string;
  privacyVisibility: 'public' | 'friends_only';
  defaultPostVisibility: 'public' | 'friends_only';
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  groupId?: string | null;
  repostOfPostId?: string | null;
  visibility: 'public' | 'friends_only' | 'group';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ReactionType = 'like' | 'love' | 'celebrate' | 'support';

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverUrl: string;
  avatarUrl: string;
  creatorId: string;
  isPrivate: boolean;
  rules?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'approved' | 'pending';
  joinedAt: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  lastReadAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export type NotificationType =
  | 'friend_request'
  | 'friend_accept'
  | 'post_reaction'
  | 'post_comment'
  | 'group_invite'
  | 'group_approval'
  | 'new_message';

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId?: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user' | 'group' | 'comment';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface OtpCode {
  id: string;
  phone: string;
  code: string;
  purpose: 'register' | 'login' | 'link';
  expiresAt: string;
  attempts: number;
  resendAvailableAt: string;
  verified: boolean;
  createdAt: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  posts: Post[];
  comments: Comment[];
  reactions: Reaction[];
  friendRequests: FriendRequest[];
  friendships: Friendship[];
  groups: Group[];
  groupMembers: GroupMember[];
  conversations: Conversation[];
  conversationMembers: ConversationMember[];
  messages: Message[];
  notifications: Notification[];
  reports: Report[];
  blocks: Block[];
  otpCodes: OtpCode[];
  passwordResetTokens: PasswordResetToken[];
}
