import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  DatabaseSchema,
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
} from './types.ts';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'konekta_db.json');

// In-memory cache
let db: DatabaseSchema | null = null;

function ensureDirectoryExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// Generate realistic seed database
function createInitialDatabase(): DatabaseSchema {
  const now = new Date();
  const d = (hoursAgo: number) =>
    new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();

  const passwordHash = bcrypt.hashSync('Password123!', 10);

  const users: User[] = [
    {
      id: 'usr_elena',
      email: 'elena@konekta.com',
      phone: '+639171234567',
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: d(720),
      updatedAt: d(1),
    },
    {
      id: 'usr_marcus',
      email: 'marcus@konekta.com',
      phone: '+447911123456',
      passwordHash,
      role: 'user',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: d(600),
      updatedAt: d(3),
    },
    {
      id: 'usr_sofia',
      email: 'sofia@konekta.com',
      phone: '+34612345678',
      passwordHash,
      role: 'user',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: d(480),
      updatedAt: d(5),
    },
    {
      id: 'usr_kenji',
      email: 'kenji@konekta.com',
      phone: '+819012345678',
      passwordHash,
      role: 'user',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: d(360),
      updatedAt: d(12),
    },
    {
      id: 'usr_amara',
      email: 'amara@konekta.com',
      phone: '+2348012345678',
      passwordHash,
      role: 'user',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: d(240),
      updatedAt: d(24),
    },
  ];

  const profiles: Profile[] = [
    {
      userId: 'usr_elena',
      displayName: 'Elena Vance',
      username: 'elenavance',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverUrl:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      bio: 'Visual artist, street photographer & community builder from Manila 🇵🇭. Capturing raw urban stories and connecting creatives across borders.',
      location: 'Manila, Philippines',
      website: 'https://elenavance.art',
      privacyVisibility: 'public',
      defaultPostVisibility: 'public',
      createdAt: d(720),
      updatedAt: d(1),
    },
    {
      userId: 'usr_marcus',
      displayName: 'Marcus Sterling',
      username: 'marcus_ux',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      coverUrl:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      bio: 'Product Designer & Design Systems enthusiast based in London 🇬🇧. Obsessed with clean typography, accessibility, and human-centered technology.',
      location: 'London, United Kingdom',
      website: 'https://marcussterling.design',
      privacyVisibility: 'public',
      defaultPostVisibility: 'public',
      createdAt: d(600),
      updatedAt: d(3),
    },
    {
      userId: 'usr_sofia',
      displayName: 'Sofia Rodriguez',
      username: 'sofia_voyage',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      coverUrl:
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      bio: 'Travel journalist & slow food advocate from Barcelona 🇪🇸. Currently exploring hidden coastal communities.',
      location: 'Barcelona, Spain',
      website: 'https://sofiarodriguez.me',
      privacyVisibility: 'public',
      defaultPostVisibility: 'public',
      createdAt: d(480),
      updatedAt: d(5),
    },
    {
      userId: 'usr_kenji',
      displayName: 'Kenji Sato',
      username: 'kenjicodes',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      coverUrl:
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      bio: 'Indie software engineer in Tokyo 🇯🇵. Building open web tools, tinkering with distributed systems and analog synthesizers.',
      location: 'Tokyo, Japan',
      website: 'https://kenjisato.dev',
      privacyVisibility: 'public',
      defaultPostVisibility: 'public',
      createdAt: d(360),
      updatedAt: d(12),
    },
    {
      userId: 'usr_amara',
      displayName: 'Amara Okafor',
      username: 'amara_speaks',
      avatarUrl:
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
      coverUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      bio: 'Social impact lead & educator in Lagos 🇳🇬. Championing tech literacy for girls and grassroots cross-continental exchange.',
      location: 'Lagos, Nigeria',
      website: 'https://amaraokafor.org',
      privacyVisibility: 'public',
      defaultPostVisibility: 'public',
      createdAt: d(240),
      updatedAt: d(24),
    },
  ];

  const groups: Group[] = [
    {
      id: 'grp_creatives',
      name: 'Global Creators & Visual Artists',
      slug: 'global-creatives',
      description:
        'A supportive international hub for photographers, digital painters, filmmakers, and storytellers sharing techniques, critiques, and collaborations.',
      coverUrl:
        'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1200&q=80',
      avatarUrl:
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
      creatorId: 'usr_elena',
      isPrivate: false,
      rules:
        '1. Be kind and constructive. 2. Credit original sources. 3. No spam or self-promotion without context.',
      createdAt: d(500),
      updatedAt: d(2),
    },
    {
      id: 'grp_indiedev',
      name: 'Indie Makers & Open Tech',
      slug: 'indie-makers',
      description:
        'Founders, developers, and designers building sustainable web and mobile products openly in public.',
      coverUrl:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      avatarUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      creatorId: 'usr_kenji',
      isPrivate: false,
      rules:
        'Share your milestones, ask for real feedback, and help fellow makers.',
      createdAt: d(400),
      updatedAt: d(10),
    },
    {
      id: 'grp_language',
      name: 'International Polyglots & Culture Exchange',
      slug: 'polyglots-culture',
      description:
        'Practice languages, discover customs, and connect with native speakers around the world. Friendly voice & chat sessions.',
      coverUrl:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      avatarUrl:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
      creatorId: 'usr_sofia',
      isPrivate: false,
      rules: 'Respect all cultural backgrounds and encourage learners.',
      createdAt: d(350),
      updatedAt: d(8),
    },
    {
      id: 'grp_sustainable',
      name: 'EcoLiving & Community Gardens',
      slug: 'ecoliving-gardens',
      description:
        'Private circle for urban farmers, permaculture enthusiasts, and zero-waste homesteaders.',
      coverUrl:
        'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
      avatarUrl:
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
      creatorId: 'usr_amara',
      isPrivate: true,
      rules:
        'Members must share a brief introduction to join. Local swaps and tips only.',
      createdAt: d(280),
      updatedAt: d(4),
    },
  ];

  const groupMembers: GroupMember[] = [
    {
      id: 'gm_1',
      groupId: 'grp_creatives',
      userId: 'usr_elena',
      role: 'admin',
      status: 'approved',
      joinedAt: d(500),
    },
    {
      id: 'gm_2',
      groupId: 'grp_creatives',
      userId: 'usr_marcus',
      role: 'moderator',
      status: 'approved',
      joinedAt: d(450),
    },
    {
      id: 'gm_3',
      groupId: 'grp_creatives',
      userId: 'usr_sofia',
      role: 'member',
      status: 'approved',
      joinedAt: d(400),
    },
    {
      id: 'gm_4',
      groupId: 'grp_indiedev',
      userId: 'usr_kenji',
      role: 'admin',
      status: 'approved',
      joinedAt: d(400),
    },
    {
      id: 'gm_5',
      groupId: 'grp_indiedev',
      userId: 'usr_marcus',
      role: 'member',
      status: 'approved',
      joinedAt: d(380),
    },
    {
      id: 'gm_6',
      groupId: 'grp_language',
      userId: 'usr_sofia',
      role: 'admin',
      status: 'approved',
      joinedAt: d(350),
    },
    {
      id: 'gm_7',
      groupId: 'grp_language',
      userId: 'usr_elena',
      role: 'member',
      status: 'approved',
      joinedAt: d(340),
    },
    {
      id: 'gm_8',
      groupId: 'grp_language',
      userId: 'usr_kenji',
      role: 'member',
      status: 'approved',
      joinedAt: d(320),
    },
    {
      id: 'gm_9',
      groupId: 'grp_sustainable',
      userId: 'usr_amara',
      role: 'admin',
      status: 'approved',
      joinedAt: d(280),
    },
    {
      id: 'gm_10',
      groupId: 'grp_sustainable',
      userId: 'usr_elena',
      role: 'member',
      status: 'approved',
      joinedAt: d(250),
    },
    {
      id: 'gm_11',
      groupId: 'grp_sustainable',
      userId: 'usr_marcus',
      role: 'member',
      status: 'pending',
      joinedAt: d(2),
    },
  ];

  const friendships: Friendship[] = [
    {
      id: 'fs_1',
      user1Id: 'usr_elena',
      user2Id: 'usr_marcus',
      createdAt: d(300),
    },
    {
      id: 'fs_2',
      user1Id: 'usr_elena',
      user2Id: 'usr_sofia',
      createdAt: d(280),
    },
    {
      id: 'fs_3',
      user1Id: 'usr_marcus',
      user2Id: 'usr_kenji',
      createdAt: d(200),
    },
    {
      id: 'fs_4',
      user1Id: 'usr_sofia',
      user2Id: 'usr_amara',
      createdAt: d(150),
    },
  ];

  const friendRequests: FriendRequest[] = [
    {
      id: 'fr_1',
      senderId: 'usr_kenji',
      receiverId: 'usr_elena',
      status: 'pending',
      createdAt: d(8),
      updatedAt: d(8),
    },
    {
      id: 'fr_2',
      senderId: 'usr_amara',
      receiverId: 'usr_marcus',
      status: 'pending',
      createdAt: d(4),
      updatedAt: d(4),
    },
  ];

  const posts: Post[] = [
    {
      id: 'post_1',
      authorId: 'usr_elena',
      content:
        'Golden hour over Manila Bay today. There is an unspoken poetry in the rhythm of our daily commute when the sky turns lavender and gold. 🌇\n\nHope everyone is finding quiet moments of inspiration amid the bustle!',
      mediaUrls: [
        'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=80',
      ],
      groupId: null,
      repostOfPostId: null,
      visibility: 'public',
      createdAt: d(6),
      updatedAt: d(6),
    },
    {
      id: 'post_2',
      authorId: 'usr_marcus',
      content:
        'Just shipped the first component library draft for our international platform! Design systems truly flourish when built with multi-lingual scripts and variable font optical sizes in mind from day one. What are your core guidelines when designing across boundaries?',
      mediaUrls: [],
      groupId: 'grp_creatives',
      repostOfPostId: null,
      visibility: 'group',
      createdAt: d(14),
      updatedAt: d(14),
    },
    {
      id: 'post_3',
      authorId: 'usr_sofia',
      content:
        'Morning walk through Gothic Quarter alleys in Barcelona. Warm espresso, freshly baked pan con tomate, and scribbling ideas for the new cultural dispatch series.',
      mediaUrls: [
        'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
      ],
      groupId: null,
      repostOfPostId: null,
      visibility: 'public',
      createdAt: d(22),
      updatedAt: d(22),
    },
    {
      id: 'post_4',
      authorId: 'usr_kenji',
      content:
        'Experimenting with local-first peer sync and lightweight client-side state. The modern web platform has progressed tremendously—building fast, resilient applications without heavy lock-in is more achievable than ever. 💻⚡',
      mediaUrls: [],
      groupId: 'grp_indiedev',
      repostOfPostId: null,
      visibility: 'group',
      createdAt: d(30),
      updatedAt: d(30),
    },
    {
      id: 'post_5',
      authorId: 'usr_amara',
      content:
        'Excited to announce our upcoming youth tech mentorship session in Lagos! We have 45 brilliant young women joining us to learn their first lines of code and build community problem-solving apps. “Bringing people closer” starts right here. 🌱✨',
      mediaUrls: [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      ],
      groupId: null,
      repostOfPostId: null,
      visibility: 'public',
      createdAt: d(40),
      updatedAt: d(40),
    },
  ];

  const comments: Comment[] = [
    {
      id: 'cmt_1',
      postId: 'post_1',
      authorId: 'usr_marcus',
      content:
        'Breathtaking light Elena! The subtle reflection on the water gives it incredible depth.',
      createdAt: d(5),
      updatedAt: d(5),
    },
    {
      id: 'cmt_2',
      postId: 'post_1',
      authorId: 'usr_sofia',
      content: 'I miss Manila so much! Need to visit again soon.',
      createdAt: d(4),
      updatedAt: d(4),
    },
    {
      id: 'cmt_3',
      postId: 'post_2',
      authorId: 'usr_kenji',
      content:
        'Right-to-left layout testing and bidirectional text support! Also testing font fallback cascades.',
      createdAt: d(12),
      updatedAt: d(12),
    },
    {
      id: 'cmt_4',
      postId: 'post_5',
      authorId: 'usr_elena',
      content:
        'Huge congratulations Amara! Inspiring work, wishing the cohort the absolute best.',
      createdAt: d(35),
      updatedAt: d(35),
    },
  ];

  const reactions: Reaction[] = [
    {
      id: 'rx_1',
      postId: 'post_1',
      userId: 'usr_marcus',
      type: 'love',
      createdAt: d(5),
    },
    {
      id: 'rx_2',
      postId: 'post_1',
      userId: 'usr_sofia',
      type: 'like',
      createdAt: d(4),
    },
    {
      id: 'rx_3',
      postId: 'post_1',
      userId: 'usr_kenji',
      type: 'celebrate',
      createdAt: d(3),
    },
    {
      id: 'rx_4',
      postId: 'post_2',
      userId: 'usr_elena',
      type: 'support',
      createdAt: d(13),
    },
    {
      id: 'rx_5',
      postId: 'post_5',
      userId: 'usr_elena',
      type: 'celebrate',
      createdAt: d(38),
    },
    {
      id: 'rx_6',
      postId: 'post_5',
      userId: 'usr_marcus',
      type: 'love',
      createdAt: d(36),
    },
  ];

  const conversations: Conversation[] = [
    {
      id: 'conv_1',
      createdAt: d(100),
      updatedAt: d(2),
      lastMessageAt: d(2),
    },
    {
      id: 'conv_2',
      createdAt: d(50),
      updatedAt: d(8),
      lastMessageAt: d(8),
    },
  ];

  const conversationMembers: ConversationMember[] = [
    {
      id: 'cm_1',
      conversationId: 'conv_1',
      userId: 'usr_elena',
      lastReadAt: d(2),
    },
    {
      id: 'cm_2',
      conversationId: 'conv_1',
      userId: 'usr_marcus',
      lastReadAt: d(1),
    },
    {
      id: 'cm_3',
      conversationId: 'conv_2',
      userId: 'usr_elena',
      lastReadAt: d(7),
    },
    {
      id: 'cm_4',
      conversationId: 'conv_2',
      userId: 'usr_sofia',
      lastReadAt: d(8),
    },
  ];

  const messages: Message[] = [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'usr_marcus',
      content:
        'Hi Elena! Did you see the new palette options for the KONEKTA project?',
      createdAt: d(4),
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1',
      senderId: 'usr_elena',
      content:
        'Yes! The midnight navy paired with turquoise and royal blue feels energetic and very crisp.',
      createdAt: d(3),
    },
    {
      id: 'msg_3',
      conversationId: 'conv_1',
      senderId: 'usr_marcus',
      content:
        'Awesome. I am finishing the responsive view tests now so everything feels effortless on both mobile and desktop.',
      createdAt: d(2),
    },
    {
      id: 'msg_4',
      conversationId: 'conv_2',
      senderId: 'usr_sofia',
      content:
        'Elena! Whenever you are in Europe next, we must organize a photography walk together.',
      createdAt: d(9),
    },
    {
      id: 'msg_5',
      conversationId: 'conv_2',
      senderId: 'usr_elena',
      content:
        'Count me in! I will bring my 35mm lens and we will find the best rooftop vistas.',
      createdAt: d(8),
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_1',
      recipientId: 'usr_elena',
      actorId: 'usr_kenji',
      type: 'friend_request',
      entityId: 'fr_1',
      text: 'Kenji Sato sent you a friend request.',
      isRead: false,
      createdAt: d(8),
    },
    {
      id: 'notif_2',
      recipientId: 'usr_elena',
      actorId: 'usr_marcus',
      type: 'post_reaction',
      entityId: 'post_1',
      text: 'Marcus Sterling loved your post.',
      isRead: false,
      createdAt: d(5),
    },
    {
      id: 'notif_3',
      recipientId: 'usr_elena',
      actorId: 'usr_marcus',
      type: 'post_comment',
      entityId: 'post_1',
      text: 'Marcus Sterling commented on your post.',
      isRead: true,
      createdAt: d(5),
    },
  ];

  return {
    users,
    profiles,
    posts,
    comments,
    reactions,
    friendRequests,
    friendships,
    groups,
    groupMembers,
    conversations,
    conversationMembers,
    messages,
    notifications,
    reports: [],
    blocks: [],
    otpCodes: [],
    passwordResetTokens: [],
  };
}

export function getDatabase(): DatabaseSchema {
  if (db) return db;
  ensureDirectoryExists();

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      return db!;
    } catch (e) {
      console.error('Failed reading database file, recreating seed:', e);
    }
  }

  db = createInitialDatabase();
  saveDatabase();
  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  ensureDirectoryExists();
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}
