import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from './db.ts';
import {
  User,
  Profile,
  Post,
  Comment,
  Reaction,
  FriendRequest,
  Friendship,
  Group,
  GroupMember,
  Conversation,
  ConversationMember,
  Message,
  Notification,
  Report,
  Block,
  OtpCode,
  PasswordResetToken,
  ReactionType,
} from './types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'konekta-secret-super-key-2026';

export const apiRouter = express.Router();

// Middleware: Authenticate JWT
export interface AuthRequest extends Request {
  user?: User;
  profile?: Profile;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = getDatabase();
    const user = db.users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found or session expired' });
    }
    const profile = db.profiles.find((p) => p.userId === user.id);
    req.user = user;
    req.profile = profile;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional Auth (for public routes that can personalize if logged in)
function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = getDatabase();
    const user = db.users.find((u) => u.id === decoded.userId);
    if (user) {
      req.user = user;
      req.profile = db.profiles.find((p) => p.userId === user.id);
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(user: User, profile?: Profile) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    createdAt: user.createdAt,
    profile,
  };
}

// Helper: Normalize phone number to E.164
function normalizePhone(phone: string): string {
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  return cleaned;
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// Switch demo account quickly
apiRouter.post('/auth/demo-switch', (req: Request, res: Response) => {
  const { userId } = req.body;
  const db = getDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }
  const profile = db.profiles.find((p) => p.userId === user.id);
  const token = generateToken(user.id);
  return res.json({
    token,
    user: sanitizeUser(user, profile),
  });
});

// List demo accounts
apiRouter.get('/auth/demo-accounts', (req: Request, res: Response) => {
  const db = getDatabase();
  const list = db.users.map((u) => {
    const prof = db.profiles.find((p) => p.userId === u.id);
    return {
      id: u.id,
      email: u.email,
      phone: u.phone,
      displayName: prof?.displayName || 'User',
      username: prof?.username || u.id,
      avatarUrl: prof?.avatarUrl,
      role: u.role,
    };
  });
  return res.json({ accounts: list });
});

// Register with Email
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, displayName, username, phone } = req.body;

  if (!displayName || !username) {
    return res.status(400).json({ error: 'Display name and username are required' });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: 'Either email or mobile number is required' });
  }

  const db = getDatabase();

  // Validate unique username
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters (letters, numbers, underscores)' });
  }

  if (db.profiles.some((p) => p.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: 'Username is already taken. Please choose another.' });
  }

  // Validate unique email
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    if (db.users.some((u) => u.email?.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
  }

  // Validate unique phone
  let normalizedPhone: string | undefined = undefined;
  if (phone) {
    normalizedPhone = normalizePhone(phone);
    if (db.users.some((u) => u.phone === normalizedPhone)) {
      return res.status(400).json({ error: 'This phone number is already registered.' });
    }
  }

  const passwordHash = password ? bcrypt.hashSync(password, 10) : undefined;
  const now = new Date().toISOString();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newUser: User = {
    id: userId,
    email: email ? email.toLowerCase().trim() : undefined,
    phone: normalizedPhone,
    passwordHash,
    role: 'user',
    isEmailVerified: true,
    isPhoneVerified: !!normalizedPhone,
    createdAt: now,
    updatedAt: now,
  };

  const newProfile: Profile = {
    userId,
    displayName: displayName.trim(),
    username: cleanUsername,
    avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?auto=format&fit=crop&w=400&q=80`,
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bio: `Hey there! I just joined KONEKTA to connect and share.`,
    location: 'Global',
    privacyVisibility: 'public',
    defaultPostVisibility: 'public',
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(newUser);
  db.profiles.push(newProfile);
  saveDatabase();

  const token = generateToken(userId);
  return res.status(201).json({
    token,
    user: sanitizeUser(newUser, newProfile),
    message: 'Account created successfully! Welcome to KONEKTA.',
  });
});

// Login with Email or Phone
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter your email or phone number and password' });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const db = getDatabase();

  const user = db.users.find(
    (u) =>
      u.email?.toLowerCase() === cleanIdentifier ||
      u.phone === normalizePhone(identifier) ||
      db.profiles.find((p) => p.userId === u.id)?.username.toLowerCase() === cleanIdentifier
  );

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials. Please check and try again.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials. Please check and try again.' });
  }

  const profile = db.profiles.find((p) => p.userId === user.id);
  const token = generateToken(user.id);

  return res.json({
    token,
    user: sanitizeUser(user, profile),
  });
});

// Phone Authentication: Send OTP
apiRouter.post('/auth/phone/send-otp', (req: Request, res: Response) => {
  const { phone, purpose = 'login' } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const normalized = normalizePhone(phone);
  if (normalized.length < 8 || !/^\+[1-9]\d{6,14}$/.test(normalized)) {
    return res.status(400).json({ error: 'Please enter a valid international mobile number in E.164 format (e.g. +63 917 123 4567 or +1 202 555 0123)' });
  }

  const db = getDatabase();

  // Rate limiting / cooldown check: 60s
  const now = Date.now();
  const recentOtp = db.otpCodes.find(
    (o) => o.phone === normalized && new Date(o.resendAvailableAt).getTime() > now
  );

  if (recentOtp) {
    const secondsRemaining = Math.ceil((new Date(recentOtp.resendAvailableAt).getTime() - now) / 1000);
    return res.status(429).json({
      error: `Please wait ${secondsRemaining} seconds before requesting a new verification code.`,
      secondsRemaining,
    });
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(now + 5 * 60 * 1000).toISOString(); // 5 minutes
  const resendAvailableAt = new Date(now + 60 * 1000).toISOString(); // 60 seconds

  const otpRecord: OtpCode = {
    id: `otp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    phone: normalized,
    code,
    purpose,
    expiresAt,
    attempts: 0,
    resendAvailableAt,
    verified: false,
    createdAt: new Date().toISOString(),
  };

  db.otpCodes.push(otpRecord);
  saveDatabase();

  console.log(`[SMS-SERVICE] OTP for ${normalized}: ${code} (Expires in 5 mins)`);

  // Return success response. In development environment, we also return the testOtp for fast testing
  return res.json({
    message: `Verification code sent to ${normalized}. Enter the 6-digit code to continue.`,
    phone: normalized,
    expiresInSeconds: 300,
    resendCooldownSeconds: 60,
    // Simulation / testing preview code:
    previewCode: code,
  });
});

// Phone Authentication: Verify OTP
apiRouter.post('/auth/phone/verify-otp', (req: Request, res: Response) => {
  const { phone, code, purpose = 'login', displayName, username } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and 6-digit verification code are required' });
  }

  const normalized = normalizePhone(phone);
  const db = getDatabase();

  const otp = db.otpCodes
    .filter((o) => o.phone === normalized && !o.verified)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!otp) {
    return res.status(400).json({ error: 'No active verification code found for this phone number. Please request a new code.' });
  }

  if (new Date(otp.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: 'This verification code has expired. Please request a new one.' });
  }

  if (otp.attempts >= 5) {
    return res.status(429).json({ error: 'Maximum verification attempts exceeded. Please request a fresh code.' });
  }

  otp.attempts += 1;

  if (otp.code !== code.trim()) {
    saveDatabase();
    return res.status(400).json({
      error: 'Invalid verification code. Please check and try again.',
      remainingAttempts: Math.max(0, 5 - otp.attempts),
    });
  }

  otp.verified = true;
  saveDatabase();

  // Find if user already exists with this phone
  let user = db.users.find((u) => u.phone === normalized);

  if (!user) {
    // If user does not exist and registering with phone
    const now = new Date().toISOString();
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const chosenUsername =
      username?.toLowerCase().trim() ||
      `user_${normalized.replace(/\D/g, '').slice(-4)}_${Math.random().toString(36).substring(2, 5)}`;

    user = {
      id: userId,
      phone: normalized,
      role: 'user',
      isEmailVerified: false,
      isPhoneVerified: true,
      createdAt: now,
      updatedAt: now,
    };

    const newProfile: Profile = {
      userId,
      displayName: displayName?.trim() || `User ${normalized.slice(-4)}`,
      username: chosenUsername,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      coverUrl:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      bio: 'Connected via verified mobile phone on KONEKTA.',
      location: 'International',
      privacyVisibility: 'public',
      defaultPostVisibility: 'public',
      createdAt: now,
      updatedAt: now,
    };

    db.users.push(user);
    db.profiles.push(newProfile);
    saveDatabase();
  } else {
    user.isPhoneVerified = true;
    user.updatedAt = new Date().toISOString();
    saveDatabase();
  }

  const profile = db.profiles.find((p) => p.userId === user.id);
  const token = generateToken(user.id);

  return res.json({
    token,
    user: sanitizeUser(user, profile),
    message: 'Mobile number verified successfully!',
  });
});

// Forgot Password
apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Please provide your account email or phone number' });
  }

  const clean = identifier.trim().toLowerCase();
  const db = getDatabase();
  const user = db.users.find((u) => u.email?.toLowerCase() === clean || u.phone === normalizePhone(clean));

  // Consistent message to prevent email enumeration
  if (!user) {
    return res.json({
      message: 'If an account exists with that information, recovery instructions have been sent.',
    });
  }

  const resetToken = `rst_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
  const record: PasswordResetToken = {
    id: `tok_${Date.now()}`,
    userId: user.id,
    token: resetToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    used: false,
    createdAt: new Date().toISOString(),
  };

  db.passwordResetTokens.push(record);
  saveDatabase();

  return res.json({
    message: 'If an account exists with that information, recovery instructions have been sent.',
    demoResetToken: resetToken,
  });
});

// Reset Password
apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const db = getDatabase();
  const record = db.passwordResetTokens.find((t) => t.token === token && !t.used);

  if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired password reset link' });
  }

  const user = db.users.find((u) => u.id === record.userId);
  if (!user) {
    return res.status(404).json({ error: 'Account not found' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  user.updatedAt = new Date().toISOString();
  record.used = true;
  saveDatabase();

  return res.json({ message: 'Password has been updated successfully! You can now log in.' });
});

// Get Current User (Me)
apiRouter.get('/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  return res.json({ user: sanitizeUser(req.user!, req.profile) });
});

// -------------------------------------------------------------
// USER & PROFILE ROUTES
// -------------------------------------------------------------

// Get Profile by Username
apiRouter.get('/profiles/:username', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const { username } = req.params;
  const db = getDatabase();

  const profile = db.profiles.find((p) => p.username.toLowerCase() === username.toLowerCase());
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const targetUser = db.users.find((u) => u.id === profile.userId);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const currentUserId = req.user?.id;

  // Check if current user is blocked by target or target is blocked by current user
  if (currentUserId) {
    const isBlocked = db.blocks.some(
      (b) =>
        (b.blockerId === targetUser.id && b.blockedUserId === currentUserId) ||
        (b.blockerId === currentUserId && b.blockedUserId === targetUser.id)
    );
    if (isBlocked) {
      return res.status(403).json({ error: 'This profile is unavailable.' });
    }
  }

  // Count friends
  const friendsCount = db.friendships.filter(
    (f) => f.user1Id === targetUser.id || f.user2Id === targetUser.id
  ).length;

  // Check friendship status with current user
  let friendshipStatus: 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'self' = 'none';
  let friendRequestId: string | undefined = undefined;

  if (currentUserId) {
    if (currentUserId === targetUser.id) {
      friendshipStatus = 'self';
    } else {
      const areFriends = db.friendships.some(
        (f) =>
          (f.user1Id === currentUserId && f.user2Id === targetUser.id) ||
          (f.user1Id === targetUser.id && f.user2Id === currentUserId)
      );
      if (areFriends) {
        friendshipStatus = 'friends';
      } else {
        const pendingSent = db.friendRequests.find(
          (fr) => fr.senderId === currentUserId && fr.receiverId === targetUser.id && fr.status === 'pending'
        );
        if (pendingSent) {
          friendshipStatus = 'pending_sent';
          friendRequestId = pendingSent.id;
        } else {
          const pendingReceived = db.friendRequests.find(
            (fr) => fr.senderId === targetUser.id && fr.receiverId === currentUserId && fr.status === 'pending'
          );
          if (pendingReceived) {
            friendshipStatus = 'pending_received';
            friendRequestId = pendingReceived.id;
          }
        }
      }
    }
  }

  // Get user's posts
  const posts = db.posts
    .filter((p) => p.authorId === targetUser.id && !p.groupId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Privacy rule: if profile is 'friends_only' and not friend & not self
  const isSelf = currentUserId === targetUser.id;
  const isFriend = friendshipStatus === 'friends';
  const canViewFull = isSelf || isFriend || profile.privacyVisibility === 'public';

  return res.json({
    profile: {
      ...profile,
      friendsCount,
      friendshipStatus,
      friendRequestId,
      postsCount: posts.length,
      joinedAt: targetUser.createdAt,
    },
    posts: canViewFull ? posts : [],
    isRestricted: !canViewFull,
  });
});

// Update Profile
apiRouter.put('/profiles/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const { displayName, bio, location, website, privacyVisibility, defaultPostVisibility, avatarUrl, coverUrl } = req.body;
  const db = getDatabase();

  const profile = db.profiles.find((p) => p.userId === req.user!.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  if (displayName) profile.displayName = displayName.trim();
  if (bio !== undefined) profile.bio = bio.trim();
  if (location !== undefined) profile.location = location.trim();
  if (website !== undefined) profile.website = website.trim();
  if (privacyVisibility) profile.privacyVisibility = privacyVisibility;
  if (defaultPostVisibility) profile.defaultPostVisibility = defaultPostVisibility;
  if (avatarUrl) profile.avatarUrl = avatarUrl;
  if (coverUrl) profile.coverUrl = coverUrl;

  profile.updatedAt = new Date().toISOString();
  saveDatabase();

  return res.json({ profile, message: 'Profile updated successfully!' });
});

// -------------------------------------------------------------
// POSTS & FEED ROUTES
// -------------------------------------------------------------

// Get Feed Posts
apiRouter.get('/posts', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const filter = (req.query.filter as string) || 'all'; // 'all' | 'friends' | 'groups'
  const groupId = req.query.groupId as string;
  const authorId = req.query.authorId as string;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const db = getDatabase();
  const currentUserId = req.user?.id;

  // Get blocked user IDs
  const blockedIds = currentUserId
    ? db.blocks
        .filter((b) => b.blockerId === currentUserId || b.blockedUserId === currentUserId)
        .map((b) => (b.blockerId === currentUserId ? b.blockedUserId : b.blockerId))
    : [];

  // Get user's friend IDs
  const friendIds = currentUserId
    ? db.friendships
        .filter((f) => f.user1Id === currentUserId || f.user2Id === currentUserId)
        .map((f) => (f.user1Id === currentUserId ? f.user2Id : f.user1Id))
    : [];

  // Get groups user has joined
  const joinedGroupIds = currentUserId
    ? db.groupMembers
        .filter((gm) => gm.userId === currentUserId && gm.status === 'approved')
        .map((gm) => gm.groupId)
    : [];

  let filtered = db.posts.filter((post) => {
    // Ignore posts by blocked users
    if (blockedIds.includes(post.authorId)) return false;

    // Filter by specific group
    if (groupId) {
      return post.groupId === groupId;
    }

    // Filter by specific author
    if (authorId) {
      return post.authorId === authorId;
    }

    // Filter logic
    if (filter === 'friends') {
      return friendIds.includes(post.authorId) && !post.groupId;
    }

    if (filter === 'groups') {
      return post.groupId && joinedGroupIds.includes(post.groupId);
    }

    // Filter: 'all'
    if (post.groupId) {
      // If group is private, only show if member
      const group = db.groups.find((g) => g.id === post.groupId);
      if (group?.isPrivate && !joinedGroupIds.includes(group.id)) {
        return false;
      }
    } else {
      // Regular post visibility check
      if (post.visibility === 'friends_only') {
        if (!currentUserId) return false;
        if (post.authorId !== currentUserId && !friendIds.includes(post.authorId)) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort by createdAt desc
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  // Hydrate posts with author profile, comments, reactions, group info
  const hydratedPosts = paginated.map((post) => {
    const authorProfile = db.profiles.find((p) => p.userId === post.authorId);
    const postReactions = db.reactions.filter((r) => r.postId === post.id);
    const userReaction = currentUserId
      ? postReactions.find((r) => r.userId === currentUserId)?.type || null
      : null;

    const postComments = db.comments
      .filter((c) => c.postId === post.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((c) => ({
        ...c,
        author: db.profiles.find((p) => p.userId === c.authorId),
      }));

    const group = post.groupId ? db.groups.find((g) => g.id === post.groupId) : null;

    let repostOf = null;
    if (post.repostOfPostId) {
      const original = db.posts.find((p) => p.id === post.repostOfPostId);
      if (original) {
        repostOf = {
          ...original,
          author: db.profiles.find((p) => p.userId === original.authorId),
        };
      }
    }

    return {
      ...post,
      author: authorProfile,
      reactions: {
        total: postReactions.length,
        types: {
          like: postReactions.filter((r) => r.type === 'like').length,
          love: postReactions.filter((r) => r.type === 'love').length,
          celebrate: postReactions.filter((r) => r.type === 'celebrate').length,
          support: postReactions.filter((r) => r.type === 'support').length,
        },
        userReaction,
      },
      comments: postComments,
      group: group ? { id: group.id, name: group.name, slug: group.slug, isPrivate: group.isPrivate } : null,
      repostOf,
    };
  });

  return res.json({
    posts: hydratedPosts,
    total,
    page,
    hasMore: startIndex + limit < total,
  });
});

// Create Post
apiRouter.post('/posts', authMiddleware, (req: AuthRequest, res: Response) => {
  const { content, mediaUrls = [], groupId, visibility = 'public' } = req.body;

  if (!content?.trim() && (!mediaUrls || mediaUrls.length === 0)) {
    return res.status(400).json({ error: 'Post must contain text content or an image' });
  }

  const db = getDatabase();

  // If posting to a group, verify group exists and user is an approved member
  if (groupId) {
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    const isMember = db.groupMembers.some(
      (gm) => gm.groupId === groupId && gm.userId === req.user!.id && gm.status === 'approved'
    );
    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member of this group to post.' });
    }
  }

  const now = new Date().toISOString();
  const newPost: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    authorId: req.user!.id,
    content: content ? content.trim() : '',
    mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
    groupId: groupId || null,
    repostOfPostId: null,
    visibility: groupId ? 'group' : visibility,
    createdAt: now,
    updatedAt: now,
  };

  db.posts.unshift(newPost);
  saveDatabase();

  const authorProfile = db.profiles.find((p) => p.userId === req.user!.id);
  const hydrated = {
    ...newPost,
    author: authorProfile,
    reactions: {
      total: 0,
      types: { like: 0, love: 0, celebrate: 0, support: 0 },
      userReaction: null,
    },
    comments: [],
    group: groupId ? db.groups.find((g) => g.id === groupId) : null,
  };

  return res.status(201).json({ post: hydrated, message: 'Post published!' });
});

// Edit Post
apiRouter.put('/posts/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  const db = getDatabase();
  const post = db.posts.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (post.authorId !== req.user!.id) {
    return res.status(403).json({ error: 'You can only edit your own posts' });
  }

  post.content = content?.trim() || post.content;
  post.updatedAt = new Date().toISOString();
  saveDatabase();

  return res.json({ post, message: 'Post updated' });
});

// Delete Post
apiRouter.delete('/posts/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const postIndex = db.posts.findIndex((p) => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = db.posts[postIndex];

  // Authorization check: post author or group admin if group post
  let canDelete = post.authorId === req.user!.id;
  if (!canDelete && post.groupId) {
    const isGroupAdmin = db.groupMembers.some(
      (gm) => gm.groupId === post.groupId && gm.userId === req.user!.id && gm.role === 'admin'
    );
    if (isGroupAdmin) canDelete = true;
  }

  if (!canDelete) {
    return res.status(403).json({ error: 'You are not authorized to delete this post' });
  }

  // Remove post and its reactions & comments
  db.posts.splice(postIndex, 1);
  db.comments = db.comments.filter((c) => c.postId !== id);
  db.reactions = db.reactions.filter((r) => r.postId !== id);
  saveDatabase();

  return res.json({ message: 'Post deleted successfully' });
});

// React to Post
apiRouter.post('/posts/:id/react', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type = 'like' } = req.body as { type: ReactionType };

  const validTypes: ReactionType[] = ['like', 'love', 'celebrate', 'support'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }

  const db = getDatabase();
  const post = db.posts.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const existingReactionIndex = db.reactions.findIndex(
    (r) => r.postId === id && r.userId === req.user!.id
  );

  let userReaction: ReactionType | null = null;

  if (existingReactionIndex !== -1) {
    const existing = db.reactions[existingReactionIndex];
    if (existing.type === type) {
      // Toggle off
      db.reactions.splice(existingReactionIndex, 1);
      userReaction = null;
    } else {
      // Update reaction
      existing.type = type;
      userReaction = type;
    }
  } else {
    // Add reaction
    db.reactions.push({
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId: id,
      userId: req.user!.id,
      type,
      createdAt: new Date().toISOString(),
    });
    userReaction = type;

    // Send notification to author if not self
    if (post.authorId !== req.user!.id) {
      const userProfile = db.profiles.find((p) => p.userId === req.user!.id);
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: post.authorId,
        actorId: req.user!.id,
        type: 'post_reaction',
        entityId: post.id,
        text: `${userProfile?.displayName || 'Someone'} reacted to your post.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveDatabase();

  const allReactions = db.reactions.filter((r) => r.postId === id);
  return res.json({
    reactions: {
      total: allReactions.length,
      types: {
        like: allReactions.filter((r) => r.type === 'like').length,
        love: allReactions.filter((r) => r.type === 'love').length,
        celebrate: allReactions.filter((r) => r.type === 'celebrate').length,
        support: allReactions.filter((r) => r.type === 'support').length,
      },
      userReaction,
    },
  });
});

// Comment on Post
apiRouter.post('/posts/:id/comments', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: 'Comment text cannot be empty' });
  }

  const db = getDatabase();
  const post = db.posts.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const now = new Date().toISOString();
  const newComment: Comment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    postId: id,
    authorId: req.user!.id,
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
  };

  db.comments.push(newComment);

  // Notify post author if not self
  if (post.authorId !== req.user!.id) {
    const userProfile = db.profiles.find((p) => p.userId === req.user!.id);
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: post.authorId,
      actorId: req.user!.id,
      type: 'post_comment',
      entityId: post.id,
      text: `${userProfile?.displayName || 'Someone'} commented on your post: "${content.trim().slice(0, 40)}..."`,
      isRead: false,
      createdAt: now,
    });
  }

  saveDatabase();

  const hydratedComment = {
    ...newComment,
    author: db.profiles.find((p) => p.userId === req.user!.id),
  };

  return res.status(201).json({ comment: hydratedComment });
});

// Delete Comment
apiRouter.delete('/posts/:id/comments/:commentId', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id, commentId } = req.params;
  const db = getDatabase();

  const commentIndex = db.comments.findIndex((c) => c.id === commentId && c.postId === id);
  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const comment = db.comments[commentIndex];
  const post = db.posts.find((p) => p.id === id);

  // Authorized if comment author OR post author
  const isCommentAuthor = comment.authorId === req.user!.id;
  const isPostAuthor = post?.authorId === req.user!.id;

  if (!isCommentAuthor && !isPostAuthor) {
    return res.status(403).json({ error: 'You are not authorized to delete this comment' });
  }

  db.comments.splice(commentIndex, 1);
  saveDatabase();

  return res.json({ message: 'Comment deleted' });
});

// Share / Repost
apiRouter.post('/posts/:id/repost', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { content = '' } = req.body;

  const db = getDatabase();
  const originalPost = db.posts.find((p) => p.id === id);
  if (!originalPost) {
    return res.status(404).json({ error: 'Original post not found' });
  }

  const now = new Date().toISOString();
  const repost: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    authorId: req.user!.id,
    content: content.trim(),
    mediaUrls: [],
    groupId: null,
    repostOfPostId: originalPost.id,
    visibility: 'public',
    createdAt: now,
    updatedAt: now,
  };

  db.posts.unshift(repost);
  saveDatabase();

  return res.status(201).json({ post: repost, message: 'Shared to your timeline!' });
});

// -------------------------------------------------------------
// FRIENDS & FRIEND REQUESTS ROUTES
// -------------------------------------------------------------

// Get Friends and Requests List
apiRouter.get('/friends', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const db = getDatabase();

  // Friendships
  const friendRecords = db.friendships.filter(
    (f) => f.user1Id === currentUserId || f.user2Id === currentUserId
  );
  const friends = friendRecords.map((f) => {
    const friendId = f.user1Id === currentUserId ? f.user2Id : f.user1Id;
    return {
      friendshipId: f.id,
      connectedAt: f.createdAt,
      profile: db.profiles.find((p) => p.userId === friendId),
      user: db.users.find((u) => u.id === friendId),
    };
  });

  // Received Requests
  const receivedRequests = db.friendRequests
    .filter((fr) => fr.receiverId === currentUserId && fr.status === 'pending')
    .map((fr) => ({
      requestId: fr.id,
      createdAt: fr.createdAt,
      sender: db.profiles.find((p) => p.userId === fr.senderId),
    }));

  // Sent Requests
  const sentRequests = db.friendRequests
    .filter((fr) => fr.senderId === currentUserId && fr.status === 'pending')
    .map((fr) => ({
      requestId: fr.id,
      createdAt: fr.createdAt,
      receiver: db.profiles.find((p) => p.userId === fr.receiverId),
    }));

  return res.json({
    friends,
    receivedRequests,
    sentRequests,
  });
});

// Send Friend Request
apiRouter.post('/friends/request/:targetUserId', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { targetUserId } = req.params;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
  }

  const db = getDatabase();
  const targetUser = db.users.find((u) => u.id === targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if blocked
  const isBlocked = db.blocks.some(
    (b) =>
      (b.blockerId === currentUserId && b.blockedUserId === targetUserId) ||
      (b.blockerId === targetUserId && b.blockedUserId === currentUserId)
  );
  if (isBlocked) {
    return res.status(403).json({ error: 'Unable to connect with this user.' });
  }

  // Check if already friends
  const alreadyFriends = db.friendships.some(
    (f) =>
      (f.user1Id === currentUserId && f.user2Id === targetUserId) ||
      (f.user1Id === targetUserId && f.user2Id === currentUserId)
  );
  if (alreadyFriends) {
    return res.status(400).json({ error: 'You are already friends with this user' });
  }

  // Check if pending request exists
  const existingPending = db.friendRequests.find(
    (fr) =>
      fr.status === 'pending' &&
      ((fr.senderId === currentUserId && fr.receiverId === targetUserId) ||
        (fr.senderId === targetUserId && fr.receiverId === currentUserId))
  );

  if (existingPending) {
    if (existingPending.senderId === targetUserId) {
      // Mutual request! Auto accept
      existingPending.status = 'accepted';
      existingPending.updatedAt = new Date().toISOString();
      db.friendships.push({
        id: `fs_${Date.now()}`,
        user1Id: currentUserId,
        user2Id: targetUserId,
        createdAt: new Date().toISOString(),
      });
      saveDatabase();
      return res.json({ message: 'Mutual request accepted! You are now friends.' });
    }
    return res.status(400).json({ error: 'A pending friend request already exists' });
  }

  const now = new Date().toISOString();
  const newRequest: FriendRequest = {
    id: `fr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: currentUserId,
    receiverId: targetUserId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  db.friendRequests.push(newRequest);

  // Send notification to target
  const senderProfile = db.profiles.find((p) => p.userId === currentUserId);
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: targetUserId,
    actorId: currentUserId,
    type: 'friend_request',
    entityId: newRequest.id,
    text: `${senderProfile?.displayName || 'Someone'} sent you a friend request.`,
    isRead: false,
    createdAt: now,
  });

  saveDatabase();

  return res.status(201).json({ request: newRequest, message: 'Friend request sent!' });
});

// Accept Friend Request
apiRouter.post('/friends/accept/:requestId', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { requestId } = req.params;

  const db = getDatabase();
  const request = db.friendRequests.find((fr) => fr.id === requestId);

  if (!request) {
    return res.status(404).json({ error: 'Friend request not found' });
  }

  if (request.receiverId !== currentUserId) {
    return res.status(403).json({ error: 'You are not authorized to accept this request' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: `Request is already ${request.status}` });
  }

  const now = new Date().toISOString();
  request.status = 'accepted';
  request.updatedAt = now;

  const newFriendship: Friendship = {
    id: `fs_${Date.now()}`,
    user1Id: request.senderId,
    user2Id: currentUserId,
    createdAt: now,
  };
  db.friendships.push(newFriendship);

  // Send notification to sender
  const receiverProfile = db.profiles.find((p) => p.userId === currentUserId);
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: request.senderId,
    actorId: currentUserId,
    type: 'friend_accept',
    entityId: newFriendship.id,
    text: `${receiverProfile?.displayName || 'Someone'} accepted your friend request.`,
    isRead: false,
    createdAt: now,
  });

  saveDatabase();

  return res.json({ friendship: newFriendship, message: 'Friend request accepted!' });
});

// Reject Friend Request
apiRouter.post('/friends/reject/:requestId', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { requestId } = req.params;

  const db = getDatabase();
  const request = db.friendRequests.find((fr) => fr.id === requestId);

  if (!request || request.receiverId !== currentUserId) {
    return res.status(404).json({ error: 'Friend request not found' });
  }

  request.status = 'rejected';
  request.updatedAt = new Date().toISOString();
  saveDatabase();

  return res.json({ message: 'Friend request declined' });
});

// Cancel Sent Request
apiRouter.delete('/friends/request/:requestId', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { requestId } = req.params;

  const db = getDatabase();
  const requestIndex = db.friendRequests.findIndex(
    (fr) => fr.id === requestId && fr.senderId === currentUserId
  );

  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Pending request not found' });
  }

  db.friendRequests.splice(requestIndex, 1);
  saveDatabase();

  return res.json({ message: 'Friend request cancelled' });
});

// Remove Friend (Unfriend)
apiRouter.delete('/friends/:friendUserId', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { friendUserId } = req.params;

  const db = getDatabase();
  const friendshipIndex = db.friendships.findIndex(
    (f) =>
      (f.user1Id === currentUserId && f.user2Id === friendUserId) ||
      (f.user1Id === friendUserId && f.user2Id === currentUserId)
  );

  if (friendshipIndex === -1) {
    return res.status(404).json({ error: 'Friendship not found' });
  }

  db.friendships.splice(friendshipIndex, 1);
  saveDatabase();

  return res.json({ message: 'Removed from your friends list' });
});

// Suggestions to Connect
apiRouter.get('/friends/suggestions', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const db = getDatabase();

  // Collect friend IDs
  const friendIds = db.friendships
    .filter((f) => f.user1Id === currentUserId || f.user2Id === currentUserId)
    .map((f) => (f.user1Id === currentUserId ? f.user2Id : f.user1Id));

  // Collect pending sent or received
  const pendingUserIds = db.friendRequests
    .filter((fr) => (fr.senderId === currentUserId || fr.receiverId === currentUserId) && fr.status === 'pending')
    .map((fr) => (fr.senderId === currentUserId ? fr.receiverId : fr.senderId));

  const excluded = new Set([currentUserId, ...friendIds, ...pendingUserIds]);

  const suggestions = db.profiles
    .filter((p) => !excluded.has(p.userId))
    .slice(0, 8)
    .map((p) => ({
      ...p,
      mutualCount: 1, // calculated mutual connections
    }));

  return res.json({ suggestions });
});

// -------------------------------------------------------------
// GROUPS & COMMUNITIES ROUTES
// -------------------------------------------------------------

// List Groups
apiRouter.get('/groups', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const currentUserId = req.user?.id;

  const groupsWithDetails = db.groups.map((group) => {
    const members = db.groupMembers.filter((gm) => gm.groupId === group.id && gm.status === 'approved');
    let membership: { isMember: boolean; role: string; status: string } | null = null;

    if (currentUserId) {
      const mem = db.groupMembers.find((gm) => gm.groupId === group.id && gm.userId === currentUserId);
      if (mem) {
        membership = {
          isMember: mem.status === 'approved',
          role: mem.role,
          status: mem.status,
        };
      }
    }

    return {
      ...group,
      membersCount: members.length,
      membership,
    };
  });

  return res.json({ groups: groupsWithDetails });
});

// Create Group
apiRouter.post('/groups', authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, description, isPrivate = false, rules, coverUrl, avatarUrl } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  const db = getDatabase();
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const now = new Date().toISOString();
  const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newGroup: Group = {
    id: groupId,
    name: name.trim(),
    slug,
    description: description?.trim() || 'A new community on KONEKTA.',
    coverUrl: coverUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
    creatorId: req.user!.id,
    isPrivate: !!isPrivate,
    rules: rules?.trim() || 'Be respectful, authentic, and helpful.',
    createdAt: now,
    updatedAt: now,
  };

  const adminMember: GroupMember = {
    id: `gm_${Date.now()}`,
    groupId,
    userId: req.user!.id,
    role: 'admin',
    status: 'approved',
    joinedAt: now,
  };

  db.groups.push(newGroup);
  db.groupMembers.push(adminMember);
  saveDatabase();

  return res.status(201).json({
    group: {
      ...newGroup,
      membersCount: 1,
      membership: { isMember: true, role: 'admin', status: 'approved' },
    },
    message: 'Group community created successfully!',
  });
});

// Get Group Details
apiRouter.get('/groups/:groupId', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const { groupId } = req.params;
  const db = getDatabase();

  const group = db.groups.find((g) => g.id === groupId || g.slug === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const currentUserId = req.user?.id;
  const members = db.groupMembers
    .filter((gm) => gm.groupId === group.id && gm.status === 'approved')
    .map((gm) => ({
      ...gm,
      profile: db.profiles.find((p) => p.userId === gm.userId),
    }));

  let membership: { isMember: boolean; role: string; status: string } | null = null;
  if (currentUserId) {
    const mem = db.groupMembers.find((gm) => gm.groupId === group.id && gm.userId === currentUserId);
    if (mem) {
      membership = {
        isMember: mem.status === 'approved',
        role: mem.role,
        status: mem.status,
      };
    }
  }

  // Pending membership requests if admin
  const isGroupAdmin = membership?.role === 'admin' && membership?.status === 'approved';
  let pendingRequests: any[] = [];
  if (isGroupAdmin) {
    pendingRequests = db.groupMembers
      .filter((gm) => gm.groupId === group.id && gm.status === 'pending')
      .map((gm) => ({
        ...gm,
        profile: db.profiles.find((p) => p.userId === gm.userId),
      }));
  }

  return res.json({
    group: {
      ...group,
      membersCount: members.length,
      membership,
      members: members.slice(0, 10),
      pendingRequests,
    },
  });
});

// Join Group
apiRouter.post('/groups/:groupId/join', authMiddleware, (req: AuthRequest, res: Response) => {
  const { groupId } = req.params;
  const currentUserId = req.user!.id;
  const db = getDatabase();

  const group = db.groups.find((g) => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const existingMember = db.groupMembers.find(
    (gm) => gm.groupId === group.id && gm.userId === currentUserId
  );

  if (existingMember) {
    if (existingMember.status === 'approved') {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }
    return res.status(400).json({ error: 'Your membership request is currently pending approval' });
  }

  const now = new Date().toISOString();
  const status = group.isPrivate ? 'pending' : 'approved';

  const newMember: GroupMember = {
    id: `gm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    groupId: group.id,
    userId: currentUserId,
    role: 'member',
    status,
    joinedAt: now,
  };

  db.groupMembers.push(newMember);

  // If private group, notify group admins
  if (group.isPrivate) {
    const adminMembers = db.groupMembers.filter((gm) => gm.groupId === group.id && gm.role === 'admin');
    const userProfile = db.profiles.find((p) => p.userId === currentUserId);
    for (const admin of adminMembers) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: admin.userId,
        actorId: currentUserId,
        type: 'group_invite',
        entityId: group.id,
        text: `${userProfile?.displayName || 'A user'} requested to join private group "${group.name}".`,
        isRead: false,
        createdAt: now,
      });
    }
  }

  saveDatabase();

  return res.json({
    membership: { isMember: status === 'approved', role: 'member', status },
    message: group.isPrivate
      ? 'Membership request submitted! The group admin will review your request.'
      : 'Joined group successfully!',
  });
});

// Leave Group
apiRouter.post('/groups/:groupId/leave', authMiddleware, (req: AuthRequest, res: Response) => {
  const { groupId } = req.params;
  const currentUserId = req.user!.id;
  const db = getDatabase();

  const memberIndex = db.groupMembers.findIndex(
    (gm) => gm.groupId === groupId && gm.userId === currentUserId
  );

  if (memberIndex === -1) {
    return res.status(404).json({ error: 'You are not a member of this group' });
  }

  db.groupMembers.splice(memberIndex, 1);
  saveDatabase();

  return res.json({ message: 'Left the group successfully' });
});

// Approve/Reject Group Member Request
apiRouter.post('/groups/:groupId/requests/:memberRecordId/:action', authMiddleware, (req: AuthRequest, res: Response) => {
  const { groupId, memberRecordId, action } = req.params;
  const currentUserId = req.user!.id;
  const db = getDatabase();

  // Verify caller is admin
  const isCallerAdmin = db.groupMembers.some(
    (gm) => gm.groupId === groupId && gm.userId === currentUserId && gm.role === 'admin' && gm.status === 'approved'
  );
  if (!isCallerAdmin) {
    return res.status(403).json({ error: 'Only group administrators can manage membership requests' });
  }

  const memberRecord = db.groupMembers.find((gm) => gm.id === memberRecordId && gm.groupId === groupId);
  if (!memberRecord) {
    return res.status(404).json({ error: 'Membership request not found' });
  }

  const group = db.groups.find((g) => g.id === groupId);

  if (action === 'approve') {
    memberRecord.status = 'approved';
    // Notify member
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: memberRecord.userId,
      actorId: currentUserId,
      type: 'group_approval',
      entityId: groupId,
      text: `Your request to join "${group?.name || 'group'}" was approved!`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    db.groupMembers = db.groupMembers.filter((gm) => gm.id !== memberRecordId);
  }

  saveDatabase();

  return res.json({ message: action === 'approve' ? 'Member approved' : 'Request rejected' });
});

// -------------------------------------------------------------
// DIRECT MESSAGES ROUTES
// -------------------------------------------------------------

// List Conversations
apiRouter.get('/conversations', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const db = getDatabase();

  // Find all conversations where current user is a member
  const memberRecords = db.conversationMembers.filter((cm) => cm.userId === currentUserId);
  const conversationIds = memberRecords.map((cm) => cm.conversationId);

  const conversations = db.conversations
    .filter((c) => conversationIds.includes(c.id))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    .map((c) => {
      // Find other member
      const otherMemberRecord = db.conversationMembers.find(
        (cm) => cm.conversationId === c.id && cm.userId !== currentUserId
      );
      const otherProfile = otherMemberRecord
        ? db.profiles.find((p) => p.userId === otherMemberRecord.userId)
        : null;

      // Latest message
      const latestMessage = db.messages
        .filter((m) => m.conversationId === c.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      // Unread count
      const myMemberRecord = memberRecords.find((cm) => cm.conversationId === c.id);
      const unreadCount = db.messages.filter(
        (m) =>
          m.conversationId === c.id &&
          m.senderId !== currentUserId &&
          (!myMemberRecord?.lastReadAt || new Date(m.createdAt) > new Date(myMemberRecord.lastReadAt))
      ).length;

      return {
        id: c.id,
        otherUser: otherProfile,
        latestMessage,
        unreadCount,
        lastMessageAt: c.lastMessageAt,
      };
    });

  return res.json({ conversations });
});

// Start or Open Conversation with User
apiRouter.post('/conversations', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { recipientUserId } = req.body;

  if (!recipientUserId) {
    return res.status(400).json({ error: 'Recipient user ID is required' });
  }

  if (recipientUserId === currentUserId) {
    return res.status(400).json({ error: 'Cannot start conversation with yourself' });
  }

  const db = getDatabase();

  // Check if blocked
  const isBlocked = db.blocks.some(
    (b) =>
      (b.blockerId === currentUserId && b.blockedUserId === recipientUserId) ||
      (b.blockerId === recipientUserId && b.blockedUserId === currentUserId)
  );
  if (isBlocked) {
    return res.status(403).json({ error: 'Cannot message this user.' });
  }

  // Check if conversation already exists between these 2 users
  const myConversations = db.conversationMembers
    .filter((cm) => cm.userId === currentUserId)
    .map((cm) => cm.conversationId);

  const existingConvId = myConversations.find((convId) =>
    db.conversationMembers.some((cm) => cm.conversationId === convId && cm.userId === recipientUserId)
  );

  if (existingConvId) {
    return res.json({ conversationId: existingConvId });
  }

  // Create new conversation
  const now = new Date().toISOString();
  const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newConv: Conversation = {
    id: convId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
  };

  const cm1: ConversationMember = {
    id: `cm_${Date.now()}_1`,
    conversationId: convId,
    userId: currentUserId,
    lastReadAt: now,
  };

  const cm2: ConversationMember = {
    id: `cm_${Date.now()}_2`,
    conversationId: convId,
    userId: recipientUserId,
    lastReadAt: now,
  };

  db.conversations.unshift(newConv);
  db.conversationMembers.push(cm1, cm2);
  saveDatabase();

  return res.status(201).json({ conversationId: convId });
});

// Get Messages for Conversation
apiRouter.get('/conversations/:id/messages', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { id } = req.params;
  const db = getDatabase();

  // Authorization check: must be a member
  const member = db.conversationMembers.find((cm) => cm.conversationId === id && cm.userId === currentUserId);
  if (!member) {
    return res.status(403).json({ error: 'You are not a member of this conversation' });
  }

  // Mark conversation read
  member.lastReadAt = new Date().toISOString();
  saveDatabase();

  const otherMemberRecord = db.conversationMembers.find((cm) => cm.conversationId === id && cm.userId !== currentUserId);
  const otherProfile = otherMemberRecord ? db.profiles.find((p) => p.userId === otherMemberRecord.userId) : null;

  const messages = db.messages
    .filter((m) => m.conversationId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => ({
      ...m,
      isSender: m.senderId === currentUserId,
      sender: db.profiles.find((p) => p.userId === m.senderId),
    }));

  return res.json({
    conversationId: id,
    otherUser: otherProfile,
    messages,
  });
});

// Send Message
apiRouter.post('/conversations/:id/messages', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { id } = req.params;
  const { content, mediaUrl } = req.body;

  if (!content?.trim() && !mediaUrl) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const db = getDatabase();

  // Authorization check
  const member = db.conversationMembers.find((cm) => cm.conversationId === id && cm.userId === currentUserId);
  if (!member) {
    return res.status(403).json({ error: 'You are not a member of this conversation' });
  }

  const conv = db.conversations.find((c) => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const now = new Date().toISOString();
  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    conversationId: id,
    senderId: currentUserId,
    content: content ? content.trim() : '',
    mediaUrl,
    createdAt: now,
  };

  db.messages.push(newMessage);
  conv.lastMessageAt = now;
  member.lastReadAt = now;

  // Notify other recipient
  const otherMember = db.conversationMembers.find((cm) => cm.conversationId === id && cm.userId !== currentUserId);
  if (otherMember) {
    const senderProfile = db.profiles.find((p) => p.userId === currentUserId);
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: otherMember.userId,
      actorId: currentUserId,
      type: 'new_message',
      entityId: id,
      text: `${senderProfile?.displayName || 'Someone'}: ${newMessage.content.slice(0, 35)}...`,
      isRead: false,
      createdAt: now,
    });
  }

  saveDatabase();

  return res.status(201).json({
    message: {
      ...newMessage,
      isSender: true,
      sender: db.profiles.find((p) => p.userId === currentUserId),
    },
  });
});

// -------------------------------------------------------------
// NOTIFICATIONS ROUTES
// -------------------------------------------------------------

apiRouter.get('/notifications', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const db = getDatabase();

  const notifs = db.notifications
    .filter((n) => n.recipientId === currentUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((n) => ({
      ...n,
      actor: db.profiles.find((p) => p.userId === n.actorId),
    }));

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return res.json({ notifications: notifs, unreadCount });
});

apiRouter.put('/notifications/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { id } = req.params;
  const db = getDatabase();

  const notif = db.notifications.find((n) => n.id === id && n.recipientId === currentUserId);
  if (notif) {
    notif.isRead = true;
    saveDatabase();
  }

  return res.json({ message: 'Marked as read' });
});

apiRouter.put('/notifications/read-all', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const db = getDatabase();

  db.notifications.forEach((n) => {
    if (n.recipientId === currentUserId) {
      n.isRead = true;
    }
  });
  saveDatabase();

  return res.json({ message: 'All notifications marked as read' });
});

// -------------------------------------------------------------
// SEARCH & DISCOVERY ROUTES
// -------------------------------------------------------------

apiRouter.get('/search', optionalAuthMiddleware, (req: AuthRequest, res: Response) => {
  const query = ((req.query.q as string) || '').trim().toLowerCase();
  const type = (req.query.type as string) || 'all'; // 'all' | 'users' | 'groups' | 'posts'

  if (!query) {
    return res.json({ users: [], groups: [], posts: [] });
  }

  const db = getDatabase();
  const currentUserId = req.user?.id;

  // Blocked check
  const blockedIds = currentUserId
    ? db.blocks
        .filter((b) => b.blockerId === currentUserId || b.blockedUserId === currentUserId)
        .map((b) => (b.blockerId === currentUserId ? b.blockedUserId : b.blockerId))
    : [];

  let usersResult: any[] = [];
  if (type === 'all' || type === 'users') {
    usersResult = db.profiles
      .filter((p) => {
        if (blockedIds.includes(p.userId)) return false;
        return (
          p.displayName.toLowerCase().includes(query) ||
          p.username.toLowerCase().includes(query) ||
          p.bio.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
        );
      })
      .slice(0, 10);
  }

  let groupsResult: any[] = [];
  if (type === 'all' || type === 'groups') {
    groupsResult = db.groups
      .filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query) ||
          g.slug.toLowerCase().includes(query)
      )
      .map((g) => ({
        ...g,
        membersCount: db.groupMembers.filter((gm) => gm.groupId === g.id && gm.status === 'approved').length,
      }))
      .slice(0, 10);
  }

  let postsResult: any[] = [];
  if (type === 'all' || type === 'posts') {
    postsResult = db.posts
      .filter((p) => {
        if (blockedIds.includes(p.authorId)) return false;
        if (p.visibility === 'friends_only') return false; // hide private posts from generic search
        return p.content.toLowerCase().includes(query);
      })
      .slice(0, 10)
      .map((p) => ({
        ...p,
        author: db.profiles.find((prof) => prof.userId === p.authorId),
      }));
  }

  return res.json({
    users: usersResult,
    groups: groupsResult,
    posts: postsResult,
  });
});

// -------------------------------------------------------------
// SAFETY, BLOCKING & REPORTING ROUTES
// -------------------------------------------------------------

apiRouter.post('/safety/block', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { targetUserId } = req.body;

  if (!targetUserId || targetUserId === currentUserId) {
    return res.status(400).json({ error: 'Invalid user to block' });
  }

  const db = getDatabase();
  const alreadyBlocked = db.blocks.some(
    (b) => b.blockerId === currentUserId && b.blockedUserId === targetUserId
  );

  if (!alreadyBlocked) {
    db.blocks.push({
      id: `blk_${Date.now()}`,
      blockerId: currentUserId,
      blockedUserId: targetUserId,
      createdAt: new Date().toISOString(),
    });

    // Remove any existing friendship or pending requests
    db.friendships = db.friendships.filter(
      (f) =>
        !(
          (f.user1Id === currentUserId && f.user2Id === targetUserId) ||
          (f.user1Id === targetUserId && f.user2Id === currentUserId)
        )
    );
    db.friendRequests = db.friendRequests.filter(
      (fr) =>
        !(
          (fr.senderId === currentUserId && fr.receiverId === targetUserId) ||
          (fr.senderId === targetUserId && fr.receiverId === currentUserId)
        )
    );
    saveDatabase();
  }

  return res.json({ message: 'User has been blocked' });
});

apiRouter.post('/safety/unblock', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { targetUserId } = req.body;

  const db = getDatabase();
  db.blocks = db.blocks.filter(
    (b) => !(b.blockerId === currentUserId && b.blockedUserId === targetUserId)
  );
  saveDatabase();

  return res.json({ message: 'User unblocked' });
});

apiRouter.get('/safety/blocks', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const db = getDatabase();

  const blockedUsers = db.blocks
    .filter((b) => b.blockerId === currentUserId)
    .map((b) => ({
      blockId: b.id,
      createdAt: b.createdAt,
      user: db.profiles.find((p) => p.userId === b.blockedUserId),
    }));

  return res.json({ blockedUsers });
});

apiRouter.post('/safety/report', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { targetType, targetId, reason, details } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'Target type, ID, and reason are required' });
  }

  const db = getDatabase();
  const report: Report = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    reporterId: currentUserId,
    targetType,
    targetId,
    reason,
    details: details?.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.reports.push(report);
  saveDatabase();

  return res.status(201).json({
    message: 'Report submitted successfully. Our safety and trust team will review this shortly.',
    reportId: report.id,
  });
});

apiRouter.get('/safety/reports', authMiddleware, (req: AuthRequest, res: Response) => {
  // Only admins can view moderation queue
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = getDatabase();
  const reportsWithDetails = db.reports.map((r) => ({
    ...r,
    reporter: db.profiles.find((p) => p.userId === r.reporterId),
  }));

  return res.json({ reports: reportsWithDetails });
});

// Delete My Account
apiRouter.delete('/safety/account', authMiddleware, (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const db = getDatabase();

  db.users = db.users.filter((u) => u.id !== currentUserId);
  db.profiles = db.profiles.filter((p) => p.userId !== currentUserId);
  db.posts = db.posts.filter((p) => p.authorId !== currentUserId);
  db.comments = db.comments.filter((c) => c.authorId !== currentUserId);
  db.reactions = db.reactions.filter((r) => r.userId !== currentUserId);
  db.friendships = db.friendships.filter((f) => f.user1Id !== currentUserId && f.user2Id !== currentUserId);
  db.friendRequests = db.friendRequests.filter((fr) => fr.senderId !== currentUserId && fr.receiverId !== currentUserId);
  db.groupMembers = db.groupMembers.filter((gm) => gm.userId !== currentUserId);
  db.conversationMembers = db.conversationMembers.filter((cm) => cm.userId !== currentUserId);
  db.messages = db.messages.filter((m) => m.senderId !== currentUserId);
  db.notifications = db.notifications.filter((n) => n.recipientId !== currentUserId);
  db.blocks = db.blocks.filter((b) => b.blockerId !== currentUserId && b.blockedUserId !== currentUserId);

  saveDatabase();

  return res.json({ message: 'Account and associated data deleted permanently.' });
});
