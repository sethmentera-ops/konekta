export interface UserProfile {
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
  friendsCount?: number;
  postsCount?: number;
  joinedAt?: string;
  friendshipStatus?: 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'self';
  friendRequestId?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  profile?: UserProfile;
}

export type ReactionType = 'like' | 'love' | 'celebrate' | 'support';

export interface ReactionSummary {
  total: number;
  types: {
    like: number;
    love: number;
    celebrate: number;
    support: number;
  };
  userReaction: ReactionType | null;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: UserProfile;
}

export interface PostItem {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  groupId?: string | null;
  repostOfPostId?: string | null;
  visibility: 'public' | 'friends_only' | 'group';
  createdAt: string;
  updatedAt: string;
  author?: UserProfile;
  reactions: ReactionSummary;
  comments: PostComment[];
  group?: {
    id: string;
    name: string;
    slug: string;
    isPrivate: boolean;
  } | null;
  repostOf?: {
    id: string;
    content: string;
    mediaUrls: string[];
    createdAt: string;
    author?: UserProfile;
  } | null;
}

export interface FriendRequestItem {
  requestId: string;
  createdAt: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface FriendConnection {
  friendshipId: string;
  connectedAt: string;
  profile?: UserProfile;
}

export interface GroupItem {
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
  membersCount: number;
  membership?: {
    isMember: boolean;
    role: 'admin' | 'moderator' | 'member';
    status: 'approved' | 'pending';
  } | null;
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    status: string;
    profile?: UserProfile;
  }>;
  pendingRequests?: Array<{
    id: string;
    userId: string;
    role: string;
    status: string;
    profile?: UserProfile;
  }>;
}

export interface ConversationItem {
  id: string;
  otherUser?: UserProfile | null;
  latestMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  lastMessageAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  isSender: boolean;
  sender?: UserProfile;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId: string;
  type: string;
  entityId?: string;
  text: string;
  isRead: boolean;
  createdAt: string;
  actor?: UserProfile;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user' | 'group' | 'comment';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  reporter?: UserProfile;
}

export interface BlockedUserItem {
  blockId: string;
  createdAt: string;
  user?: UserProfile;
}
